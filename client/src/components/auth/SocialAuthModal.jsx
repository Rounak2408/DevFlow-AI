import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Key, Check, AlertCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../lib/api.js';
import { useAuthStore } from '../../store/authStore.js';

function IconGoogle() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function IconApple() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

export function SocialAuthModal({ isOpen, onClose, initialProvider = 'google' }) {
  const [provider, setProvider] = useState(initialProvider);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');

  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from?.pathname || '/app';

  useEffect(() => {
    setProvider(initialProvider);
  }, [initialProvider]);

  useEffect(() => {
    const saved = localStorage.getItem('devflow_google_client_id') || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    setGoogleClientId(saved);
  }, []);

  const handleSaveClientId = (val) => {
    setGoogleClientId(val);
    localStorage.setItem('devflow_google_client_id', val.trim());
    toast.success('Google Client ID saved locally');
  };

  const handleOfficialGoogleSignIn = () => {
    const activeClientId = googleClientId.trim() || import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!activeClientId) {
      toast.error('Please configure your Google Client ID first');
      setShowConfig(true);
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      toast.error('Google Sign-In SDK is loading. Please try again in a moment.');
      return;
    }

    setLoading(true);
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: activeClientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse?.error) {
            setLoading(false);
            toast.error(tokenResponse.error_description || 'Google sign in was cancelled or failed');
            return;
          }
          if (tokenResponse?.access_token) {
            try {
              const { data } = await api.post('/auth/google', { accessToken: tokenResponse.access_token });
              setAuth(data.token, data.user);
              toast.success(`Welcome, ${data.user.name || 'Developer'}!`);
              onClose();
              navigate(from, { replace: true });
            } catch (err) {
              toast.error(err.message || 'Authentication with backend failed');
            } finally {
              setLoading(false);
            }
          }
        },
      });
      client.requestAccessToken();
    } catch (e) {
      setLoading(false);
      toast.error(e.message || 'Could not launch Google Sign-In popup');
    }
  };

  const handleDirectSocialLogin = async (e) => {
    e?.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      let endpoint = '/auth/social';
      let payload = {
        provider,
        email: cleanEmail,
        name: name.trim() || cleanEmail.split('@')[0],
      };

      if (provider === 'google') {
        endpoint = '/auth/google';
        payload = { email: cleanEmail, name: name.trim() || cleanEmail.split('@')[0] };
      } else if (provider === 'facebook') {
        endpoint = '/auth/facebook';
        payload = { email: cleanEmail, name: name.trim() || 'Facebook User' };
      }

      const { data } = await api.post(endpoint, payload);
      setAuth(data.token, data.user);
      toast.success(`Signed in as ${data.user.name || data.user.email}!`);
      onClose();
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-[26px] border border-white/[0.1] bg-zinc-900/95 p-6 shadow-2xl backdrop-blur-xl ring-1 ring-white/[0.08] sm:p-7"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.07]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-white">Sign In with Social Account</h3>
                <p className="text-[12px] text-zinc-400">Fast, passwordless sign-in for DevFlow</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Provider selector tabs */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setProvider('google')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-[12px] font-medium transition ${
                provider === 'google'
                  ? 'border border-blue-500/40 bg-blue-500/15 text-blue-300 shadow-[0_0_20px_-5px_rgba(59,130,246,0.4)]'
                  : 'border border-white/[0.08] bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <IconGoogle />
              Google
            </button>
            <button
              type="button"
              onClick={() => setProvider('facebook')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-[12px] font-medium transition ${
                provider === 'facebook'
                  ? 'border border-blue-500/40 bg-blue-500/15 text-blue-300 shadow-[0_0_20px_-5px_rgba(59,130,246,0.4)]'
                  : 'border border-white/[0.08] bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <IconFacebook />
              Facebook
            </button>
            <button
              type="button"
              onClick={() => setProvider('apple')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-[12px] font-medium transition ${
                provider === 'apple'
                  ? 'border border-blue-500/40 bg-blue-500/15 text-blue-300 shadow-[0_0_20px_-5px_rgba(59,130,246,0.4)]'
                  : 'border border-white/[0.08] bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <IconApple />
              Apple
            </button>
          </div>

          {/* Provider Body */}
          <div className="mt-5 space-y-4">
            {provider === 'google' && (
              <div>
                {/* Official Google OAuth Button */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleOfficialGoogleSignIn}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white py-3 px-4 text-xs font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-100 disabled:opacity-50"
                >
                  <IconGoogle />
                  <span>{loading ? 'Authenticating…' : 'Continue with Google Account'}</span>
                </button>

                <div className="relative my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                    Or sign in with Gmail
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <form onSubmit={handleDirectSocialLogin} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Your Gmail address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rounakkeshri79@gmail.com"
                      className="w-full rounded-xl border border-white/[0.1] bg-zinc-800/90 py-2.5 px-3.5 text-xs text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Full Name (optional)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rounak Keshri"
                      className="w-full rounded-xl border border-white/[0.1] bg-zinc-800/90 py-2.5 px-3.5 text-xs text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-600/80 hover:bg-blue-600 py-2.5 text-xs font-semibold text-white transition disabled:opacity-50"
                  >
                    <span>{loading ? 'Signing in…' : 'Sign in with this Gmail'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </form>

                {/* Google Client ID config toggler */}
                <div className="mt-4 pt-3 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setShowConfig(!showConfig)}
                    className="text-[11px] flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition"
                  >
                    <Key className="h-3 w-3" />
                    <span>Configure Google OAuth Client ID (optional)</span>
                  </button>

                  {showConfig && (
                    <div className="mt-2.5 rounded-xl border border-white/[0.08] bg-zinc-950/60 p-3 space-y-2">
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        To enable the native Google Account popup in production, paste your Google Cloud OAuth Client ID:
                      </p>
                      <input
                        type="text"
                        value={googleClientId}
                        onChange={(e) => handleSaveClientId(e.target.value)}
                        placeholder="xxxx.apps.googleusercontent.com"
                        className="w-full rounded-lg border border-white/[0.1] bg-zinc-900 py-1.5 px-2.5 text-[11px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                      />
                      <p className="text-[10px] text-zinc-500">
                        Saved in your browser for testing. Can also be set in <code className="text-zinc-400">client/.env</code> as <code className="text-zinc-400">VITE_GOOGLE_CLIENT_ID</code>.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {provider === 'facebook' && (
              <form onSubmit={handleDirectSocialLogin} className="space-y-3">
                <p className="text-[12px] text-zinc-400 leading-relaxed">
                  Sign in or create an account linked to your Facebook profile:
                </p>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Facebook Account Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@facebook.com"
                    className="w-full rounded-xl border border-white/[0.1] bg-zinc-800/90 py-2.5 px-3.5 text-xs text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full rounded-xl border border-white/[0.1] bg-zinc-800/90 py-2.5 px-3.5 text-xs text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-blue-600/40 bg-blue-700 hover:bg-blue-600 py-2.5 text-xs font-semibold text-white transition disabled:opacity-50"
                >
                  <IconFacebook />
                  <span>{loading ? 'Connecting…' : 'Continue with Facebook'}</span>
                </button>
              </form>
            )}

            {provider === 'apple' && (
              <form onSubmit={handleDirectSocialLogin} className="space-y-3">
                <p className="text-[12px] text-zinc-400 leading-relaxed">
                  Sign in with your Apple ID / iCloud email:
                </p>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Apple ID / Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@icloud.com"
                    className="w-full rounded-xl border border-white/[0.1] bg-zinc-800/90 py-2.5 px-3.5 text-xs text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white hover:bg-zinc-100 py-2.5 text-xs font-semibold text-zinc-900 transition disabled:opacity-50"
                >
                  <IconApple />
                  <span>{loading ? 'Signing in…' : 'Continue with Apple ID'}</span>
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
