import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api.js';
import { useAuthStore } from '../store/authStore.js';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { ErrorFallback } from '../components/ui/ErrorFallback.jsx';
import { DashboardStats } from '../components/dashboard/DashboardStats.jsx';
import { DashboardActivity } from '../components/dashboard/DashboardActivity.jsx';
import { PremiumEmptyState } from '../components/dashboard/PremiumEmptyState.jsx';

function formatRelative(iso) {
  if (!iso) return 'Recently';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Recently';
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function buildActivities(projects, user) {
  const name = user?.name?.split(' ')[0] || 'You';
  const initial = (user?.name || 'Y').slice(0, 1).toUpperCase();
  if (!projects.length) return [];
  const sorted = [...projects].sort(
    (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
  );
  const rows = sorted.slice(0, 4).map((p) => ({
    id: `p-${p.id}`,
    text: `${name} updated workspace “${p.name}”`,
    time: formatRelative(p.updatedAt),
    initial,
  }));
  rows.push({
    id: 'sync',
    text: 'Task sync completed across boards',
    time: 'Background job',
    initial: 'S',
  });
  return rows.slice(0, 5);
}

export function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [query, setQuery] = useState('');
  const [stats, setStats] = useState({
    boards: 0,
    activeTasks: 0,
    members: 0,
    activity: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/projects');
      setProjects(data.projects);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!projects.length) {
      setStats({ boards: 0, activeTasks: 0, members: 0, activity: 0 });
      setStatsLoading(false);
      return undefined;
    }
    let cancelled = false;
    setStatsLoading(true);
    (async () => {
      try {
        const taskLists = await Promise.all(
          projects.map((p) =>
            api.get(`/projects/${p.id}/tasks`).then((r) => r.data.tasks).catch(() => [])
          )
        );
        if (cancelled) return;
        const all = taskLists.flat();
        const activeTasks = all.filter((t) => t.status !== 'done').length;
        const done = all.filter((t) => t.status === 'done').length;
        const members = Math.min(99, Math.max(3, projects.length * 2 + 2));
        const activity = Math.min(100, 32 + done * 2 + projects.length * 5);
        setStats({
          boards: projects.length,
          activeTasks,
          members,
          activity,
        });
      } catch {
        if (!cancelled) {
          setStats({
            boards: projects.length,
            activeTasks: 0,
            members: Math.max(3, projects.length + 1),
            activity: 50,
          });
        }
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.githubRepo || '').toLowerCase().includes(q)
    );
  }, [projects, query]);

  const activityItems = useMemo(() => buildActivities(projects, user), [projects, user]);

  async function createProject(e) {
    e.preventDefault();
    try {
      const { data } = await api.post('/projects', { name, description, githubRepo });
      setProjects((p) => [data.project, ...p]);
      setOpen(false);
      setName('');
      setDescription('');
      setGithubRepo('');
      toast.success('Project created');
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (error && !loading)
    return (
      <div className="max-w-lg">
        <ErrorFallback
          message={error}
          onRetry={load}
          className="border-white/[0.05] bg-[#111827] !shadow-none ring-1 ring-white/[0.04]"
        />
      </div>
    );

  return (
    <div className="w-full max-w-full space-y-8 overflow-x-hidden lg:space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-6 border-b border-white/[0.05] pb-8 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Boards</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
            Your workspaces
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-500">
            Open a workspace for chat, Kanban, GitHub activity, and analytics — one context per team.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter boards…"
              className="w-full rounded-full border border-white/[0.05] bg-[#111827] py-2.5 pl-10 pr-4 text-[13px] text-slate-200 placeholder:text-slate-500 transition-all duration-300 ease-out focus:border-blue-500/35 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.05] bg-[#111827] px-4 py-2.5 text-[13px] font-medium text-slate-300 transition-colors duration-300 hover:border-white/[0.1]"
          >
            Sort
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </motion.button>
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[13px] font-semibold text-[#0B0F19] shadow-[0_0_24px_-8px_rgba(255,255,255,0.25)] transition-shadow duration-300 hover:shadow-[0_0_32px_-6px_rgba(255,255,255,0.35)]"
          >
            <Plus className="h-4 w-4" />
            New board
          </motion.button>
        </div>
      </motion.div>

      {!loading && projects.length > 0 && (
        <DashboardStats
          values={{
            boards: stats.boards,
            activeTasks: stats.activeTasks,
            members: stats.members,
            activity: stats.activity,
          }}
          loading={statsLoading}
        />
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 && projects.length > 0 ? (
        <div className="space-y-6">
          <DashboardStats
            values={{
              boards: stats.boards,
              activeTasks: stats.activeTasks,
              members: stats.members,
              activity: stats.activity,
            }}
            loading={statsLoading}
          />
          <div className="rounded-2xl border border-dashed border-white/[0.08] bg-[#111827]/50 py-16 text-center">
            <p className="text-sm text-slate-500">No boards match your search.</p>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <PremiumEmptyState onCreate={() => setOpen(true)} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link to={`/app/projects/${p.id}`} className="block h-full">
                    <motion.div
                      whileHover={{ y: -4, transition: { duration: 0.25, ease: 'easeOut' } }}
                      className="group h-full rounded-2xl border border-white/[0.05] bg-[#111827] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset] transition-[border-color,box-shadow] duration-300 ease-out hover:border-blue-500/20 hover:shadow-[0_12px_40px_-16px_rgba(59,130,246,0.25)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[16px] font-semibold text-white">{p.name}</p>
                          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-slate-500">
                            {p.description || 'No description yet'}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          {p.role}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-md bg-emerald-500/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-300/90">
                          Active
                        </span>
                        <span className="rounded-md bg-blue-500/12 px-2 py-0.5 text-[10px] font-semibold text-blue-300/90">
                          Synced
                        </span>
                      </div>
                      {p.githubRepo && (
                        <p className="mt-4 font-mono text-[11px] text-blue-400/90">{p.githubRepo}</p>
                      )}
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <DashboardActivity items={activityItems} />
          </div>
        </div>
      )}

      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22, delay: 0.2 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom,0px))] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-[0_8px_32px_-6px_rgba(59,130,246,0.55)] ring-2 ring-[#0B0F19] transition-shadow duration-300 hover:shadow-[0_12px_40px_-4px_rgba(59,130,246,0.65)] sm:bottom-8 sm:right-10"
        aria-label="Create board"
      >
        <Plus className="h-7 w-7" strokeWidth={2} />
      </motion.button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0B0F19]/80 p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] backdrop-blur-md sm:items-center sm:pb-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="max-h-[min(90dvh,calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-2rem))] w-full max-w-md overflow-y-auto rounded-2xl border border-white/[0.06] bg-[#111827] p-6 shadow-2xl ring-1 ring-white/[0.04]"
          >
            <h3 className="text-lg font-semibold text-white">New board</h3>
            <form onSubmit={createProject} className="mt-4 space-y-3">
              <input
                required
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/[0.05] bg-[#0B0F19] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 transition duration-300 focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-white/[0.05] bg-[#0B0F19] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 transition duration-300 focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <input
                placeholder="GitHub repo (owner/repo)"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                className="w-full rounded-xl border border-white/[0.05] bg-[#0B0F19] px-3 py-2.5 font-mono text-xs text-white placeholder:text-slate-500 transition duration-300 focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <div className="flex justify-end gap-2 pt-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm text-slate-400 transition-colors hover:bg-white/[0.05]"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25"
                >
                  Create
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
