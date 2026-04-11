import { motion } from 'framer-motion';
import {
  FileBarChart,
  ListOrdered,
  Map,
  Mail,
  AlertTriangle,
  Bug,
  Mic2,
  Sparkles,
} from 'lucide-react';

const ICONS = {
  p1: FileBarChart,
  p2: ListOrdered,
  p3: Map,
  p4: Mail,
  p5: AlertTriangle,
  p6: Bug,
  p7: Mic2,
  p8: Sparkles,
};

export function PromptCards({ items, onPick, disabled }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, i) => {
        const Icon = ICONS[item.id] || Sparkles;
        return (
          <motion.button
            key={item.id}
            type="button"
            disabled={disabled}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPick(item.text)}
            className="group relative flex items-start gap-3 rounded-[28px] border border-white/[0.08] bg-white/[0.04] p-4 text-left shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-shadow hover:border-white/[0.12] hover:bg-white/[0.06] hover:shadow-[0_28px_100px_-40px_rgba(59,130,246,0.18)] disabled:pointer-events-none disabled:opacity-40"
          >
            <span
              className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[28px] bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-60"
              aria-hidden
            />
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/15 ring-1 ring-white/10">
              <Icon className="h-4 w-4 text-blue-200/90" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold text-white">{item.label}</span>
              <span className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-400">{item.text}</span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
