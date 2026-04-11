import { NavLink, useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  Users,
  MessageSquare,
  Map,
  ChevronDown,
  ChevronLeft,
  CircleDot,
  Settings,
  Plus,
  MoreVertical,
  LogOut,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useSidebarStore } from '../../store/sidebarStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { MemberAvatar } from '../workspace/MemberAvatar.jsx';

const mainNav = (projectId) => {
  const p = projectId;
  const fallback = '/app';
  return [
    { to: '/app', label: 'Boards', icon: LayoutGrid, end: true, needsProject: false },
    {
      to: p ? `/app/projects/${p}/members` : fallback,
      label: 'Members',
      icon: Users,
      end: true,
      needsProject: true,
    },
    {
      to: p ? `/app/projects/${p}` : fallback,
      label: 'Chat',
      icon: MessageSquare,
      end: true,
      needsProject: true,
    },
    {
      to: p ? `/app/projects/${p}/roadmap` : fallback,
      label: 'Road map',
      icon: Map,
      end: true,
      needsProject: true,
    },
    {
      to: p ? `/app/projects/${p}/reports` : fallback,
      label: 'Reports',
      icon: BarChart3,
      end: true,
      needsProject: true,
      hasChevron: true,
    },
    {
      to: p ? `/app/projects/${p}/board` : fallback,
      label: 'Issues',
      icon: CircleDot,
      end: true,
      needsProject: true,
    },
    { to: '/app/assistant', label: 'AI Assistant', icon: Sparkles, end: true, needsProject: false },
    { to: '/app/settings', label: 'Workspace settings', icon: Settings, end: true, needsProject: false },
  ];
};

const categories = [
  { label: 'Workspaces', dot: 'bg-blue-500', to: '/app' },
  { label: 'Recent', dot: 'bg-amber-400', to: '/app' },
  { label: 'Starred', dot: 'bg-pink-500', to: '/app' },
  { label: 'Templates', dot: 'bg-emerald-500', to: '/app' },
];

function SidebarNavItem({
  to,
  end,
  label,
  icon: Icon,
  collapsed,
  hasChevron,
  blocked,
  onNavigate,
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={(e) => {
        if (blocked) {
          e.preventDefault();
          toast.error('Pehle Boards se koi workspace kholen — phir yeh section khulega.');
          return;
        }
        onNavigate?.();
      }}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-300 ease-out ${
          isActive
            ? 'bg-gradient-to-r from-blue-500/15 via-blue-500/5 to-transparent text-white shadow-[0_0_20px_-8px_rgba(59,130,246,0.35)] ring-1 ring-blue-500/20'
            : 'text-slate-400 hover:translate-x-0.5 hover:bg-white/[0.04] hover:text-slate-100'
        } ${collapsed ? 'justify-center px-2' : ''}`
      }
      title={collapsed ? label : undefined}
    >
      <Icon
        className="h-[18px] w-[18px] shrink-0 opacity-90 transition-transform duration-300 ease-out group-hover:scale-105"
        strokeWidth={1.5}
      />
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {!collapsed && hasChevron && (
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" />
      )}
    </NavLink>
  );
}

export function Sidebar({ onNavigate }) {
  const { projectId: paramProjectId } = useParams();
  const { pathname } = useLocation();
  const lastProjectId = useSidebarStore((s) => s.lastProjectId);
  const pathMatch = pathname.match(/^\/app\/projects\/([^/]+)/);
  const projectId = paramProjectId || pathMatch?.[1] || lastProjectId || null;
  const { collapsed, toggle } = useSidebarStore();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function close(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const items = mainNav(projectId);

  return (
    <aside
      className={`flex h-full flex-col border-r border-white/[0.05] bg-[#111827]/90 backdrop-blur-xl backdrop-saturate-150 transition-[width] duration-300 ease-out ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      <div className="flex h-14 items-center justify-between gap-2 border-b border-white/[0.05] px-3">
        <Link to="/app" className="flex min-w-0 items-center gap-2.5" onClick={() => onNavigate?.()}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-blue-500/25">
            D
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="min-w-0"
              >
                <p className="truncate text-[15px] font-semibold tracking-tight text-white">DevFlow</p>
                <p className="truncate text-[11px] text-slate-500">Workspace</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
        <button
          type="button"
          onClick={toggle}
          className="hidden shrink-0 rounded-lg p-1.5 text-slate-500 transition duration-300 ease-out hover:bg-white/[0.06] hover:text-slate-300 md:block"
          aria-label="Collapse sidebar"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto scroll-thin p-3">
        {items.map(({ to, label, icon, end, needsProject, hasChevron }) => (
          <SidebarNavItem
            key={label}
            to={to}
            end={end}
            label={label}
            icon={icon}
            collapsed={collapsed}
            hasChevron={hasChevron}
            blocked={Boolean(needsProject && !projectId)}
            onNavigate={onNavigate}
          />
        ))}

        {!collapsed && (
          <div className="mt-6 border-t border-white/[0.05] pt-4">
            <div className="mb-2 flex items-center justify-between px-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Categories
              </span>
              <button
                type="button"
                className="rounded-md p-0.5 text-slate-500 hover:bg-white/[0.06] hover:text-slate-300"
                aria-label="Add category"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-0.5">
              {categories.map((c) => (
                <Link
                  key={c.label}
                  to={c.to}
                  onClick={() => onNavigate?.()}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13px] text-slate-400 transition duration-300 ease-out hover:bg-white/[0.04] hover:text-slate-200"
                >
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${c.dot}`} />
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div ref={menuRef} className="relative border-t border-white/[0.05] p-3">
        <div
          className={`flex items-center gap-3 rounded-lg px-2 py-2 ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-[#111827]">
            <MemberAvatar user={user} size="sm" />
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-white">{user?.name}</p>
                <p className="truncate text-[11px] text-slate-500">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-white/[0.06] hover:text-slate-300"
                aria-label="Account menu"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        {menuOpen && !collapsed && (
          <div className="absolute bottom-full left-2 right-2 mb-1 rounded-xl border border-white/[0.06] bg-[#151c2e] py-1 shadow-xl ring-1 ring-white/[0.04]">
            <Link
              to="/app/settings"
              className="block px-3 py-2 text-[13px] text-slate-300 hover:bg-white/[0.06]"
              onClick={() => {
                setMenuOpen(false);
                onNavigate?.();
              }}
            >
              Settings
            </Link>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-rose-400 hover:bg-white/[0.06]"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
