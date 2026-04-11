import { motion } from 'framer-motion';
import { LayoutGrid, Sparkles } from 'lucide-react';

export function KanbanEmptyState({ onTrySample, onCreateTask }) {
  return (
    <div className="relative flex min-h-[min(560px,calc(100vh-280px))] flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-white/[0.08] bg-[#0B0F19] px-6 py-16 text-center">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#111827] shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]"
      >
        <LayoutGrid className="h-14 w-14 text-blue-400/50" strokeWidth={1.25} />
        <Sparkles className="absolute -right-1 -top-1 h-6 w-6 text-violet-400/80" />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="relative text-2xl font-bold tracking-tight text-white md:text-[28px]"
      >
        No tasks yet
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="relative mt-3 max-w-md text-sm leading-relaxed text-slate-400"
      >
        Create your first task to start sprint execution — or load a sample board to explore the workflow.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="relative mt-10 flex flex-wrap items-center justify-center gap-3"
      >
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateTask}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30"
        >
          Create task
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onTrySample}
          className="inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-slate-200"
        >
          Try sample board
        </motion.button>
      </motion.div>
    </div>
  );
}
