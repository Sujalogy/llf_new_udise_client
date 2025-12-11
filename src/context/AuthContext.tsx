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
  role: string;
}

interface AuthContextType {
  user: GoogleUser | null;
  isLoading: boolean;
  signInWithGoogle: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const GOOGLE_CLIENT_ID = "744649436990-ao0of92288tsqgjar4vcfr42p46npc44.apps.googleusercontent.com"

  // 2. Load the Google Script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Optional: Auto-initialize if you want OneTap immediately, otherwise wait for button click
      console.log("Google Identity Script loaded");
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // 3. Load stored user on mount
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

  // 4. Main Sign In Function
  const signInWithGoogle = () => {
    // Check if script is loaded using window.google
    if (!window.google) {
      alert("Google Sign-In script not loaded yet. Please refresh.");
      return;
    }

    console.log("Initializing Google Sign-In...");
    
    // Use window.google here to fix TS error "Cannot find name 'google'"
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      use_fedcm_for_prompt: false, // Fix for "FedCM get() rejects" error
      callback: async (response: any) => {
        try {
          setIsLoading(true);
          console.log("Received Google Credential, verifying with backend...");

          // SEND TOKEN TO BACKEND
          const apiResponse = await fetch('http://localhost:3000/api/auth/google', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ credential: response.credential }),
          });

          const data = await apiResponse.json();

          if (!apiResponse.ok) {
            throw new Error(data.error || 'Login failed');
          }

          // Save session token and user data
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          
          setUser(data.user);
          console.log("Login Successful!");

        } catch (error) {
          console.error("Login Error:", error);
          alert("Authentication failed: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
          setIsLoading(false);
        }
      },
    });

    // Trigger the prompt
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed()) {
        console.log("Prompt not displayed reason:", notification.getNotDisplayedReason());
      }
    });
  };

  const signOut = () => {
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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