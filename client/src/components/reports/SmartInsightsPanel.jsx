import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const tone = {
  good: 'border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-100/90',
  warn: 'border-amber-500/25 bg-amber-500/[0.06] text-amber-100/90',
  neutral: 'border-white/[0.06] bg-white/[0.03] text-slate-300',
};

export function SmartInsightsPanel({ insights, delay = 0.2 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-b from-[#111827]/95 to-[#0c1222]/95 p-5 shadow-[0_0_60px_-20px_rgba(139,92,246,0.35)] backdrop-blur-xl"
    >
      <div
        className="pointer-events-none absolute -right-16 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-violet-500/15 blur-3xl"
        aria-hidden
      />
      <div className="relative flex items-center gap-2">
        <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.25)]">
          <Sparkles className="h-4 w-4 text-violet-300" strokeWidth={1.75} />
          <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
          </span>
        </span>
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-white">Smart insights</h3>
          <p className="text-[11px] text-violet-200/60">AI-assisted read on your delivery signals</p>
        </div>
      </div>
      <ul className="relative mt-5 flex flex-1 flex-col gap-2.5">
        {(insights || []).map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.08 + i * 0.06, duration: 0.35 }}
            className={`rounded-xl border px-3.5 py-2.5 text-[12px] leading-snug ${tone[item.type] || tone.neutral}`}
          >
            {item.text}
          </motion.li>
        ))}
      </ul>
      <p className="relative mt-4 text-[10px] text-slate-600">
        Heuristics from status, throughput, and team load — not a generative model.
      </p>
    </motion.div>
  );
}
