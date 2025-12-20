import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SyncProvider } from "./context/SyncContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";

// Page Imports
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import MySchools from "./pages/MySchools";
import SchoolDetail from "./pages/SchoolDetail";
import AdminSync from "./pages/AdminSync";
import AdminUsers from "./pages/AdminUsers";
import Monitoring from "./pages/Monitoring"; // [NEW]
import DcfDetails from "./pages/DcfDetails"; // [NEW]
import SkippedSchools from "./pages/SkippedSchools";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SyncProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/my-schools" element={<MySchools />} />
                <Route path="/school/:schoolId" element={<SchoolDetail />} />
                <Route path="/dcf-details" element={<DcfDetails />} /> {/* [NEW] */}

                {/* Admin Specific Routes */}
                <Route path="/admin-sync" element={<AdminSync />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/monitoring" element={<Monitoring />} /> {/* [NEW] */}
                <Route path="/admin/skipped" element={<SkippedSchools />} />

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SyncProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;