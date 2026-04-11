import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api.js';
import { useAuthStore } from '../store/authStore.js';
import { AuthShell } from '../components/auth/AuthShell.jsx';
import { AuthEmailField, AuthPasswordField } from '../components/auth/AuthFields.jsx';
import { AuthSocialRow } from '../components/auth/AuthSocialRow.jsx';

export function AuthLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from?.pathname || '/app';

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.token, data.user);
      toast.success('Welcome back');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Log in"
      subtitle="Log into your account and seamlessly continue managing your projects, ideas, and progress just where you left off."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-blue-400 transition hover:text-blue-300">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthEmailField value={email} onChange={(e) => setEmail(e.target.value)} />
        <AuthPasswordField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          show={showPassword}
          onToggleShow={() => setShowPassword((s) => !s)}
          autoComplete="current-password"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-800 py-3.5 text-sm font-semibold text-white transition hover:border-white/[0.12] hover:bg-zinc-700 hover:shadow-[0_0_32px_-10px_rgba(59,130,246,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Log in'}
        </button>
      </form>
      <AuthSocialRow />
    </AuthShell>
  );
}
