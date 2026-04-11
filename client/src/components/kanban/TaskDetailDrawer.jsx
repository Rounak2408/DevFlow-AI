import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Flag,
  Sparkles,
  MessageSquare,
  ListChecks,
  History,
  FolderOpen,
  Paperclip,
} from 'lucide-react';
import { getDrawerExtras } from './kanbanDemoData.js';

function formatDate(d) {
  if (!d) return '—';
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return '—';
  return x.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function TaskDetailDrawer({ task, open, onClose, isDemoTask }) {
  const extras = task ? getDrawerExtras(task, isDemoTask) : null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && task && extras ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
            aria-label="Close panel"
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-drawer-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-0 right-0 top-0 z-[71] flex w-full max-w-lg flex-col border-l border-white/[0.08] bg-[#0B0F19] shadow-[-12px_0_48px_rgba(0,0,0,0.45)]"
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-500/80">Task</p>
                <h2 id="task-drawer-title" className="mt-1 text-lg font-bold leading-snug text-white">
                  {task.title}
                </h2>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5">
                    <Flag className="h-3 w-3 text-amber-400/80" />
                    {task.priority}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5">
                    <Calendar className="h-3 w-3 text-sky-400/80" />
                    Due {formatDate(task.dueDate)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="scroll-thin flex-1 overflow-y-auto px-5 py-5">
              {task.description ? (
                <section className="mb-8">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{task.description}</p>
                </section>
              ) : null}

              <section className="mb-8">
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <ListChecks className="h-3.5 w-3.5" />
                  Checklist
                </h3>
                <ul className="space-y-2">
                  {extras.checklist.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#111827]/60 px-3 py-2.5"
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          c.done ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300' : 'border-slate-600'
                        }`}
                      >
                        {c.done ? '✓' : ''}
                      </span>
                      <span className={`text-sm ${c.done ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                        {c.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mb-8">
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Comments
                </h3>
                <ul className="space-y-3">
                  {extras.comments.map((m) => (
                    <li key={m.id} className="rounded-xl border border-white/[0.06] bg-[#111827]/50 p-3">
                      <p className="text-xs font-semibold text-slate-300">{m.author}</p>
                      <p className="mt-1 text-sm text-slate-400">{m.text}</p>
                      <p className="mt-2 text-[10px] text-slate-600">{m.at}</p>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mb-8">
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <History className="h-3.5 w-3.5" />
                  Activity
                </h3>
                <ul className="relative space-y-0 border-l border-white/[0.08] pl-4">
                  {extras.activity.map((a) => (
                    <li key={a.id} className="relative pb-4 text-sm text-slate-400 last:pb-0">
                      <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-slate-600 ring-4 ring-[#0B0F19]" />
                      {a.text}
                      <span className="mt-0.5 block text-[10px] text-slate-600">{a.at}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mb-8">
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <FolderOpen className="h-3.5 w-3.5" />
                  Files
                </h3>
                <ul className="space-y-2">
                  {extras.files.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-[#111827]/50 px-3 py-2"
                    >
                      <span className="flex items-center gap-2 text-sm text-slate-300">
                        <Paperclip className="h-3.5 w-3.5 text-slate-500" />
                        {f.name}
                      </span>
                      <span className="text-[10px] text-slate-600">{f.size}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/[0.08] to-blue-500/[0.05] p-4 shadow-[0_0_40px_-12px_rgba(139,92,246,0.35)]">
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-200/90">
                  <Sparkles className="h-4 w-4" />
                  AI suggestions
                </h3>
                <ul className="mt-3 space-y-2">
                  {extras.aiSuggestions.map((line, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-300">
                      <span className="text-violet-400/80">→</span>
                      {line}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[10px] text-slate-600">Illustrative suggestions — not generated live.</p>
              </section>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
