import { motion } from 'framer-motion';
import { CSS } from '@dnd-kit/utilities';
import { mediaUrl } from '../../lib/mediaUrl.js';
import {
  Calendar,
  MessageCircle,
  Paperclip,
  MoreHorizontal,
  Trash2,
  GripVertical,
} from 'lucide-react';

function priorityMeta(p) {
  switch (p) {
    case 'urgent':
      return { label: 'High', dot: 'bg-orange-500', pill: 'bg-orange-500/20 text-orange-200 ring-orange-500/20' };
    case 'high':
      return { label: 'High', dot: 'bg-orange-400', pill: 'bg-orange-500/15 text-orange-200/95 ring-orange-500/15' };
    case 'low':
      return { label: 'Low', dot: 'bg-sky-400', pill: 'bg-sky-500/15 text-sky-200/90 ring-sky-500/20' };
    default:
      return { label: 'Medium', dot: 'bg-amber-400', pill: 'bg-amber-500/15 text-amber-100/90 ring-amber-500/20' };
  }
}

function formatShortDate(d) {
  if (!d) return null;
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return null;
  return x.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function KanbanTaskCard({
  task,
  onDelete,
  onOpen,
  dragProps,
  isDragging,
  isOverlay,
}) {
  const { attributes, listeners, setNodeRef, transform } = dragProps || {};
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  const pri = priorityMeta(task.priority);
  const tags = task.displayTags || [];
  const end = formatShortDate(task.dueDate);
  const assignee = task.assignee;

  const card = (
    <motion.div
      layout
      initial={isOverlay ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: isDragging && !isOverlay ? 0.45 : 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      whileHover={
        isOverlay
          ? {}
          : { y: -3, transition: { duration: 0.2 } }
      }
      onClick={(e) => {
        if (isOverlay) return;
        if (e.target.closest('button')) return;
        onOpen?.(task);
      }}
      className={`group relative cursor-pointer rounded-xl border border-white/[0.06] bg-[#0f172a] p-3.5 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition-[box-shadow,border-color] ${
        isOverlay
          ? 'scale-[1.02] cursor-grabbing border-blue-400/30 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.75),0_0_0_1px_rgba(56,189,248,0.15)]'
          : 'hover:border-blue-400/20 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.12),0_16px_40px_-16px_rgba(0,0,0,0.55)]'
      }`}
    >
      {!isOverlay && (
        <div
          {...listeners}
          {...attributes}
          className="absolute left-2 top-3 flex cursor-grab touch-none rounded-md p-1 text-slate-500 opacity-40 transition hover:bg-white/[0.06] hover:text-slate-300 group-hover:opacity-100 active:cursor-grabbing"
          aria-label="Drag task"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}
      <div className={!isOverlay ? 'pl-7' : ''}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] font-semibold leading-snug tracking-tight text-white">{task.title}</p>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="rounded-md p-1 text-slate-500 opacity-0 transition group-hover:opacity-100 hover:bg-white/[0.06] hover:text-slate-300"
              aria-label="More"
              title="More actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(task.id);
              }}
              className="rounded-md p-1 text-slate-500 opacity-0 transition group-hover:opacity-100 hover:bg-rose-500/15 hover:text-rose-400"
              aria-label="Delete task"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        {task.description ? (
          <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-slate-500">{task.description}</p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${pri.pill}`}
          >
            {pri.label}
          </span>
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-200/85"
            >
              {tag}
            </span>
          ))}
        </div>
        {end ? (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
            <Calendar className="h-3.5 w-3.5 text-slate-600" title="Due date" />
            <span className="text-slate-400">Due {end}</span>
          </div>
        ) : null}
        {task.progress != null ? (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[10px] text-slate-600">
              <span>Progress</span>
              <span className="font-mono text-slate-500">{Math.round(task.progress * 100)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800/80">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${task.progress * 100}%` }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-emerald-500 to-emerald-400"
              />
            </div>
          </div>
        ) : null}
        <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-3">
          <div className="flex -space-x-2">
            {assignee?.avatar ? (
              <img
                src={mediaUrl(assignee.avatar)}
                alt=""
                className="h-8 w-8 rounded-full border-2 border-[#0f172a] object-cover ring-1 ring-white/10"
                title={assignee.name}
              />
            ) : assignee?.avatarEmoji ? (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0f172a] bg-gradient-to-br from-indigo-600 to-violet-600 text-sm leading-none ring-1 ring-white/10"
                title={assignee.name}
              >
                {assignee.avatarEmoji}
              </div>
            ) : assignee?.name ? (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0f172a] bg-gradient-to-br from-indigo-600 to-violet-600 text-[10px] font-bold text-white ring-1 ring-white/10"
                title={assignee.name}
              >
                {assignee.name.slice(0, 1).toUpperCase()}
              </div>
            ) : (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-white/10 text-[10px] text-slate-600"
                title="Unassigned"
              >
                ?
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span className="inline-flex items-center gap-1 text-[11px]" title="Comments">
              <MessageCircle className="h-3.5 w-3.5" />
              {task.commentCount ?? 0}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px]" title="Attachments">
              <Paperclip className="h-3.5 w-3.5" />
              {task.attachmentCount ?? 0}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (isOverlay) return card;

  return (
    <div ref={setNodeRef} style={style} className="touch-manipulation">
      {card}
    </div>
  );
}
