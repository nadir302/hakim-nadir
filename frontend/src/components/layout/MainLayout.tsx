import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import NotificationCenter from '@/components/shared/NotificationCenter';
import {
  LayoutDashboard, Users, Calendar, Truck, UserCircle, Route,
  MapPin, Ticket, BarChart3, Menu, X, LogOut, Sun, Moon,
  ChevronDown, Bus, Shield, Settings, Radio, Navigation
} from 'lucide-react';

const roleMenuItems: Record<string, { label: string; path: string; icon: any }[]> = {
  SUPER_ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Events', path: '/admin/events', icon: Calendar },
    { label: 'Drivers', path: '/admin/drivers', icon: UserCircle },
    { label: 'Vehicles', path: '/admin/vehicles', icon: Truck },
    { label: 'Routes', path: '/admin/routes', icon: Route },
    { label: 'Pickup Points', path: '/admin/pickup-points', icon: MapPin },
    { label: 'Reservations', path: '/admin/reservations', icon: Ticket },
    { label: 'Trips', path: '/admin/trips', icon: Bus },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { label: 'Active Shuttles', path: '/admin/active-shuttles', icon: Radio },
  ],
  DRIVER: [
    { label: 'Dashboard', path: '/driver/dashboard', icon: LayoutDashboard },
    { label: 'My Trips', path: '/driver/trips', icon: Bus },
    { label: 'GPS Tracking', path: '/driver/tracking', icon: Navigation },
  ],
  EMPLOYEE: [
    { label: 'Dashboard', path: '/participant/dashboard', icon: LayoutDashboard },
    { label: 'My Bookings', path: '/participant/bookings', icon: Calendar },
    { label: 'My Tickets', path: '/participant/tickets', icon: Ticket },
  ],
};

const SIDEBAR_WIDTH = 256;

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const menuItems = roleMenuItems[user?.role || 'EMPLOYEE'] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-accent px-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary">
            <Bus className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold">Smart Shuttle</h2>
            <p className="truncate text-xs text-sidebar-foreground/60">{user?.role?.replace('_', ' ') || ''}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin px-3 py-4">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="mt-4 border-t border-sidebar-accent pt-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent"
            >
              {darkMode ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </nav>
      </aside>

      {/* Main wrapper */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex flex-1 items-center justify-between px-4 md:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
              <NotificationCenter />

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-accent"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-sm font-medium leading-tight">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs leading-tight text-muted-foreground">{user?.email}</p>
                  </div>
                  <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border bg-card shadow-lg animate-in fade-in slide-in-from-top-2">
                    <div className="border-b px-4 py-3">
                      <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                      >
                        <Shield className="h-4 w-4" /> Profile
                      </button>
                      <button
                        onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                      >
                        <Settings className="h-4 w-4" /> Settings
                      </button>
                    </div>
                    <div className="border-t p-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
