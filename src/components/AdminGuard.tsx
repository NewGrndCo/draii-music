import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Lock, Loader2 } from 'lucide-react';

const TOKEN_KEY = 'admin_auth_token';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const verify = async () => {
      const token = sessionStorage.getItem(TOKEN_KEY);
      if (!token) {
        setChecking(false);
        return;
      }
      try {
        const { data, error } = await supabase.functions.invoke('admin-auth', {
          body: { action: 'verify', token },
        });
        if (!error && data?.valid) {
          setAuthed(true);
        } else {
          sessionStorage.removeItem(TOKEN_KEY);
        }
      } catch {
        sessionStorage.removeItem(TOKEN_KEY);
      } finally {
        setChecking(false);
      }
    };
    verify();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: { action: 'login', password },
      });
      if (error || !data?.token) {
        toast.error('Invalid password');
        return;
      }
      sessionStorage.setItem(TOKEN_KEY, data.token);
      setAuthed(true);
      toast.success('Welcome back');
    } catch {
      toast.error('Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black text-white">
        <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black text-white p-4">
        <Card className="w-full max-w-sm bg-black/50 border border-purple-500/20 p-6 backdrop-blur-md">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
              <Lock className="h-5 w-5 text-purple-300" />
            </div>
            <h1 className="text-xl font-semibold">Admin access</h1>
            <p className="text-sm text-white/60 mt-1">Enter the admin password to continue.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <Input
              type="password"
              autoFocus
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/40 border-white/10 text-white"
            />
            <Button
              type="submit"
              disabled={submitting || !password}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;
