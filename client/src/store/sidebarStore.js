import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSidebarStore = create(
  persist(
    (set) => ({
      collapsed: false,
      mobileOpen: false,
      /** Last workspace opened — sidebar Chat/Members use this on Boards */
      lastProjectId: null,
      setLastProjectId: (id) => set({ lastProjectId: id ? String(id) : null }),
      toggle: () => set((s) => ({ collapsed: !s.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed: Boolean(collapsed) }),
      setMobileOpen: (open) => set({ mobileOpen: open }),
      toggleMobile: () => set((s) => ({ mobileOpen: !s.mobileOpen })),
    }),
    { name: 'devflow-sidebar' }
  )
);
