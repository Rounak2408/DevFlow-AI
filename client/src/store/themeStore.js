import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function systemPrefersDark() {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveThemeMode(theme) {
  if (theme === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return theme === 'light' ? 'light' : 'dark';
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggle: () => {
        const effective = resolveThemeMode(get().theme);
        const next = effective === 'dark' ? 'light' : 'dark';
        set({ theme: next });
        get().applyTheme();
      },
      setTheme: (theme) => {
        set({ theme });
        get().applyTheme();
      },
      applyTheme: () => {
        const effective = resolveThemeMode(get().theme);
        document.documentElement.classList.toggle('dark', effective === 'dark');
      },
    }),
    { name: 'devflow-theme' }
  )
);
