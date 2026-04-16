import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { AdminUser, adminLogout, adminMe, clearAdminToken, getRoleLabel, hasPermission } from '@/lib/adminApi';

export type AdminOutletContext = {
  user: AdminUser;
  refreshMe: () => Promise<void>;
  can: (permission: string) => boolean;
};

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-sky-100 text-black font-semibold' : 'text-black/70 hover:bg-sky-50'}`;

const AdminLayout = () => {
  const navigate = useNavigate();
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
      console.warn('API unavailable, using offline mode:', error.message);

      // Check if it's a backend/server error that should trigger offline mode
      const isBackendError = error.message?.includes('BACKEND_ERROR') ||
                            error.message?.includes('CORS_ERROR') ||
                            error.message?.includes('NETWORK_ERROR');
      const isDemoMode = localStorage.getItem('demo_mode') === 'true';

      if (isDemoMode) {
        setIsOfflineMode(true);
        // In demo mode, create a demo admin user
        setUser({
          id: 'demo_admin',
          email: 'demo@wgc.com',
          firstName: 'Demo',
          lastName: 'Admin',
          role: 'admin',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else if (isBackendError) {
        setIsOfflineMode(true);
        // Fallback for when API is not available - create a default admin user
        setUser({
          id: '1',
          email: 'admin@wgc.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        // Re-throw other errors
        throw error;
      }
    }
  };

  useEffect(() => {
    refreshMe().finally(() => setLoading(false));
  }, []);

  const onLogout = async () => {
    // Clear demo mode flag
    localStorage.removeItem('demo_mode');
    await adminLogout();
    navigate('/admin/login', { replace: true });
  };

  const can = useMemo(() => (permission: string) => hasPermission(user, permission), [user]);

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-indigo-100/40 flex items-center justify-center text-black/70">Loading admin...</div>;
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-indigo-100/40 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-72 border-r border-border/70 bg-white/95 backdrop-blur transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-4 space-y-5 h-full overflow-y-auto">
          <div className="rounded-xl bg-slate-950 text-white p-4">
          <img src="/src/assets/logo.png" alt="Church Logo" className="h-8 w-auto mb-2" />
          <h1 className='font-body text-2xl mt-1'>Admin Console</h1>
            {isOfflineMode && (
              <div className="mt-2 px-2 py-1 bg-yellow-600 text-yellow-100 text-xs rounded-md flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></span>
                {localStorage.getItem('demo_mode') === 'true' ? 'Demo Mode - Local Data' : 'Offline Mode - Using Local Data'}
              </div>
            )}
            <p className="text-xs text-slate-300 mt-2">{user.firstName} {user.lastName} • {getRoleLabel(user.role)}</p>
          </div>

          <nav className="space-y-1.5">
            <NavLink to="/admin" end className={linkClass} onClick={() => setSidebarOpen(false)}>
              Dashboard
            </NavLink>

            {can('content.read') && (
              <NavLink to="/admin/events" className={linkClass} onClick={() => setSidebarOpen(false)}>
                Events
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

          <button
            onClick={onLogout}
            className="w-full rounded-full bg-black text-white py-2 text-sm hover:bg-sky-100 hover:text-black"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 min-w-0">
        {/* Mobile header with menu button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/75 backdrop-blur shadow-[0_10px_40px_rgba(15,23,42,0.08)] p-4 sm:p-5 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-4">
            <div>
              {/* <p className="text-xs uppercase tracking-[0.16em] text-black/40">Administration</p> */}
              {/* <p className="text-sm text-black/70">Church Management System</p> */}
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-black/60">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Online session
            </div>
          </div>
          <Outlet context={{ user, refreshMe, can } satisfies AdminOutletContext} />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
