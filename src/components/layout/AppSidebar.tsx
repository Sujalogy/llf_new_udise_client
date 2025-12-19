import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, RefreshCw, School, Settings, GraduationCap, LogOut, User, Shield, AlertCircle, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { useAuth } from '../../context/AuthContext';

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'user';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Main Navigation Logic
  const navigation = [
    ...(role === 'admin' ? [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Admin Sync', href: '/admin-sync', icon: RefreshCw },
    ] : []),
    { name: 'My Schools', href: '/my-schools', icon: School },
    { name: 'Skipped UDISE', href: '/admin/skipped', icon: AlertCircle },
    ...(role === 'admin' ? [
      { name: 'User Management', href: '/admin/users', icon: Users },
    ] : []),
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
          <GraduationCap className="h-6 w-6 text-primary" />
          <h1 className="font-bold">LLF UDISE</h1>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-sidebar-accent'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {user?.email?.[0].toUpperCase()}
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{role}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}