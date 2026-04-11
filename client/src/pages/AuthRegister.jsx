import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api.js';
import { useAuthStore } from '../store/authStore.js';
import { AuthShell } from '../components/auth/AuthShell.jsx';
import { AuthNameField, AuthEmailField, AuthPasswordField } from '../components/auth/AuthFields.jsx';
import { AuthSocialRow } from '../components/auth/AuthSocialRow.jsx';

export function AuthRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      setAuth(data.token, data.user);
      toast.success('Account created');
      navigate('/app');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Sign up"
      subtitle="Create your DevFlow workspace and start shipping with issues, chat, GitHub context, and AI in one place."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-400 transition hover:text-blue-300">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthNameField value={name} onChange={(e) => setName(e.target.value)} />
        <AuthEmailField value={email} onChange={(e) => setEmail(e.target.value)} />
        <AuthPasswordField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          show={showPassword}
          onToggleShow={() => setShowPassword((s) => !s)}
          placeholder="Create a password (min 8 characters)"
          autoComplete="new-password"
          minLength={8}
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-800 py-3.5 text-sm font-semibold text-white transition hover:border-white/[0.12] hover:bg-zinc-700 hover:shadow-[0_0_32px_-10px_rgba(59,130,246,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <AuthSocialRow />
    </AuthShell>
  );
}
