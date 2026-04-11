import { motion } from 'framer-motion';

export function DashboardActivity({ items }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-white/[0.05] bg-[#111827] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-white">Recent activity</h3>
        <span className="text-[11px] font-medium text-slate-500">Live</span>
      </div>
      <ul className="mt-4 space-y-0">
        {items.length === 0 ? (
          <li className="py-6 text-center text-[13px] text-slate-500">No recent actions yet.</li>
        ) : (
          items.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 + i * 0.04, duration: 0.3 }}
              className="flex gap-3 border-b border-white/[0.04] py-3 last:border-0 last:pb-0 first:pt-0"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/30 to-slate-700 text-xs font-semibold text-white ring-2 ring-[#111827]">
                {item.initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-snug text-slate-200">{item.text}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">{item.time}</p>
              </div>
            </motion.li>
          ))
        )}
      </ul>
    </motion.div>
  );
}
