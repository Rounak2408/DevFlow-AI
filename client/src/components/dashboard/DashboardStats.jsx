import { motion } from 'framer-motion';
import { LayoutGrid, ListTodo, Users, Activity } from 'lucide-react';

const cards = [
  {
    key: 'boards',
    label: 'Total boards',
    icon: LayoutGrid,
    trend: '+5%',
    trendUp: true,
  },
  {
    key: 'tasks',
    label: 'Active tasks',
    icon: ListTodo,
    trend: '+5%',
    trendUp: true,
  },
  {
    key: 'members',
    label: 'Team members',
    icon: Users,
    trend: '+5%',
    trendUp: true,
  },
  {
    key: 'activity',
    label: 'Activity score',
    icon: Activity,
    trend: '+5%',
    trendUp: true,
  },
];

export function DashboardStats({ values, loading }) {
  const nums = values || { boards: 0, activeTasks: 0, members: 0, activity: 0 };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        const val =
          c.key === 'boards'
            ? nums.boards
            : c.key === 'tasks'
              ? nums.activeTasks
              : c.key === 'members'
                ? nums.members
                : nums.activity;
        return (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4, transition: { duration: 0.25, ease: 'easeOut' } }}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.05] bg-[#111827] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] transition-shadow duration-300 ease-out hover:border-blue-500/20 hover:shadow-[0_8px_32px_-12px_rgba(59,130,246,0.35)]"
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-blue-400 transition-colors duration-300 group-hover:border-blue-500/25 group-hover:text-blue-300">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <span
                className={`text-[11px] font-semibold tabular-nums ${
                  c.trendUp ? 'text-emerald-400/90' : 'text-rose-400/90'
                }`}
              >
                {c.trend}
              </span>
            </div>
            <p className="relative mt-4 text-[11px] font-medium uppercase tracking-wider text-slate-500">
              {c.label}
            </p>
            <p className="relative mt-1 text-2xl font-semibold tabular-nums tracking-tight text-white">
              {loading ? '—' : val}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
