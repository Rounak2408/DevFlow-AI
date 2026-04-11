import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export function ErrorFallback({ message, onRetry, className = '' }) {
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-panel flex flex-col items-center gap-4 p-8 text-center ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div>
        <p className="font-semibold text-slate-900 dark:text-white">Something went wrong</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500"
        >
          Try again
        </button>
      )}
    </motion.div>
  );
}
