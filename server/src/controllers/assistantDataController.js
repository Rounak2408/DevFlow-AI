import { Task } from '../models/Task.js';
import { refIdString } from '../utils/projectAccess.js';
import { getAccessibleProjects, buildInsightsPayload } from '../services/assistantContextService.js';

/** GET /api/tasks/my — tasks assigned to or created by the user across accessible workspaces. */
export async function getMyTasks(req, res, next) {
  try {
    const userId = req.userId;
    const projects = await getAccessibleProjects(userId);
    const ids = projects.map((p) => p.id);
    if (!ids.length) return res.json({ tasks: [], projects: [] });

    const tasks = await Task.find({ project: { $in: ids } })
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ dueDate: 1, updatedAt: -1 })
      .lean();

    const uid = String(userId);
    const mine = tasks.filter((t) => {
      const aid = refIdString(t.assignee);
      const cid = refIdString(t.createdBy);
      return aid === uid || cid === uid;
    });

    res.json({
      projects,
      tasks: mine.map((t) => ({
        id: t._id,
        projectId: t.project,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        assignee: t.assignee,
        createdBy: t.createdBy,
        updatedAt: t.updatedAt,
      })),
    });
  } catch (e) {
    next(e);
  }
}

/** GET /api/boards/my — workspaces (boards) the user can access. */
export async function getMyBoards(req, res, next) {
  try {
    const projects = await getAccessibleProjects(req.userId);
    res.json({ boards: projects });
  } catch (e) {
    next(e);
  }
}

/** GET /api/reports/summary — cross-workspace analytics-style summary. */
export async function getReportsSummary(req, res, next) {
  try {
    const name = req.user?.name || 'User';
    const payload = await buildInsightsPayload(req.userId, name);
    res.json({
      summary: {
        completionRate: payload.totals.completionRate,
        totalTasks: payload.totals.tasks,
        pending: payload.totals.pending,
        overdue: payload.totals.overdue,
        workspaces: payload.workspaceCount,
      },
      insights: payload,
    });
  } catch (e) {
    next(e);
  }
}
