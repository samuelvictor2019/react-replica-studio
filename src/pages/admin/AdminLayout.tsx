import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { AdminUser, adminLogout, adminMe, getRoleLabel, hasPermission } from '@/lib/adminApi';
import { useTheme } from '@/components/ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { getStorageItem, removeStorageItem } from '@/lib/storage';

export type AdminOutletContext = {
  user: AdminUser;
  refreshMe: () => Promise<void>;
  can: (permission: string) => boolean;
};

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-[12px] text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
    isActive 
      ? 'bg-primary text-primary-foreground shadow-sm' 
      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  }`;

const AdminLayout = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const refreshMe = async () => {
    try {
      const me = await adminMe();
      setUser(me.admin);
      setIsOfflineMode(false);
    } catch (error: any) {
      console.error('API unavailable:', error.message);
      // Let the app handle the failure naturally instead of using a hardcoded fallback user
      throw error;
    }
  };

  useEffect(() => {
    refreshMe().finally(() => setLoading(false));
  }, []);

  const onLogout = async () => {
    // Clear demo mode flag
    removeStorageItem('demo_mode', 'local');
    await adminLogout();
    navigate('/admin/login', { replace: true });
  };

  const can = useMemo(() => (permission: string) => hasPermission(user, permission), [user]);

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-indigo-100/40 flex items-center justify-center text-muted-foreground">Loading admin...</div>;
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  const demoModeLabel = getStorageItem('demo_mode', 'local') === 'true' ? 'Demo Mode - Local Data' : 'Offline Mode - Using Local Data';

  return (
    <div className="min-h-screen bg-background flex font-sans text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-[280px] border-r border-border bg-card transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-5 space-y-6 h-full flex flex-col overflow-y-auto custom-scrollbar">
          <div className="rounded-xl bg-slate-950 text-white p-4">
            <img src="/src/assets/logo.png" alt="Church Logo" className="h-8 w-auto mb-2" />
            <h1 className='font-body text-2xl mt-1'>Admin Console</h1>
            {isOfflineMode && (
              <div className="mt-2 px-2 py-1 bg-yellow-600 text-yellow-100 text-xs rounded-md flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></span>
                {demoModeLabel}
              </div>
            )}
            <p className="text-xs text-slate-300 mt-2">{user.firstName} {user.lastName} • {getRoleLabel(user.role)}</p>
          </div>

          <nav className="space-y-1 flex-1">
            <NavLink to="/admin" end className={linkClass} onClick={() => setSidebarOpen(false)}>
              Dashboard
            </NavLink>

            {can('content.read') && (
              <NavLink to="/admin/events" className={linkClass} onClick={() => setSidebarOpen(false)}>
                Events
              </NavLink>
            )}
            {can('content.read') && (
              <NavLink to="/admin/event-types" className={linkClass} onClick={() => setSidebarOpen(false)}>
                Event Types
              </NavLink>
            )}
            {can('content.read') && (
              <NavLink to="/admin/media" className={linkClass} onClick={() => setSidebarOpen(false)}>
                Media
              </NavLink>
            )}
            {can('content.read') && (
              <NavLink to="/admin/members" className={linkClass} onClick={() => setSidebarOpen(false)}>
                New Members
              </NavLink>
            )}
            {can('testimonies.read') && (
              <NavLink to="/admin/testimonies" className={linkClass} onClick={() => setSidebarOpen(false)}>
                Testimonies
              </NavLink>
            )}
            {can('dashboard.read') && (
              <NavLink to="/admin/analytics" className={linkClass} onClick={() => setSidebarOpen(false)}>
                Analytics
              </NavLink>
            )}
            {can('forms.read') && (
              <NavLink to="/admin/forms" className={linkClass} onClick={() => setSidebarOpen(false)}>
                Forms
              </NavLink>
            )}
            {can('appointments.read') && (
              <NavLink to="/admin/appointments" className={linkClass} onClick={() => setSidebarOpen(false)}>
                Appointments
              </NavLink>
            )}
            {can('users.read') && (
              <NavLink to="/admin/users" className={linkClass} onClick={() => setSidebarOpen(false)}>
                Users & Roles
              </NavLink>
            )}
            {can('users.update') && (
              <NavLink to="/admin/settings" className={linkClass} onClick={() => setSidebarOpen(false)}>
                Settings
              </NavLink>
            )}
          </nav>

          <div className="mt-auto pt-4">
            <button
              onClick={onLogout}
              className="w-full rounded-[12px] bg-secondary border border-border text-secondary-foreground py-2.5 text-sm font-medium hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-200 active:scale-[0.98]"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 min-w-0">
        {/* Mobile header with menu button */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-white hover:bg-white transition-all duration-300 text-slate-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-sm font-semibold">Menu</span>
          </button>
        </div>

        <div className="rounded-[16px] border border-border bg-card shadow-sm p-6 sm:p-8 min-h-[calc(100vh-6rem)] relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-4">
            <div>
              {/* <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Administration</p> */}
              {/* <p className="text-sm text-muted-foreground">Church Management System</p> */}
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Online session
              </div>
              
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
                className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors border border-border flex items-center justify-center shadow-sm"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Outlet context={{ user, refreshMe, can } satisfies AdminOutletContext} />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
