import { motion } from 'framer-motion';

const COLS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function ActivityHeatmap({ matrix, delay = 0 }) {
  if (!matrix?.length) return null;
  return (
    <div className="space-y-3">
      <div className="flex justify-between gap-1 pl-8">
        {COLS.map((d) => (
          <span key={d} className="flex-1 text-center text-[9px] font-medium text-slate-600">
            {d}
          </span>
        ))}
      </div>
      <div className="space-y-1.5">
        {matrix.map((row, ri) => (
          <div key={ri} className="flex items-center gap-2">
            <span className="w-6 shrink-0 text-[9px] text-slate-600">{ri + 9}h</span>
            <div className="flex flex-1 gap-1">
              {row.map((intensity, ci) => (
                <motion.div
                  key={ci}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: delay + ci * 0.02 + ri * 0.04, duration: 0.25 }}
                  className="h-7 min-w-0 flex-1 rounded-md border border-white/[0.04]"
                  style={{
                    background: `linear-gradient(135deg, rgba(16,185,129,${0.08 + intensity * 0.55}) 0%, rgba(56,189,248,${intensity * 0.25}) 100%)`,
                    boxShadow:
                      intensity > 0.55
                        ? `0 0 12px rgba(52,211,153,${intensity * 0.25})`
                        : undefined,
                  }}
                  title={`Intensity ${Math.round(intensity * 100)}%`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 text-[10px] text-slate-600">
        <span>Less</span>
        <div className="flex gap-0.5">
          {[0.15, 0.35, 0.55, 0.75, 0.95].map((a) => (
            <span
              key={a}
              className="h-3 w-3 rounded-sm border border-white/[0.06]"
              style={{
                background: `linear-gradient(135deg, rgba(16,185,129,${a}) 0%, rgba(56,189,248,${a * 0.4}) 100%)`,
              }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
