/** Premium reports — cohesive emerald / lime palette */
export const G = {
  lime: '#86efac',
  light: '#4ade80',
  main: '#22c55e',
  deep: '#16a34a',
  forest: '#15803d',
  dark: '#14532d',
  muted: '#1e293b',
  card: '#111827',
  label: '#94a3b8',
};

export const chartTooltip = {
  borderRadius: 12,
  border: '1px solid rgba(74, 222, 128, 0.2)',
  background: 'rgba(17, 24, 39, 0.95)',
  color: '#f1f5f9',
  fontSize: 12,
  boxShadow: '0 12px 40px -12px rgba(0,0,0,0.5)',
};

export function formatCompact(n) {
  const x = Number(n) || 0;
  if (x >= 1000) return `${(x / 1000).toFixed(1)}K`;
  return String(x);
}
