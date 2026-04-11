import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { refIdString } from '../utils/projectAccess.js';

/** Projects the user can access (owner or member). */
export async function getAccessibleProjects(userId) {
  const uid = String(userId);
  const projects = await Project.find({
    $or: [{ owner: userId }, { 'members.user': userId }],
  })
    .select('name description updatedAt owner members')
    .sort({ updatedAt: -1 })
    .lean();

  return projects.map((p) => {
    const ownerId = refIdString(p.owner);
    const isOwner = ownerId === uid;
    const m = p.members?.find((x) => refIdString(x.user) === uid);
    return {
      id: String(p._id),
      name: p.name,
      description: p.description || '',
      role: isOwner ? 'Owner' : m?.role === 'admin' ? 'Admin' : 'Member',
      updatedAt: p.updatedAt,
    };
  });
}

function taskLine(t, projectName) {
  const due = t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : 'no due date';
  const assignee =
    t.assignee && typeof t.assignee === 'object' && t.assignee.name ? t.assignee.name : 'unassigned';
  return `- [${projectName}] ${t.title} | status=${t.status} | priority=${t.priority} | assignee=${assignee} | due=${due}`;
}

/**
 * Compact text block injected into the assistant system prompt (real DevFlow data).
 */
export async function buildDevFlowContextBlock(userId, userName = 'User') {
  const projects = await getAccessibleProjects(userId);
  if (!projects.length) {
    return `## DevFlow workspace context\nUser: ${userName}\nNo workspaces yet. Encourage creating a project on Boards.\n`;
  }

  const ids = projects.map((p) => p.id);
  const tasks = await Task.find({ project: { $in: ids } })
    .populate('assignee', 'name email')
    .populate('createdBy', 'name')
    .sort({ dueDate: 1, updatedAt: -1 })
    .lean();

  const projectNameById = Object.fromEntries(projects.map((p) => [p.id, p.name]));
  const uid = String(userId);

  const mine = tasks.filter((t) => {
    const aid = refIdString(t.assignee);
    const cid = refIdString(t.createdBy);
    return aid === uid || cid === uid;
  });

  const pending = tasks.filter((t) => t.status !== 'done');
  const overdue = pending.filter((t) => t.dueDate && new Date(t.dueDate) < new Date());

  const byStatus = { todo: 0, in_progress: 0, review: 0, done: 0 };
  for (const t of tasks) {
    if (byStatus[t.status] != null) byStatus[t.status]++;
  }

  const parts = [
    `## DevFlow workspace context for ${userName}`,
    `Workspaces (${projects.length}): ${projects.map((p) => `${p.name} [${p.role}]`).join('; ')}`,
    `Task totals: ${tasks.length} (todo ${byStatus.todo}, in progress ${byStatus.in_progress}, review ${byStatus.review}, done ${byStatus.done})`,
    `Open tasks: ${pending.length}, overdue with due date: ${overdue.length}`,
    '',
    '### Tasks assigned to or created by this user (focus here for "my tasks")',
  ];
  if (mine.length) parts.push(...mine.slice(0, 80).map((t) => taskLine(t, projectNameById[String(t.project)] || '?')));
  else parts.push('(none yet)');
  parts.push('', '### Sample of other open tasks (team visibility)');
  parts.push(
    ...pending
      .filter((t) => !mine.some((m) => String(m._id) === String(t._id)))
      .slice(0, 40)
      .map((t) => taskLine(t, projectNameById[String(t.project)] || '?'))
  );

  return parts.join('\n');
}

/**
 * Structured payload for the insights panel + analytics-style hints.
 */
export async function buildInsightsPayload(userId, userName) {
  const projects = await getAccessibleProjects(userId);
  const ids = projects.map((p) => p.id);
  const tasks =
    ids.length === 0
      ? []
      : await Task.find({ project: { $in: ids } })
          .populate('assignee', 'name')
          .lean();

  const uid = String(userId);
  const mine = tasks.filter((t) => {
    const aid = refIdString(t.assignee);
    const cid = refIdString(t.createdBy);
    return aid === uid || cid === uid;
  });

  const pending = tasks.filter((t) => t.status !== 'done');
  const overdue = pending.filter((t) => t.dueDate && new Date(t.dueDate) < new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const dueThisWeek = pending.filter((t) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    return d >= today && d <= weekEnd;
  });

  const blocked = pending.filter((t) => /block|blocked|waiting/i.test(t.title + (t.description || '')));

  const byPriority = { urgent: 0, high: 0, medium: 0, low: 0 };
  for (const t of pending) {
    if (byPriority[t.priority] != null) byPriority[t.priority]++;
  }

  const completionRate = tasks.length ? Math.round((tasks.filter((t) => t.status === 'done').length / tasks.length) * 100) : 0;
  const productivityScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(completionRate * 0.5 + (pending.length ? (1 - overdue.length / pending.length) * 35 : 35) + (mine.filter((t) => t.status !== 'done').length ? 15 : 0))
    )
  );

  const suggested = [...pending]
    .sort((a, b) => {
      const pr = { urgent: 4, high: 3, medium: 2, low: 1 };
      return (pr[b.priority] || 0) - (pr[a.priority] || 0);
    })
    .slice(0, 5)
    .map((t) => ({
      id: String(t._id),
      title: t.title,
      priority: t.priority,
      status: t.status,
      projectId: String(t.project),
    }));

  return {
    userName,
    workspaceCount: projects.length,
    projectSummaries: projects.slice(0, 8),
    totals: {
      tasks: tasks.length,
      pending: pending.length,
      overdue: overdue.length,
      mineOpen: mine.filter((t) => t.status !== 'done').length,
      dueThisWeek: dueThisWeek.length,
      blockedGuess: blocked.length,
      completionRate,
    },
    productivityScore,
    suggestedPriorities: suggested,
    upcomingDeadlines: pending
      .filter((t) => t.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 6)
      .map((t) => ({
        id: String(t._id),
        title: t.title,
        dueDate: t.dueDate,
        projectId: String(t.project),
        priority: t.priority,
      })),
    reportsSummary: {
      completionRate,
      byPriority: pending.length ? byPriority : null,
      note: 'Aggregated across all workspaces you can access.',
    },
  };
}
