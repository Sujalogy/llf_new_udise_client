import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  RefreshCw,
  School,
  Settings,
  Database,
  GraduationCap,
  LogOut,
  User,
  Shield,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { useAuth } from '../../context/AuthContext';

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const role = (user as any)?.role || 'user'; // Extract role from user or default to 'user'

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Navigation items based on role
  const navigation = [
    // Admin-only items
    ...(role === 'admin'
      ? [
          { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { name: 'Admin Sync', href: '/admin-sync', icon: RefreshCw },
        ]
      : []),
    // All users can see My Schools
    { name: 'My Schools', href: '/my-schools', icon: School },
  ];

  const secondaryNav = role === 'admin' ? [{ name: 'Settings', href: '/settings', icon: Settings }] : [];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-sidebar-foreground">School Data</h1>
            <p className="text-xs text-sidebar-foreground/60">Management System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
            Main Menu
          </p>
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}

          {secondaryNav.length > 0 && (
            <>
              <div className="my-4 border-t border-sidebar-border" />

              <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
                System
              </p>
              {secondaryNav.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User Section */}
        <div className="border-t border-sidebar-border p-4">
          {/* Role Badge */}
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-sidebar-accent/30 px-3 py-2">
            {role === 'admin' ? (
              <Shield className="h-4 w-4 text-accent" />
            ) : (
              <User className="h-4 w-4 text-sidebar-foreground/70" />
            )}
            <span className="text-xs font-medium text-sidebar-foreground capitalize">
              {role || 'User'}
            </span>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent">
                  <span className="text-sm font-medium text-sidebar-accent-foreground">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 text-left">
                  <p className="truncate text-sm font-medium">{user?.email?.split('@')[0]}</p>
                  <p className="truncate text-xs text-sidebar-foreground/50">
                    @languageandlearning...
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground capitalize">Role: {role || 'User'}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Database Status */}
          <div className="mt-3 flex items-center gap-3 rounded-lg bg-sidebar-accent/30 p-3">
            <Database className="h-5 w-5 text-accent" />
            <div>
              <p className="text-xs font-medium text-sidebar-foreground">Database Status</p>
              <p className="text-xs text-success">Connected</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
