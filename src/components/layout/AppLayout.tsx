import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AIAssistant } from './AIAssistant';
import { useAuth } from '../../context/AuthContext';

export function AppLayout() {
  const { role } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <div className="p-8">
          <Outlet />
        </div>
        {role === 'admin' && <AIAssistant />}
      </main>
    </div>
  );
}
