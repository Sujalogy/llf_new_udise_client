import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// 1. Declare window extension so TS knows about window.google
declare global {
  interface Window {
    google: any;
  }
}

interface GoogleUser {
  id: number;
  email: string;
  name: string;
  picture: string;
  role: string; // Ensure this exists
}

interface AuthContextType {
  user: GoogleUser | null;
  role: string | undefined; // <--- ADDED THIS
  isLoading: boolean;
  signInWithGoogle: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to parse JWT", e);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const GOOGLE_CLIENT_ID = "744649436990-ao0of92288tsqgjar4vcfr42p46npc44.apps.googleusercontent.com";

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => console.log("Google Identity Script loaded");
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const signInWithGoogle = () => {
    if (!window.google) return alert("Google Sign-In script not loaded.");
    
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      use_fedcm_for_prompt: false,
      callback: async (response: any) => {
        try {
          setIsLoading(true);
          const payload = parseJwt(response.credential);
          if (!payload) throw new Error("Invalid token");

          const userData = {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            googleId: payload.sub
          };

          const apiResponse = await fetch('http://localhost:3000/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          });

          const data = await apiResponse.json();
          if (!apiResponse.ok) throw new Error(data.error || 'Login failed');

          localStorage.setItem("authToken", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          
          setUser(data.user); // data.user includes 'role' from backend
          
        } catch (error) {
          console.error("Login Error:", error);
          alert("Login failed");
        } finally {
          setIsLoading(false);
        }
      },
    });

    window.google.accounts.id.prompt();
  };

  const signOut = () => {
    if (window.google) window.google.accounts.id.disableAutoSelect();
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role, // <--- IMPORTANT: Pass role directly here
        isLoading,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
} 