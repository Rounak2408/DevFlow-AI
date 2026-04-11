import {
  LogOut,
  Menu,
  Search,
  MessageSquare,
  Bell,
  Crown,
  ChevronLeft,
  ChevronDown,
  Settings,
  User,
} from 'lucide-react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../store/authStore.js';
import { useSidebarStore } from '../../store/sidebarStore.js';
import api from '../../lib/api.js';

export function TopBar({ title, subtitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const toggleMobile = useSidebarStore((s) => s.toggleMobile);
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const inboxRef = useRef(null);
  const notificationsRef = useRef(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [inboxProjects, setInboxProjects] = useState([]);
  const [inboxLoading, setInboxLoading] = useState(false);

  const isBoard = location.pathname.includes('/board');
  const backTo = projectId ? `/app/projects/${projectId}` : '/app';

  useEffect(() => {
    function onKey(e) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
      e.preventDefault();
      searchRef.current?.focus();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    function close(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (inboxRef.current && !inboxRef.current.contains(e.target)) setInboxOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) setNotificationsOpen(false);
    }
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  function toggleNotifications() {
    setProfileOpen(false);
    setInboxOpen(false);
    setNotificationsOpen((o) => !o);
  }

  async function openInbox() {
    setProfileOpen(false);
    setNotificationsOpen(false);
    if (inboxOpen) {
      setInboxOpen(false);
      return;
    }
    setInboxOpen(true);
    setInboxLoading(true);
    try {
      const { data } = await api.get('/projects');
      setInboxProjects(data.projects || []);
    } catch {
      setInboxProjects([]);
    } finally {
      setInboxLoading(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.05] bg-[#0B0F19]/85 backdrop-blur-xl backdrop-saturate-150 pt-[env(safe-area-inset-top,0px)]">
      <div className="flex h-14 min-w-0 items-center gap-2 px-3 sm:gap-3 sm:px-6">
        <button
          type="button"
          className="touch-manipulation rounded-lg p-2 text-slate-400 transition duration-300 ease-out hover:bg-white/[0.05] hover:text-white md:hidden"
          onClick={toggleMobile}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {isBoard && projectId && (
          <Link
            to={backTo}
            className="flex shrink-0 touch-manipulation items-center justify-center rounded-lg p-2 text-slate-400 transition duration-300 ease-out hover:bg-white/[0.05] hover:text-white"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        )}

        <div className="min-w-0 flex-1 sm:hidden">
          <p className="truncate text-[12px] font-medium text-slate-200" title={subtitle ? `${title} / ${subtitle}` : title}>
            {subtitle ? (
              <>
                <span className="text-slate-500">{title}</span>
                <span className="mx-1 text-slate-600">/</span>
                <span>{subtitle}</span>
              </>
            ) : (
              title
            )}
          </p>
        </div>

        <div className="hidden min-w-0 sm:block sm:max-w-[240px] lg:max-w-md">
          <p className="truncate text-[13px] text-slate-400">
            <span className="text-slate-500">{title}</span>
            {subtitle && (
              <>
                <span className="mx-1.5 text-slate-600">/</span>
                <span className="font-medium text-slate-200">{subtitle}</span>
              </>
            )}
          </p>
        </div>

        <div className="mx-auto hidden min-w-0 max-w-xl flex-1 px-4 md:block">
          <div className="group relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors duration-300 group-focus-within:text-blue-400/90" />
            <input
              ref={searchRef}
              type="search"
              placeholder="Search projects, tasks, people…"
              className="w-full rounded-full border border-white/[0.05] bg-[#111827] py-2.5 pl-10 pr-16 text-[13px] text-slate-200 placeholder:text-slate-500 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset] transition-all duration-300 ease-out focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:shadow-[0_0_24px_-8px_rgba(59,130,246,0.45)]"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500 sm:inline-block">
              /
            </kbd>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <div className="relative" ref={inboxRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openInbox();
              }}
              className={`relative rounded-lg p-2 text-slate-400 transition duration-300 ease-out hover:bg-white/[0.05] hover:text-white ${
                inboxOpen ? 'bg-white/[0.06] text-white ring-1 ring-white/20' : ''
              }`}
              aria-label="Messages"
              aria-expanded={inboxOpen}
              aria-haspopup="dialog"
            >
              <MessageSquare className="h-[18px] w-[18px]" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 ring-2 ring-[#0B0F19]" />
            </button>
            <AnimatePresence>
              {inboxOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 z-50 mt-2 w-[min(calc(100vw-2rem),20rem)] overflow-hidden rounded-xl border border-white/[0.06] bg-[#111827] shadow-2xl shadow-black/40 ring-1 ring-white/[0.04]"
                  role="dialog"
                  aria-label="Workspace chats"
                >
                  <div className="border-b border-white/[0.05] px-3 py-2.5">
                    <p className="text-[12px] font-semibold text-white">Workspace chat</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">Open a project to message your team</p>
                  </div>
                  <div className="max-h-72 overflow-y-auto scroll-thin p-1.5">
                    {inboxLoading ? (
                      <p className="px-2 py-6 text-center text-[12px] text-slate-500">Loading…</p>
                    ) : inboxProjects.length === 0 ? (
                      <div className="px-2 py-5 text-center">
                        <p className="text-[12px] text-slate-400">No workspaces yet</p>
                        <Link
                          to="/app"
                          className="mt-2 inline-block text-[12px] font-medium text-blue-400 hover:text-blue-300"
                          onClick={() => setInboxOpen(false)}
                        >
                          Go to Boards
                        </Link>
                      </div>
                    ) : (
                      <ul className="space-y-0.5">
                        {inboxProjects.map((p) => {
                          const active = projectId && String(p.id) === String(projectId);
                          return (
                            <li key={p.id}>
                              <Link
                                to={`/app/projects/${p.id}`}
                                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] transition duration-200 ${
                                  active
                                    ? 'bg-blue-600/15 text-white ring-1 ring-blue-500/25'
                                    : 'text-slate-300 hover:bg-white/[0.05]'
                                }`}
                                onClick={() => setInboxOpen(false)}
                              >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600/40 to-violet-600/30 text-[11px] font-bold text-white">
                                  {(p.name || '?').slice(0, 1).toUpperCase()}
                                </span>
                                <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
                                {active && (
                                  <span className="shrink-0 text-[10px] font-medium text-blue-400/90">Here</span>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="relative z-40" ref={notificationsRef}>
            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleNotifications();
              }}
              className={`relative rounded-lg p-2 text-slate-400 transition duration-300 ease-out hover:bg-white/[0.05] hover:text-white ${
                notificationsOpen ? 'bg-white/[0.06] text-white ring-1 ring-white/20' : ''
              }`}
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
              aria-haspopup="dialog"
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="h-[18px] w-[18px]" />
            </motion.button>
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 z-50 mt-2 w-[min(calc(100vw-2rem),20rem)] overflow-hidden rounded-xl border border-white/[0.06] bg-[#111827] shadow-2xl shadow-black/40 ring-1 ring-white/[0.04]"
                  role="dialog"
                  aria-label="Notifications"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="border-b border-white/[0.05] px-3 py-2.5">
                    <p className="text-[12px] font-semibold text-white">Notifications</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">Mentions, tasks, and workspace alerts</p>
                  </div>
                  <div className="px-3 py-8 text-center">
                    <p className="text-[12px] text-slate-400">No live notifications yet.</p>
                    <p className="mt-1 text-[11px] text-slate-600">The bell is ready — hook this panel to your API when you add real events.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="hidden items-center gap-1.5 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[11px] font-semibold text-amber-200/95 shadow-[0_0_20px_-8px_rgba(245,158,11,0.35)] sm:inline-flex"
          >
            <Crown className="h-3.5 w-3.5" />
            Premium
          </motion.button>

          <div className="relative ml-1 hidden sm:block" ref={profileRef}>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setInboxOpen(false);
                setNotificationsOpen(false);
                setProfileOpen((o) => !o);
              }}
              className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#111827] py-1 pl-1 pr-2 transition duration-300 ease-out hover:border-white/[0.1] hover:bg-[#151c2e]"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-xs font-bold text-white shadow-md shadow-blue-500/20">
                {(user?.name || '?').slice(0, 1).toUpperCase()}
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`}
              />
            </motion.button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-white/[0.06] bg-[#111827] py-1 shadow-2xl shadow-black/40 ring-1 ring-white/[0.04]"
                  role="menu"
                >
                  <div className="border-b border-white/[0.05] px-3 py-2">
                    <p className="truncate text-[13px] font-medium text-white">{user?.name}</p>
                    <p className="truncate text-[11px] text-slate-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/app/settings"
                    className="flex items-center gap-2 px-3 py-2 text-[13px] text-slate-300 transition duration-200 hover:bg-white/[0.05]"
                    onClick={() => setProfileOpen(false)}
                    role="menuitem"
                  >
                    <User className="h-4 w-4 text-slate-500" />
                    Profile
                  </Link>
                  <Link
                    to="/app/settings"
                    className="flex items-center gap-2 px-3 py-2 text-[13px] text-slate-300 transition duration-200 hover:bg-white/[0.05]"
                    onClick={() => setProfileOpen(false)}
                    role="menuitem"
                  >
                    <Settings className="h-4 w-4 text-slate-500" />
                    Settings
                  </Link>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 border-t border-white/[0.05] px-3 py-2 text-left text-[13px] text-rose-400 transition duration-200 hover:bg-white/[0.05]"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    role="menuitem"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-white/[0.04] px-4 py-2.5 sm:hidden">
        <div className="group relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Search…"
            className="w-full rounded-full border border-white/[0.05] bg-[#111827] py-2 pl-9 pr-3 text-xs text-slate-200 transition duration-300 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
          />
        </div>
      </div>
    </header>
  );
}
