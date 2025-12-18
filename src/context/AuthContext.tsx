import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { API_BASE } from "../lib/api";

declare global {
  interface Window {
    google: any;
  }
}

export interface GoogleUser {
  id?: number;
  email: string;
  name: string;
  picture: string;
  role: string;
}

interface AuthContextType {
  user: GoogleUser | null;
  role?: string;
  isLoading: boolean;
  signInWithGoogle: () => void;
  signOut: () => void;
}

/**
 * ✅ IMPORTANT:
 * Do NOT use `undefined` here – it breaks Fast Refresh
 */
const AuthContext = createContext<AuthContextType>({
  user: null,
  role: undefined,
  isLoading: true,
  signInWithGoogle: () => { },
  signOut: () => { },
});

/* ===================== PROVIDER ===================== */

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const signInWithGoogle = () => {
    if (!window.google) {
      alert("Google script not loaded");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: any) => {
        try {
          setIsLoading(true);

          if (!response?.credential) {
            throw new Error("Google credential missing");
          }

          const apiResponse = await fetch(`${API_BASE}/auth/google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              credential: response.credential,
            }),
          });

          const data = await apiResponse.json();
          if (!apiResponse.ok) throw new Error(data.error);

          localStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user);
        } catch (err) {
          console.error("Login failed", err);
        } finally {
          setIsLoading(false);
        }
      },
    });

    window.google.accounts.id.prompt();
  };


  const signOut = () => {
    window.google?.accounts.id.disableAutoSelect();
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role,
        isLoading,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ===================== HOOK ===================== */

export const useAuth = () => useContext(AuthContext);
