import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin, demoLogin } from '@/lib/adminApi';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('psalmueloye@gmail.com');
  const [password, setPassword] = useState('ManOnMission@123!');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showDemoLogin, setShowDemoLogin] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await adminLogin(email, password);
      navigate('/admin', { replace: true });
    } catch (e: any) {
      let errorMessage = e?.message || 'Login failed';

      // Check if it's a backend connectivity issue
      if (errorMessage.includes('CORS_ERROR') ||
          errorMessage.includes('BACKEND_ERROR') ||
          errorMessage.includes('NETWORK_ERROR')) {
        setError(`${errorMessage} Use demo login below for testing.`);
        setShowDemoLogin(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onDemoLogin = async () => {
    setSubmitting(true);
    setError('');

    try {
      await demoLogin();
      navigate('/admin', { replace: true });
    } catch (e: any) {
      setError('Demo login failed: ' + (e?.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-indigo-100/40 flex items-center justify-center px-4 py-10">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-white/50 bg-white/90 backdrop-blur shadow-[0_20px_60px_rgba(15,23,42,0.15)] p-7 space-y-5">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-black/40">Church Management System</p>
          <h1 className="font-body text-4xl text-black">Admin Portal</h1>
          <p className="text-sm text-black/70">Sign in to manage events, media, forms, testimonies, and dynamic pages.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            required
          />
        </div>

        {error ? <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-black text-white py-2.5 text-sm font-semibold hover:bg-sky-100 hover:text-black transition-colors disabled:opacity-60"
        >
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>

        {showDemoLogin && (
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-2">Backend unavailable? Try demo mode:</p>
              <button
                type="button"
                onClick={onDemoLogin}
                disabled={submitting}
                className="w-full rounded-full bg-yellow-600 text-white py-2.5 text-sm font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-60"
              >
                {submitting ? 'Loading Demo...' : 'Demo Login (Offline Mode)'}
              </button>
              <p className="text-xs text-slate-400 mt-2">Access admin features with local data</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AdminLogin;
