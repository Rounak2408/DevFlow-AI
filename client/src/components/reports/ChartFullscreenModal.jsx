import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2 } from 'lucide-react';

export function ChartFullscreenButton({ onClick, label = 'Expand' }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-slate-400 transition-colors hover:border-white/[0.12] hover:text-slate-200"
      aria-label={label}
    >
      <Maximize2 className="h-3 w-3" />
      Fullscreen
    </motion.button>
  );
}

export function ChartFullscreenModal({ open, title, onClose, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-[#0B0F19]/90 backdrop-blur-sm"
            aria-label="Close"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="chart-fs-title"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111827] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
              <h2 id="chart-fs-title" className="text-sm font-semibold text-white">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-[50vh] flex-1 p-4">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
