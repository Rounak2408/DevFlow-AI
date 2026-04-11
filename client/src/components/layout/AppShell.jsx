import { useEffect } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar.jsx';
import { TopBar } from './TopBar.jsx';
import { useSidebarStore } from '../../store/sidebarStore.js';

const titles = {
  '/app': { title: 'Boards', subtitle: 'Your workspaces' },
  '/app/settings': { title: 'Settings', subtitle: 'Account and integrations' },
  '/app/assistant': { title: 'AI Assistant', subtitle: 'Personal productivity workspace' },
};

export function AppShell() {
  const { pathname } = useLocation();
  const { projectId } = useParams();
  const setLastProjectId = useSidebarStore((s) => s.setLastProjectId);
  const collapsed = useSidebarStore((s) => s.collapsed);
  const mobileOpen = useSidebarStore((s) => s.mobileOpen);
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen);

  useEffect(() => {
    const m = pathname.match(/^\/app\/projects\/([^/]+)/);
    if (m?.[1]) setLastProjectId(m[1]);
  }, [pathname, setLastProjectId]);

  let meta = titles[pathname] || { title: 'DevFlow', subtitle: '' };
  if (pathname.includes('/board')) meta = { title: 'Tasks board', subtitle: 'Kanban view' };
  else if (pathname.includes('/reports') || pathname.includes('/analytics'))
    meta = { title: 'Reports', subtitle: 'Analytics & insights' };
  else if (pathname.includes('/roadmap')) meta = { title: 'Roadmap', subtitle: 'Product timeline' };
  else if (projectId && pathname.includes(`/projects/${projectId}/members`))
    meta = { title: 'Members', subtitle: 'Team & profiles' };
  else if (projectId && pathname.endsWith(`/projects/${projectId}`))
    meta = { title: 'Project workspace', subtitle: 'Chat & activity' };

  const isBoard = pathname.includes('/board');
  const isChatRoom = Boolean(projectId && pathname === `/app/projects/${projectId}`);
  const isAssistant = pathname === '/app/assistant';

  return (
    <div className="relative flex min-h-screen min-w-0 overflow-x-hidden bg-[#0B0F19] text-slate-100">
      <div
        className="pointer-events-none fixed inset-0 -z-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 90% 60% at 10% -10%, rgba(59, 130, 246, 0.12), transparent 50%), radial-gradient(ellipse 70% 50% at 90% 0%, rgba(139, 92, 246, 0.08), transparent 45%), radial-gradient(ellipse 50% 40% at 50% 100%, rgba(59, 130, 246, 0.06), transparent 50%)',
        }}
      />

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[#0B0F19]/60 backdrop-blur-sm md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[min(260px,calc(100vw-0.75rem))] max-w-[100vw] transition-transform duration-300 ease-out md:static md:z-10 md:max-w-none ${
          collapsed ? 'md:w-[72px]' : 'md:w-[260px]'
        } ${mobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'}`}
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </div>
      <div className="relative z-10 flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
        <TopBar title={meta.title} subtitle={meta.subtitle} />
        <main
          className={`flex min-h-0 flex-1 flex-col ${isChatRoom || isAssistant ? 'overflow-hidden' : 'overflow-x-hidden overflow-y-auto'} ${isBoard || isChatRoom || isAssistant ? '' : 'px-3 py-5 sm:px-6 sm:py-8 lg:px-10 lg:py-10'}`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={
                isBoard
                  ? 'h-full min-h-0'
                  : isChatRoom || isAssistant
                    ? 'flex min-h-0 w-full max-w-none flex-1 flex-col'
                    : 'mx-auto max-w-7xl'
              }
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
