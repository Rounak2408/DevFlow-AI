import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Plus,
  ChevronDown,
  LayoutGrid,
  Table2,
  CalendarDays,
  UserPlus,
  Filter,
} from 'lucide-react';
import api from '../lib/api.js';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { ErrorFallback } from '../components/ui/ErrorFallback.jsx';
import { DEMO_TASKS, enrichTaskDisplay, enrichDemoTask } from '../components/kanban/kanbanDemoData.js';
import { KanbanColumn } from '../components/kanban/KanbanColumn.jsx';
import { KanbanTaskCard } from '../components/kanban/KanbanTaskCard.jsx';
import { KanbanMetricsRow } from '../components/kanban/KanbanMetricsRow.jsx';
import { TaskDetailDrawer } from '../components/kanban/TaskDetailDrawer.jsx';
import { KanbanEmptyState } from '../components/kanban/KanbanEmptyState.jsx';

const COLUMNS = [
  { id: 'todo', label: 'New tasks' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Completed' },
];

function isDemoId(id) {
  return String(id).startsWith('demo-');
}

function seedDemoTasks() {
  return DEMO_TASKS.map((t) => ({ ...t }));
}

export function Kanban() {
  const { projectId } = useParams();
  const [remoteTasks, setRemoteTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [demoOn, setDemoOn] = useState(false);
  const [demoTasks, setDemoTasks] = useState(() => seedDemoTasks());

  const [openCreate, setOpenCreate] = useState(false);
  const [createStatus, setCreateStatus] = useState('todo');
  const [title, setTitle] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [activeView, setActiveView] = useState('kanban');
  const [filterPriority, setFilterPriority] = useState('all');
  const [drawerTask, setDrawerTask] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.35' } },
    }),
  };

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [tasksRes, projRes] = await Promise.all([
        api.get(`/projects/${projectId}/tasks`),
        api.get(`/projects/${projectId}`).catch(() => ({ data: null })),
      ]);
      const list = tasksRes.data.tasks || [];
      setRemoteTasks(list);
      setProject(projRes.data?.project || null);
      if (list.length > 0) setDemoOn(false);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const rawBoardTasks = remoteTasks.length > 0 ? remoteTasks : demoOn ? demoTasks : [];

  const displayTasks = useMemo(() => {
    return rawBoardTasks.map((t) => (isDemoId(t.id) ? enrichDemoTask(t) : enrichTaskDisplay(t)));
  }, [rawBoardTasks]);

  const filteredTasks = useMemo(() => {
    if (filterPriority === 'all') return displayTasks;
    return displayTasks.filter((t) => t.priority === filterPriority);
  }, [displayTasks, filterPriority]);

  const grouped = useMemo(() => {
    const g = { todo: [], in_progress: [], review: [], done: [] };
    filteredTasks.forEach((t) => {
      if (g[t.status]) g[t.status].push(t);
    });
    return g;
  }, [filteredTasks]);

  const activeTask = activeId ? displayTasks.find((t) => String(t.id) === String(activeId)) : null;

  const isEmptyBoard = remoteTasks.length === 0 && !demoOn;

  async function createTask(e) {
    e.preventDefault();
    try {
      const { data } = await api.post(`/projects/${projectId}/tasks`, {
        title,
        status: createStatus,
      });
      setRemoteTasks((prev) => [data.task, ...prev]);
      setDemoOn(false);
      setTitle('');
      setOpenCreate(false);
      toast.success('Task created');
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function deleteTask(id) {
    if (isDemoId(id)) {
      setDemoTasks((prev) => prev.filter((t) => String(t.id) !== String(id)));
      toast.success('Removed from sample board');
      return;
    }
    try {
      await api.delete(`/projects/${projectId}/tasks/${id}`);
      setRemoteTasks((prev) => prev.filter((t) => String(t.id) !== String(id)));
      toast.success('Task removed');
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function moveTask(taskId, status) {
    if (isDemoId(taskId)) {
      setDemoTasks((prev) =>
        prev.map((t) => (String(t.id) === String(taskId) ? { ...t, status } : t)),
      );
      return;
    }
    try {
      const { data } = await api.patch(`/projects/${projectId}/tasks/${taskId}`, { status });
      setRemoteTasks((prev) => prev.map((t) => (String(t.id) === String(taskId) ? data.task : t)));
    } catch (e) {
      toast.error(e.message);
    }
  }

  function onDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const taskId = String(active.id);
    let colId = COLUMNS.find((c) => c.id === over.id)?.id;
    if (!colId) {
      const overTask = rawBoardTasks.find((t) => String(t.id) === String(over.id));
      if (overTask) colId = overTask.status;
    }
    if (!colId) return;
    const task = rawBoardTasks.find((t) => String(t.id) === taskId);
    if (task && task.status !== colId) moveTask(taskId, colId);
  }

  const openCreateForColumn = (colId) => {
    setCreateStatus(colId);
    setOpenCreate(true);
  };

  const trySampleBoard = () => {
    setDemoTasks(seedDemoTasks());
    setDemoOn(true);
    toast.success('Sample board loaded');
  };

  const boardTitle = project?.name || 'Board';

  if (err && !loading) {
    return (
      <div className="max-w-lg p-4">
        <ErrorFallback message={err} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-x-hidden bg-[#0B0F19]">
      <header className="shrink-0 border-b border-white/[0.06] px-3 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <nav className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
              <Link to="/app" className="transition hover:text-slate-300">
                Boards
              </Link>
              <span className="text-slate-700">/</span>
              <Link
                to={`/app/projects/${projectId}`}
                className="max-w-[160px] truncate transition hover:text-slate-300"
              >
                {boardTitle}
              </Link>
              <span className="text-slate-700">/</span>
              <span className="font-medium text-slate-400">Board</span>
            </nav>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-[28px]">{boardTitle}</h1>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-500">
              Sprint progress and active delivery pipeline — drag cards to update status.
            </p>
          </div>
          <div className="flex min-w-0 flex-col gap-3 overflow-x-auto scroll-thin pb-0.5 sm:flex-row sm:flex-wrap sm:items-center sm:overflow-visible sm:pb-0">
            <div className="relative flex shrink-0 items-center gap-2 rounded-xl border border-white/[0.08] bg-[#111827]/80 px-3 py-2">
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="cursor-pointer appearance-none bg-transparent pr-6 text-xs font-medium text-slate-300 focus:outline-none"
                aria-label="Filter by priority"
              >
                <option value="all">All priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
            </div>
            <div className="flex w-max shrink-0 rounded-xl border border-white/[0.08] bg-[#111827]/60 p-1">
              {[
                { id: 'kanban', label: 'Kanban', Icon: LayoutGrid },
                { id: 'table', label: 'Table', Icon: Table2 },
                { id: 'calendar', label: 'Calendar', Icon: CalendarDays },
              ].map((v) => {
                const Icon = v.Icon;
                const on = activeView === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setActiveView(v.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      on ? 'bg-white/[0.1] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 opacity-80" />
                    {v.label}
                  </button>
                );
              })}
            </div>
            <Link
              to={`/app/projects/${projectId}/members`}
              className="inline-flex shrink-0 touch-manipulation items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.07] sm:px-4"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Invite member
            </Link>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setCreateStatus('todo');
                setOpenCreate(true);
              }}
              className="inline-flex shrink-0 touch-manipulation items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-violet-600 to-emerald-600 px-3 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-900/25 sm:px-4"
            >
              <Plus className="h-4 w-4" />
              Create task
            </motion.button>
          </div>
        </div>
      </header>

      <div className="min-h-0 min-w-0 flex-1 overflow-hidden px-3 py-4 sm:px-6 sm:py-5">
        {loading ? (
          <Skeleton className="h-[min(520px,72vh)] w-full max-w-6xl rounded-2xl" />
        ) : isEmptyBoard ? (
          <KanbanEmptyState
            onTrySample={trySampleBoard}
            onCreateTask={() => {
              setCreateStatus('todo');
              setOpenCreate(true);
            }}
          />
        ) : activeView === 'table' ? (
          <div className="scroll-thin overflow-auto rounded-2xl border border-white/[0.06] bg-[#111827]/50">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Assignee</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((t) => (
                  <tr
                    key={t.id}
                    className="cursor-pointer border-b border-white/[0.04] transition hover:bg-white/[0.03]"
                    onClick={() => setDrawerTask(t)}
                  >
                    <td className="px-4 py-3 font-medium text-white">{t.title}</td>
                    <td className="px-4 py-3 text-slate-400">{t.status.replace('_', ' ')}</td>
                    <td className="px-4 py-3 capitalize text-slate-400">{t.priority}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{t.assignee?.name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeView === 'calendar' ? (
          <div className="rounded-2xl border border-white/[0.06] bg-[#111827]/40 p-6">
            <p className="text-sm font-semibold text-white">Calendar</p>
            <p className="mt-1 text-xs text-slate-500">Two-week horizon from tasks with due dates</p>
            <div className="mt-6 grid grid-cols-7 gap-2 text-center text-[10px] font-semibold uppercase text-slate-500">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2">
              {Array.from({ length: 14 }).map((_, i) => {
                const day = new Date();
                day.setDate(day.getDate() + i);
                const key = day.toISOString().slice(0, 10);
                const dayTasks = filteredTasks.filter((t) => t.dueDate && new Date(t.dueDate).toISOString().slice(0, 10) === key);
                return (
                  <div
                    key={key}
                    className="flex min-h-[72px] flex-col rounded-xl border border-white/[0.05] bg-[#0f172a]/80 p-2"
                  >
                    <span className="text-[11px] font-semibold text-slate-400">{day.getDate()}</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {dayTasks.slice(0, 3).map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setDrawerTask(t)}
                          className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                          title={t.title}
                        />
                      ))}
                      {dayTasks.length > 3 ? (
                        <span className="text-[9px] text-slate-600">+{dayTasks.length - 3}</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            <KanbanMetricsRow tasks={displayTasks} delay={0.02} />
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={(e) => setActiveId(e.active.id)}
              onDragCancel={() => setActiveId(null)}
              onDragEnd={onDragEnd}
            >
              <div className="flex h-full min-h-[420px] gap-4 overflow-x-auto pb-4 scroll-thin">
                {COLUMNS.map((col, i) => (
                  <KanbanColumn
                    key={col.id}
                    col={col}
                    tasks={grouped[col.id]}
                    onDelete={deleteTask}
                    onOpen={setDrawerTask}
                    onAddTask={openCreateForColumn}
                    delay={0.06 + i * 0.05}
                    isDragActive={Boolean(activeId)}
                  />
                ))}
              </div>
              <DragOverlay dropAnimation={dropAnimation}>
                {activeTask ? <KanbanTaskCard task={activeTask} isOverlay /> : null}
              </DragOverlay>
            </DndContext>
          </>
        )}
      </div>

      <TaskDetailDrawer
        task={drawerTask}
        open={Boolean(drawerTask)}
        onClose={() => setDrawerTask(null)}
        isDemoTask={drawerTask ? isDemoId(drawerTask.id) : false}
      />

      {openCreate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] backdrop-blur-sm sm:items-center sm:pb-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-h-[min(90dvh,calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-2rem))] w-full max-w-md overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#111827] p-6 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-white">New task</h3>
            <p className="mt-1 text-xs text-slate-500">Creates a real task on this project (sample board is local only).</p>
            <form onSubmit={createTask} className="mt-4 space-y-3">
              <input
                required
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0B0F19] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              />
              <label className="block text-[11px] font-medium text-slate-500">
                Column
                <select
                  value={createStatus}
                  onChange={(e) => setCreateStatus(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#0B0F19] px-3 py-2 text-sm text-white"
                >
                  {COLUMNS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenCreate(false)}
                  className="rounded-xl px-4 py-2 text-sm text-slate-400 hover:bg-white/[0.06]"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-sm font-bold text-white"
                >
                  Add task
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
