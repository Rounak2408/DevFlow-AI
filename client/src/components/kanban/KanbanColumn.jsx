import { useDroppable, useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Plus, MoreHorizontal } from 'lucide-react';
import { KanbanTaskCard } from './KanbanTaskCard.jsx';

const ACCENT = {
  todo: {
    bar: 'bg-blue-500',
    glow: 'from-blue-500/15',
    ring: 'ring-blue-500/25',
  },
  in_progress: {
    bar: 'bg-violet-500',
    glow: 'from-violet-500/15',
    ring: 'ring-violet-500/30',
  },
  review: {
    bar: 'bg-orange-500',
    glow: 'from-orange-500/15',
    ring: 'ring-orange-500/25',
  },
  done: {
    bar: 'bg-emerald-500',
    glow: 'from-emerald-500/15',
    ring: 'ring-emerald-500/25',
  },
};

function DraggableTask({ task, onDelete, onOpen }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(task.id),
    data: { task },
  });
  return (
    <KanbanTaskCard
      task={task}
      onDelete={onDelete}
      onOpen={onOpen}
      dragProps={{ attributes, listeners, setNodeRef, transform }}
      isDragging={isDragging}
    />
  );
}

export function KanbanColumn({ col, tasks, onDelete, onOpen, onAddTask, delay, isDragActive }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  const accent = ACCENT[col.id] || ACCENT.todo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`flex w-[min(100%,300px)] shrink-0 flex-col rounded-2xl border border-white/[0.06] bg-[#111827]/85 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset,0_20px_50px_-24px_rgba(0,0,0,0.55)] backdrop-blur-xl ${
        isOver ? `ring-2 ${accent.ring} ring-offset-2 ring-offset-[#0B0F19]` : ''
      }`}
    >
      <div className="sticky top-0 z-10 relative border-b border-white/[0.06] bg-[#111827]/95 px-3 py-3 backdrop-blur-md">
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${accent.glow} to-transparent opacity-50`}
          aria-hidden
        />
        <div className="relative flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className={`h-2 w-2 shrink-0 rounded-full ${accent.bar} shadow-[0_0_8px_currentColor]`} />
          <h3 className="truncate text-[13px] font-semibold tracking-tight text-white">{col.label}</h3>
          <span className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.05] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-400">
            {tasks.length}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => onAddTask?.(col.id)}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-emerald-500/15 hover:text-emerald-300"
            aria-label="Add task"
            title="Add task"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-300"
            aria-label="Column menu"
            title="Column menu"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className="scroll-thin flex max-h-[min(52dvh,420px)] min-h-[220px] flex-col gap-2.5 overflow-y-auto p-3 sm:min-h-[280px] md:max-h-[calc(100vh-380px)]"
      >
        {tasks.map((t) => (
          <DraggableTask key={t.id} task={t} onDelete={onDelete} onOpen={onOpen} />
        ))}
        {isOver && isDragActive ? (
          <div className="flex min-h-[100px] items-center justify-center rounded-xl border-2 border-dashed border-blue-400/35 bg-blue-500/[0.06] text-[11px] font-medium text-blue-200/70">
            Drop here
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
