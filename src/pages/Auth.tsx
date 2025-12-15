import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";

export default function Auth() {
  const { signInWithGoogle, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const ALLOWED_DOMAIN = "languageandlearningfoundation.org"

  // Redirect if logged in
  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleGoogleSignIn = () => {
    setIsSigningIn(true);
    setAuthError(null);

    try {
      signInWithGoogle();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";

      setAuthError(message);
      toast({
        title: "Authentication Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-primary mb-4">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">School Data Management</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to access the dashboard
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border p-8 shadow-sm">
          <div className="space-y-6">
            {/* Error */}
            {authError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">
                    Sign in failed
                  </p>
                  <p className="text-sm text-destructive/80 mt-1">
                    {authError}
                  </p>
                </div>
              </div>
            )}

            {/* Button */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn || isLoading}
              className="w-full h-12 gap-3"
              size="lg"
            >
              {isSigningIn ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Signing in...
                </>
              ) : (
                <>
                  {/* Google Icon */}
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Contact your administrator if you need access.
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Language & Learning Foundation
        </p>
      </div>
    </div>
  );
}
