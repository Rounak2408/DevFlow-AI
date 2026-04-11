import { motion } from 'framer-motion';
import { FolderKanban, Sparkles } from 'lucide-react';

export function PremiumEmptyState({ onCreate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto max-w-lg px-2 py-4"
    >
      <div className="absolute inset-0 -z-10 rounded-[28px] bg-gradient-to-br from-blue-500/25 via-transparent to-violet-500/20 opacity-60 blur-3xl" />

      <div className="relative rounded-[24px] p-[1px]">
        <motion.div
          className="absolute inset-0 rounded-[24px]"
          style={{
            background:
              'linear-gradient(135deg, rgba(59,130,246,0.45), rgba(255,255,255,0.08), rgba(139,92,246,0.35))',
          }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-[1px] rounded-[23px] border border-dashed border-white/[0.12]"
          animate={{ opacity: [0.4, 0.85, 0.4] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative rounded-[23px] border border-white/[0.05] bg-[#111827] px-8 py-14 text-center shadow-[0_0_80px_-30px_rgba(59,130,246,0.4)]">
          <motion.div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/20 to-violet-500/10 text-blue-400 shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)]"
            whileHover={{ scale: 1.05, rotate: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <FolderKanban className="h-8 w-8" strokeWidth={1.25} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mt-2 flex justify-center"
          >
            <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-slate-400">
              <Sparkles className="h-3 w-3 text-blue-400/80" />
              Get started
            </span>
          </motion.div>
          <h3 className="mt-6 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            No boards yet
          </h3>
          <p className="mx-auto mt-3 max-w-sm text-[14px] leading-relaxed text-slate-500">
            Create your first workspace to start collaborating — chat, Kanban, GitHub context, and
            reports in one place.
          </p>
          <motion.button
            type="button"
            onClick={onCreate}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_-4px_rgba(59,130,246,0.55)] transition-shadow duration-300 hover:shadow-[0_0_36px_-4px_rgba(59,130,246,0.65)]"
          >
            Create board
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
