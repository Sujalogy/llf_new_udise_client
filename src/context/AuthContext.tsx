// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import { api, API_BASE } from "../lib/api";

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
          auto_select: true,
          itp_support: true,
          use_fedcm_for_prompt: true,
        });

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

  // 2. Check session on mount using Axios
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Uses the api.getMe() helper we built in the axios refactor
        const data = await api.getMe();
        setUser(data.user);
      } catch (err: any) {
        // If 401, user is just not logged in, no need for console error
        if (err.status !== 401) {
          console.error("Initial auth check failed", err);
        }
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // 3. Handle Google Login Callback
  const handleGoogleResponse = async (response: any) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      // Decode payload to check domain before hitting backend
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));

      if (!payload.email.endsWith("@languageandlearningfoundation.org")) {
        setAuthError("Unauthorized domain. Please use your official email.");
        setIsLoading(false);
        return;
      }

      // Hit backend using Axios
      // Note: We use axios directly here because this is a specific login call
      const res = await axios.post(`${API_BASE}/auth/google`, 
        { credential: response.credential },
        { withCredentials: true } // Ensures cookie is accepted and stored
      );

      setUser(res.data.user);
    } catch (err: any) {
      // Extract error message from Axios error
      const message = err.response?.data?.message || err.response?.data?.error || "Login failed.";
      setAuthError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderGoogleButton = (containerId: string) => {
    if (window.google) {
      window.google.accounts.id.renderButton(
        document.getElementById(containerId)!,
        {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: "350",
          use_fedcm_for_button: true
        }
      );
    }
  };

  const signOut = async () => {
    try {
      // Post to logout endpoint with credentials
      await axios.post(`${API_BASE}/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      // Always clear state regardless of API success
      setUser(null);
      setAuthError(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      role: user?.role, 
      isLoading, 
      authError, 
      setAuthError, 
      renderGoogleButton, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);