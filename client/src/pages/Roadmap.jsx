import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Flag, Milestone, ChevronRight } from 'lucide-react';

const PHASES = [
  { id: '1', title: 'Foundation', range: 'Q1', items: ['Core API', 'Auth & workspaces', 'Realtime messaging'], status: 'done' },
  { id: '2', title: 'Delivery', range: 'Q2', items: ['Kanban + tasks', 'GitHub activity', 'Member profiles'], status: 'active' },
  { id: '3', title: 'Scale', range: 'Q3', items: ['Analytics v2', 'Roadmap sharing', 'Automation rules'], status: 'upcoming' },
];

export function Roadmap() {
  const { projectId } = useParams();

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-400/80">
          <Map className="h-3.5 w-3.5" />
          Roadmap
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-[28px]">Product timeline</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          High-level phases for this workspace — connect delivery work on the board to where we’re headed.
        </p>
      </div>

      <div className="relative space-y-0 pl-2">
        <div className="absolute bottom-4 left-[19px] top-4 w-px bg-gradient-to-b from-blue-500/40 via-violet-500/30 to-emerald-500/20" aria-hidden />
        {PHASES.map((phase, i) => (
          <motion.div
            key={phase.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.06 * i, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex gap-5 pb-10 last:pb-0"
          >
            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-[#111827] shadow-lg shadow-black/30">
              {phase.status === 'done' ? (
                <Flag className="h-4 w-4 text-emerald-400" />
              ) : phase.status === 'active' ? (
                <Milestone className="h-4 w-4 text-blue-400" />
              ) : (
                <Milestone className="h-4 w-4 text-slate-600" />
              )}
            </div>
            <div className="min-w-0 flex-1 rounded-2xl border border-white/[0.06] bg-[#111827]/80 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-slate-500">{phase.range}</p>
                  <h2 className="text-lg font-semibold text-white">{phase.title}</h2>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                    phase.status === 'done'
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : phase.status === 'active'
                        ? 'bg-blue-500/15 text-blue-300'
                        : 'bg-slate-500/15 text-slate-400'
                  }`}
                >
                  {phase.status}
                </span>
              </div>
              <ul className="mt-4 space-y-2">
                {phase.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-400">
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      {projectId ? (
        <Link
          to={`/app/projects/${projectId}/board`}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300"
        >
          Open issues board
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
