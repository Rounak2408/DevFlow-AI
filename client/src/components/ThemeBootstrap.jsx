import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore.js';

export function ThemeBootstrap() {
  const theme = useThemeStore((s) => s.theme);
  const applyTheme = useThemeStore((s) => s.applyTheme);

  useEffect(() => {
    applyTheme();
  }, [theme, applyTheme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme, applyTheme]);

  return null;
}
