import { G, chartTooltip } from './reportTheme.js';

export { G, chartTooltip, formatCompact } from './reportTheme.js';

/** Extended palette — blue / emerald / purple accents */
export const A = {
  ...G,
  blue: '#38bdf8',
  blueDeep: '#0ea5e9',
  purple: '#a78bfa',
  purpleDeep: '#7c3aed',
  indigo: '#818cf8',
  surface: '#0B0F19',
  card: '#111827',
  border: 'rgba(255,255,255,0.05)',
};

export const gradients = {
  emerald: ['#34d399', '#10b981', '#059669'],
  blue: ['#7dd3fc', '#38bdf8', '#0284c7'],
  purple: ['#c4b5fd', '#a78bfa', '#6d28d9'],
};

export const cardGlass =
  'rounded-2xl border border-white/[0.06] bg-[#111827]/80 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset,0_24px_48px_-24px_rgba(0,0,0,0.55)] backdrop-blur-xl';

export const glowRadial =
  'pointer-events-none absolute rounded-full opacity-40 blur-3xl';
