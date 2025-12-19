// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { API_BASE } from "../lib/api";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
        };
      };
    };
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
  authError: string | null;
  setAuthError: (err: string | null) => void;
  renderGoogleButton: (containerId: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: undefined,
  isLoading: true,
  authError: null,
  setAuthError: () => { },
  renderGoogleButton: () => { },
  signOut: () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // 1. Initialize Google Identity Services
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: true, // Automatically logs in returning users
          itp_support: true,
          use_fedcm_for_prompt: true, // [FIX] Enables FedCM to avoid NetworkErrors
        });

        // Optional: Trigger One Tap prompt on load
        window.google.accounts.id.prompt((notification) => {
          console.log("Google prompt notification:", notification);
        });
      }
    };
    document.head.appendChild(script);
    return () => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) document.head.removeChild(existingScript);
    };
  }, []);

  // 2. Check session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Initial auth check failed", err);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleGoogleResponse = async (response: any) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const apiRes = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await apiRes.json();
      if (!apiRes.ok) {
        setAuthError(data.message || data.error);
        return;
      }
      setUser(data.user);
    } catch (err: any) {
      setAuthError("Failed to connect to authentication server.");
    } finally {
      setIsLoading(false);
    }
  };

  // [NEW] Helper to render the personalized "Continue as..." button
  const renderGoogleButton = (containerId: string) => {
    if (window.google) {
      window.google.accounts.id.renderButton(
        document.getElementById(containerId)!,
        {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with", // Shows user name/picture if known
          shape: "rectangular",
          width: "350",
          use_fedcm_for_button: true
        }
      );
    }
  };

  const signOut = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
    } finally {
      setUser(null);
      setAuthError(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role, isLoading, authError, setAuthError, renderGoogleButton, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);