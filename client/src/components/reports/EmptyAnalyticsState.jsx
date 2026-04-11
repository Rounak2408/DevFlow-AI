import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BarChart3, Sparkles } from 'lucide-react';

export function EmptyAnalyticsState({ projectId }) {
  const boardPath = projectId ? `/app/projects/${projectId}/board` : '/app';

  return (
    <div className="relative mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 flex h-40 w-40 items-center justify-center rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#111827] to-[#0B0F19] shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_24px_80px_-24px_rgba(16,185,129,0.2)]"
      >
        <svg viewBox="0 0 120 120" className="h-28 w-28 text-emerald-500/80" aria-hidden>
          <rect x="12" y="72" width="20" height="36" rx="4" fill="currentColor" opacity="0.35" />
          <rect x="38" y="52" width="20" height="56" rx="4" fill="currentColor" opacity="0.55" />
          <rect x="64" y="64" width="20" height="44" rx="4" fill="currentColor" opacity="0.45" />
          <rect x="90" y="40" width="18" height="68" rx="4" fill="url(#g)" opacity="0.9" />
          <path
            d="M14 38 Q 60 12, 106 38"
            fill="none"
            stroke="url(#g)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.6"
          />
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45 }}
        className="flex items-center gap-2 text-emerald-400/90"
      >
        <Sparkles className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-[0.2em]">Intelligence layer</span>
      </motion.div>
      <h2 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-[32px] md:leading-tight">
        No sprint data yet
      </h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
        Move cards on your board and complete tasks — we’ll surface velocity, cycle time, and team
        signals automatically.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <Link
            to={boardPath}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30"
          >
            <BarChart3 className="h-4 w-4" />
            Open board
          </Link>
        </motion.div>
        <span className="text-xs text-slate-600">Import or create tasks to unlock charts</span>
      </div>
    </div>
  );
}
