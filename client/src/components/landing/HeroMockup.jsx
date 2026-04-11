import {
  Inbox,
  LayoutGrid,
  Map,
  FolderKanban,
  CircleDot,
  ChevronRight,
  MessageSquare,
  GitBranch,
} from 'lucide-react';

export function HeroMockup() {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c0c] shadow-[0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.06),0_-20px_80px_-20px_rgba(99,102,241,0.25)]"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="flex h-[min(52vh,520px)] min-h-[320px]">
        <aside className="hidden w-[200px] shrink-0 border-r border-white/[0.06] bg-black/40 sm:block">
          <div className="flex h-10 items-center gap-2 border-b border-white/[0.06] px-3">
            <div className="h-5 w-5 rounded bg-white/10" />
            <span className="text-[11px] font-medium tracking-wide text-white/50">DevFlow</span>
          </div>
          <nav className="space-y-0.5 p-2 text-[12px]">
            {[
              { icon: Inbox, label: 'Inbox', active: false },
              { icon: CircleDot, label: 'My issues', active: true },
              { icon: Map, label: 'Roadmaps', active: false },
              { icon: FolderKanban, label: 'Projects', active: false },
              { icon: LayoutGrid, label: 'Board', active: false },
            ].map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${
                  active ? 'bg-white/[0.06] text-white' : 'text-white/40 hover:bg-white/[0.03]'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                <span className="truncate">{label}</span>
              </div>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-[#080808]">
          <header className="flex h-10 items-center justify-between border-b border-white/[0.06] px-3 sm:px-4">
            <div className="flex items-center gap-2 text-[11px] text-white/35">
              <span>Engineering</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white/50">DF-2041</span>
            </div>
            <div className="flex -space-x-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-6 w-6 rounded-full border border-[#0a0a0a] bg-gradient-to-br from-indigo-400/80 to-violet-600/80"
                  style={{ zIndex: 3 - i }}
                />
              ))}
            </div>
          </header>

          <div className="scroll-thin flex-1 overflow-y-auto p-3 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-200/90">
                In progress
              </span>
              <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-white/45">
                High priority
              </span>
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300/80">
                Sprint 24
              </span>
            </div>

            <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
              Refactor realtime sync layer
            </h2>
            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-white/45">
              Consolidate Socket.io rooms per project, add optimistic message UI, and harden Redis-backed
              AI queue retries for production traffic.
            </p>

            <div className="mt-5 space-y-2 rounded-lg border border-white/[0.06] bg-black/50 p-3 font-mono text-[11px] leading-relaxed text-white/55">
              <div className="text-white/25">// server/socket/index.js</div>
              <div>
                <span className="text-violet-300/90">socket</span>
                <span className="text-white/35">.on(</span>
                <span className="text-emerald-300/80">'chat:message'</span>
                <span className="text-white/35">, </span>
                <span className="text-amber-200/80">async</span>
                <span className="text-white/35"> (payload) =&gt; {'{'}</span>
              </div>
              <div className="pl-3 text-white/40">
                <span className="text-amber-200/80">await</span> persistMessage(payload);
              </div>
              <div className="text-white/35">{'}'});</div>
            </div>

            <div className="mt-5 flex flex-wrap gap-4 border-t border-white/[0.05] pt-4 text-[11px] text-white/35">
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> 12 comments
              </span>
              <span className="inline-flex items-center gap-1.5">
                <GitBranch className="h-3.5 w-3.5" /> devflow/api
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
