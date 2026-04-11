import { useId } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, Area, AreaChart } from 'recharts';
import { A } from './analyticsTheme.js';

function sparkData(arr) {
  return (arr || []).map((v, i) => ({ i, v: Number(v) || 0 }));
}

export function MetricKpiCard({
  label,
  value,
  sublabel,
  trendPct,
  trendUpGood = true,
  spark,
  icon: Icon,
  gradient = 'emerald',
  delay = 0,
}) {
  const chartData = sparkData(spark?.length ? spark : [0, 0, 0, 0, 1]);
  const up = (trendPct ?? 0) >= 0;
  const good = trendUpGood ? up : !up;
  const grad =
    gradient === 'blue'
      ? [A.blue, A.blueDeep]
      : gradient === 'purple'
        ? [A.purple, A.purpleDeep]
        : [A.light, A.main];
  const gid = useId().replace(/:/g, '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111827]/95 to-[#0f172a]/90 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_20px_50px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl"
    >
      <div
        className={`${A.glowRadial} -right-6 -top-6 h-28 w-28 bg-gradient-to-br from-emerald-500/20 to-transparent`}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">{label}</p>
        {Icon ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-300 transition-colors group-hover:border-white/[0.12] group-hover:text-white">
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </div>
        ) : null}
      </div>
      <p className="relative mt-3 text-3xl font-bold tabular-nums tracking-tight text-white">{value}</p>
      {sublabel ? <p className="relative mt-1 text-xs text-slate-500">{sublabel}</p> : null}
      <div className="relative mt-3 flex items-center justify-between gap-2">
        <span
          className={`text-xs font-semibold tabular-nums ${
            good ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {up ? '+' : ''}
          {trendPct ?? 0}%
        </span>
        <span className="text-[10px] text-slate-600">vs prior</span>
      </div>
      <div className="relative mt-3 h-12 w-full opacity-90">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`spk-${gid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={grad[0]} stopOpacity={0.35} />
                <stop offset="100%" stopColor={grad[1]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={grad[0]}
              strokeWidth={1.5}
              fill={`url(#spk-${gid})`}
              isAnimationActive
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
