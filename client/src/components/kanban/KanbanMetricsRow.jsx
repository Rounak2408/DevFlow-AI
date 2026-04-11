import { useId } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

function MiniSpark({ data, color, uid }) {
  const chartData = (data || []).map((v, i) => ({ i, v }));
  const gid = uid.replace(/:/g, '');
  return (
    <div className="h-10 w-full opacity-90">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`kmg-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#kmg-${gid})`}
            isAnimationActive
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function KanbanMetricsRow({ tasks, delay = 0 }) {
  const rid = useId();
  const total = tasks.length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedToday = tasks.filter((t) => {
    if (t.status !== 'done' || !t.updatedAt) return false;
    const u = new Date(t.updatedAt);
    u.setHours(0, 0, 0, 0);
    return u.getTime() === today.getTime();
  }).length;
  const velocity = tasks.filter((t) => t.status === 'done').length;
  const pendingReview = tasks.filter((t) => t.status === 'review').length;

  const sparkA = [3, 4, 3, 6, 5, 8, total || 2];
  const sparkB = [0, 1, 0, 2, 1, 3, completedToday + 1];
  const sparkC = [2, 3, 4, 5, 6, 7, velocity || 1];
  const sparkD = [1, 2, 2, 1, 3, 2, pendingReview + 1];

  const cards = [
    { label: 'Total tasks', value: total, sub: 'Across all columns', spark: sparkA, color: '#38bdf8' },
    { label: 'Completed today', value: completedToday, sub: 'Moved to Done', spark: sparkB, color: '#34d399' },
    { label: 'Sprint velocity', value: velocity, sub: 'Done this board', spark: sparkC, color: '#a78bfa' },
    { label: 'Pending reviews', value: pendingReview, sub: 'In Review column', spark: sparkD, color: '#fb923c' },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: delay + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -2 }}
          className="rounded-xl border border-white/[0.06] bg-[#111827]/80 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-sm"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{c.label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-white">{c.value}</p>
          <p className="text-[11px] text-slate-600">{c.sub}</p>
          <MiniSpark data={c.spark} color={c.color} uid={`${rid}-${i}`} />
        </motion.div>
      ))}
    </div>
  );
}
