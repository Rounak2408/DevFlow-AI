import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MessageSquare, Upload, UserCircle } from 'lucide-react';
import api from '../lib/api.js';
import { useAuthStore } from '../store/authStore.js';
import { MemberAvatar } from '../components/workspace/MemberAvatar.jsx';
import { ErrorFallback } from '../components/ui/ErrorFallback.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';

const EMOJI_PRESETS = ['👨‍💻', '👩‍💻', '🎨', '🖌️', '🚀', '⚙️', '📱', '🎯', '💡', '🔧', '📊', '✨', '🎬', '📝'];

function roleLabel(role) {
  if (role === 'owner') return 'Owner';
  if (role === 'admin') return 'Admin';
  return 'Member';
}

export function Members() {
  const { projectId } = useParams();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || '');
  const fileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const { data } = await api.get(`/projects/${projectId}`);
      setProject(data.project);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [projectId]);

  useEffect(() => {
    setJobTitle(user?.jobTitle || '');
  }, [user?.jobTitle]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (!cancelled) updateUser(data.user);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId, updateUser]);

  const memberRows = useMemo(() => {
    if (!project) return [];
    const out = [];
    const seen = new Set();
    if (project.owner) {
      const id = String(project.owner._id || project.owner.id);
      seen.add(id);
      out.push({ user: project.owner, role: 'owner' });
    }
    project.members?.forEach((m) => {
      const u = m.user;
      if (!u) return;
      const id = String(u._id || u.id);
      if (seen.has(id)) return;
      seen.add(id);
      out.push({ user: u, role: m.role });
    });
    return out;
  }, [project]);

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch('/auth/me', { jobTitle: jobTitle.trim() });
      updateUser(data.user);
      toast.success('Profile saved');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function setEmoji(emoji) {
    setSaving(true);
    try {
      const { data } = await api.patch('/auth/me', {
        avatarEmoji: emoji,
        avatar: '',
      });
      updateUser(data.user);
      toast.success('Avatar updated');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function uploadPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setSaving(true);
    try {
      const form = new FormData();
      form.append('photo', file);
      const { data } = await api.post('/auth/me/avatar', form);
      updateUser(data.user);
      toast.success('Photo updated');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function clearAvatar() {
    setSaving(true);
    try {
      const { data } = await api.patch('/auth/me', { avatar: '', avatarEmoji: '' });
      updateUser(data.user);
      toast.success('Using initials');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (err && !loading) {
    return (
      <div className="max-w-lg">
        <ErrorFallback message={err} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Members</h1>
          <p className="mt-1 text-sm text-slate-500">
            Team directory — job titles and avatars are visible in this workspace.
          </p>
        </div>
        <Link
          to={`/app/projects/${projectId}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#111827] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-blue-500/30 hover:bg-[#151c2e]"
        >
          <MessageSquare className="h-4 w-4 text-blue-400" />
          Open chat
        </Link>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/[0.06] bg-[#111827]/80 p-5 shadow-xl backdrop-blur-sm"
      >
        <h2 className="text-sm font-semibold text-white">Your profile</h2>
        <p className="mt-1 text-xs text-slate-500">
          Others in this project see your name, title, and picture below.
        </p>
        {loading ? (
          <Skeleton className="mt-4 h-32 w-full rounded-xl" />
        ) : (
          <form onSubmit={saveProfile} className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <MemberAvatar user={user} size="xl" />
              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-[#0B0F19] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/[0.04]"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload photo
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={clearAvatar}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-white/[0.04]"
                >
                  <UserCircle className="h-3.5 w-3.5" />
                  Initials only
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={uploadPhoto} />
            </div>
            <div className="min-w-0 flex-1 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500">Display name</label>
                <p className="mt-1 text-sm text-slate-300">{user?.name}</p>
              </div>
              <div>
                <label htmlFor="jobTitle" className="text-xs font-medium text-slate-500">
                  Position / title
                </label>
                <input
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Software Engineer, Frontend, Design"
                  className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#0B0F19] px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Emoji avatar</p>
                <p className="mt-0.5 text-[11px] text-slate-600">Pick one if you prefer no photo (clears uploaded image).</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {EMOJI_PRESETS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      disabled={saving}
                      onClick={() => setEmoji(em)}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition ${
                        user?.avatarEmoji === em
                          ? 'border-blue-500/50 bg-blue-500/15'
                          : 'border-white/[0.06] bg-[#0B0F19] hover:border-white/15'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 disabled:opacity-50"
              >
                Save title
              </button>
            </div>
          </form>
        )}
      </motion.section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Team ({memberRows.length})
        </h2>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {memberRows.map(({ user: u, role }) => {
              const id = String(u._id || u.id);
              const isYou = user?.id && String(user.id) === id;
              return (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-white/[0.06] bg-[#111827]/90 p-4 backdrop-blur-sm"
                >
                  <div className="flex items-start gap-3">
                    <MemberAvatar user={u} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-white">{u.name}</p>
                        {isYou && (
                          <span className="shrink-0 rounded-md bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-blue-300">
                            You
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-slate-400">
                        {u.jobTitle?.trim() || '—'}
                      </p>
                      <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        {roleLabel(role)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
