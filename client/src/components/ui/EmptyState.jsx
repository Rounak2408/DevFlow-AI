import { motion } from 'framer-motion';

export function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 bg-white/40 px-8 py-16 text-center dark:border-slate-600/60 dark:bg-slate-900/30 ${className}`}
    >
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
