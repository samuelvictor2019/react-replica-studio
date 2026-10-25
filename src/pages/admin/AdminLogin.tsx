import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '@/lib/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('psalmueloye@gmail.com');
  const [password, setPassword] = useState('ManOnMission@123!');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');

    try {
      await adminLogin(email, password);
      navigate('/admin', { replace: true });
    } catch (e: any) {
      setError(e?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">Administration</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sign In</h1>
        </div>

        <form onSubmit={onSubmit} className="rounded-[16px] bg-card border border-border ring-1 ring-inset ring-border/50 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error ? <p className="text-sm text-destructive font-medium">{error}</p> : null}

          <Button
            type="submit"
            className="w-full mt-4"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
