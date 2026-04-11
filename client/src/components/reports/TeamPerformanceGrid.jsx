import { motion } from 'framer-motion';
import { MemberAvatar } from '../workspace/MemberAvatar.jsx';

const workloadStyle = {
  light: 'bg-sky-500/15 text-sky-200 ring-sky-500/25',
  balanced: 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/25',
  high: 'bg-amber-500/15 text-amber-200 ring-amber-500/25',
  focused: 'bg-violet-500/15 text-violet-200 ring-violet-500/25',
};

export function TeamPerformanceGrid({ members, delay = 0.15 }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((m, i) => (
        <motion.div
          key={m.id || m.name + i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -2 }}
          className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#111827]/90 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]"
        >
          <MemberAvatar
            user={{
              name: m.name,
              avatar: m.avatar,
              avatarEmoji: m.avatarEmoji,
            }}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-white">{m.name}</p>
            {m.jobTitle ? <p className="truncate text-[11px] text-slate-500">{m.jobTitle}</p> : null}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-500">
                <span className="font-mono text-slate-300">{m.completed}</span> done
              </span>
              <span className="text-[11px] text-slate-500">
                Velocity <span className="font-mono text-emerald-400/90">{m.velocity}</span>
              </span>
            </div>
            <span
              className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ring-1 ${workloadStyle[m.workload] || workloadStyle.balanced}`}
            >
              {m.workload} load
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
