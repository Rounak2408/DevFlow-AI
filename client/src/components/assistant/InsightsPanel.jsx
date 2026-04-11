import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle2, CalendarClock, ListTodo, Users, FileText, LayoutGrid } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton.jsx';

function Card({ icon: Icon, title, children, delay = 0, compact }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.04] p-4 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.95)] backdrop-blur-xl ${compact ? 'min-w-[260px] shrink-0' : ''}`}
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        aria-hidden
      />
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        <Icon className="h-3.5 w-3.5 text-blue-400/90" />
        {title}
      </div>
      <div className="mt-3">{children}</div>
    </motion.div>
  );
}

export function InsightsPanel({ data, loading, compact }) {
  if (loading) {
    return (
      <div className={compact ? 'flex gap-3 overflow-x-auto pb-1' : 'space-y-3'}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className={compact ? 'h-28 min-w-[220px] rounded-[28px]' : 'h-24 rounded-[28px]'} />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-[28px] border border-white/[0.06] bg-white/[0.02] p-6 text-center text-sm text-slate-500">
        Insights unavailable. Open a workspace and add tasks to unlock live stats.
      </div>
    );
  }

  const { productivityScore, totals, suggestedPriorities, upcomingDeadlines, projectSummaries, reportsSummary } = data;

  const cards = [
    <Card key="score" icon={TrendingUp} title="Productivity score" delay={0} compact={compact}>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold tracking-tight text-white">{productivityScore}</span>
          <span className="pb-1 text-xs text-slate-500">/ 100</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          Blended from completion rate, overdue pressure, and your open workload.
        </p>
    </Card>,

    <Card key="open" icon={ListTodo} title="Today & open work" delay={0.05} compact={compact}>
        <ul className="space-y-1.5 text-xs text-slate-300">
          <li className="flex justify-between gap-2">
            <span className="text-slate-500">My open tasks</span>
            <span className="font-medium text-white">{totals.mineOpen}</span>
          </li>
          <li className="flex justify-between gap-2">
            <span className="text-slate-500">All pending</span>
            <span className="font-medium text-white">{totals.pending}</span>
          </li>
          <li className="flex justify-between gap-2">
            <span className="text-slate-500">Due this week</span>
            <span className="font-medium text-amber-200/90">{totals.dueThisWeek}</span>
          </li>
        </ul>
    </Card>,

    <Card key="deadlines" icon={CalendarClock} title="Upcoming deadlines" delay={0.1} compact={compact}>
        {upcomingDeadlines?.length ? (
          <ul className="max-h-36 space-y-2 overflow-y-auto text-xs">
            {upcomingDeadlines.map((d) => (
              <li key={d.id} className="flex flex-col gap-0.5 rounded-xl bg-black/20 px-2 py-1.5 ring-1 ring-white/[0.04]">
                <span className="font-medium text-slate-200">{d.title}</span>
                <span className="text-[10px] text-slate-500">
                  {d.dueDate ? new Date(d.dueDate).toLocaleDateString() : '—'} · {d.priority}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500">No dated tasks — add due dates in Issues.</p>
        )}
    </Card>,

    <Card key="prio" icon={CheckCircle2} title="AI suggested priorities" delay={0.12} compact={compact}>
        {suggestedPriorities?.length ? (
          <ol className="list-decimal space-y-1.5 pl-4 text-xs text-slate-300">
            {suggestedPriorities.map((t) => (
              <li key={t.id}>
                <span className="text-slate-200">{t.title}</span>
                <span className="ml-1 text-slate-500">
                  ({t.priority}, {t.status})
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-xs text-slate-500">No open tasks to rank.</p>
        )}
    </Card>,

    <Card key="block" icon={Users} title="Team blockers (heuristic)" delay={0.14} compact={compact}>
        <p className="text-xs text-slate-400">
          Flagged ~<span className="font-semibold text-white">{totals.blockedGuess}</span> tasks with blocker-like wording in
          titles. Ask the assistant for a deeper pass.
        </p>
    </Card>,

    <Card key="rep" icon={FileText} title="Reports snapshot" delay={0.16} compact={compact}>
        <p className="text-xs text-slate-300">
          Completion <span className="font-semibold text-white">{reportsSummary?.completionRate ?? 0}%</span> across{' '}
          <span className="text-white">{totals.tasks}</span> tasks.
        </p>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{reportsSummary?.note}</p>
    </Card>,

    <Card key="ws" icon={LayoutGrid} title="Workspaces" delay={0.18} compact={compact}>
        {projectSummaries?.length ? (
          <ul className="max-h-28 space-y-1 overflow-y-auto text-xs text-slate-400">
            {projectSummaries.map((p) => (
              <li key={p.id} className="truncate">
                <span className="text-slate-200">{p.name}</span>
                <span className="text-slate-600"> · {p.role}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500">No workspaces yet.</p>
        )}
    </Card>,
  ];

  if (compact) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {cards}
      </div>
    );
  }

  return <div className="flex max-h-[calc(100vh-8rem)] flex-col gap-3 overflow-y-auto pr-1">{cards}</div>;
}
