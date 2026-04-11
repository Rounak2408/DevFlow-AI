import { Search, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const TABS = ['All', 'Groups', 'Pinned', 'Archived'];

export function ChatListPanel({ project, lastPreview, activeTab, onTabChange }) {
  return (
    <div className="flex h-full w-full flex-col border-r border-white/[0.05] bg-[#111827]/90 backdrop-blur-sm">
      <div className="p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Search messages…"
            className="w-full rounded-xl border border-white/[0.05] bg-[#0B0F19] py-2.5 pl-10 pr-3 text-[13px] text-slate-200 placeholder:text-slate-500 transition duration-300 focus:border-blue-500/35 focus:outline-none focus:ring-2 focus:ring-blue-500/15"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto px-3 pb-2 scroll-thin">
        {['You', 'A', 'M', 'S'].map((x, i) => (
          <motion.button
            key={x}
            type="button"
            whileHover={{ scale: 1.05 }}
            className="flex shrink-0 flex-col items-center gap-1"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-xs font-semibold text-white transition duration-300 ${
                i === 0
                  ? 'border-blue-500/50 bg-gradient-to-br from-blue-600 to-violet-600'
                  : 'border-white/[0.08] bg-white/[0.06]'
              }`}
            >
              {i === 0 ? <Plus className="h-5 w-5" /> : x}
            </div>
            <span className="text-[10px] text-slate-500">{i === 0 ? 'Story' : ''}</span>
          </motion.button>
        ))}
      </div>

      <div className="flex gap-1 border-b border-white/[0.05] px-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onTabChange(t)}
            className={`relative shrink-0 px-2.5 py-2 text-[11px] font-medium transition duration-300 ${
              activeTab === t ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t}
            {activeTab === t && (
              <motion.span
                layoutId="chatTab"
                className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-blue-500"
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scroll-thin p-2">
        <motion.button
          type="button"
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
          className="w-full rounded-xl border border-transparent bg-blue-500/10 px-3 py-3 text-left transition duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600/40 to-violet-600/30 text-sm font-bold text-white">
              #
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#111827] bg-emerald-500" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[13px] font-semibold text-white">
                  {project?.name || 'Project'}
                </span>
                <span className="shrink-0 text-[10px] text-slate-500">Now</span>
              </div>
              <p className="mt-0.5 truncate text-[12px] text-slate-500">{lastPreview}</p>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
