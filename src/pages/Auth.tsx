// src/pages/Auth.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, AlertCircle, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "../hooks/use-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "../components/ui/alert-dialog";

export default function Auth() {
  const { isLoading, user, authError, setAuthError, renderGoogleButton } = useAuth();
  const navigate = useNavigate();
  const [isWaitingList, setIsWaitingList] = useState(false);

  // Render the official Google Button when the container is ready
  useEffect(() => {
    if (!isLoading && !user) {
      const timer = setTimeout(() => {
        renderGoogleButton("google-button-container");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, user, renderGoogleButton]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      const target = user.role === 'admin' ? "/dashboard" : "/my-schools";
      navigate(target, { replace: true });
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (authError) {
      const msg = authError.toLowerCase();
      if (msg.includes("waiting") || msg.includes("sujal")) {
        setIsWaitingList(true);
      } else {
        toast({
          title: "Authentication Error",
          description: authError,
          variant: "destructive",
        });
      }
    }
  }, [authError]);

  const handleClose = () => {
    setIsWaitingList(false);
    setAuthError(null);
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-primary mb-4">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">School Directory</h1>
          <p className="text-muted-foreground mt-2">Sign in to access the dashboard</p>
        </div>

        <div className="rounded-xl border p-8 shadow-sm">
          <div className="space-y-6 flex flex-col items-center">
            {authError && !isWaitingList && (
              <div className="w-full rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{authError}</p>
              </div>
            )}

            {/* Official Google Button Container */}
            <div id="google-button-container" className="w-full flex justify-center min-h-[44px]" />
          </div>
        </div>

        <AlertDialog open={isWaitingList} onOpenChange={setIsWaitingList}>
          <AlertDialogContent>
            <AlertDialogHeader className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <AlertDialogTitle className="text-xl">Access Pending</AlertDialogTitle>
              <AlertDialogDescription className="text-center text-base pt-2 text-foreground">
                {authError}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center">
              <AlertDialogAction onClick={handleClose} className="bg-amber-600 hover:bg-amber-700">
                Understood
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <p className="text-center text-sm text-muted-foreground mt-6">LLF Foundation</p>
      </div>
    </div>
  );
}