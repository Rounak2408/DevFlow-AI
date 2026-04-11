import { Task } from '../models/Task.js';
import { getProjectForUser } from '../utils/projectAccess.js';
import { cacheGet, cacheSet } from '../config/redis.js';

export async function projectAnalytics(req, res, next) {
  try {
    const { id } = req.params;
    const { error, status } = await getProjectForUser(id, req.userId);
    if (error) {
      res.status(status);
      return next(new Error(error));
    }
    const cacheKey = `analytics:${id}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json({ ...cached, cached: true });

    const tasks = await Task.find({ project: id }).lean();
    const byStatus = { todo: 0, in_progress: 0, review: 0, done: 0 };
    const byPriority = { low: 0, medium: 0, high: 0, urgent: 0 };
    let completed = 0;
    const last7 = Array(7)
      .fill(0)
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        return d;
      });

    const completionsByDay = last7.map(() => 0);

    for (const t of tasks) {
      if (byStatus[t.status] !== undefined) byStatus[t.status]++;
      if (byPriority[t.priority] !== undefined) byPriority[t.priority]++;
      if (t.status === 'done') {
        completed++;
        const doneAt = t.updatedAt ? new Date(t.updatedAt) : new Date();
        const idx = last7.findIndex((d) => {
          const end = new Date(d);
          end.setHours(23, 59, 59, 999);
          return doneAt >= d && doneAt <= end;
        });
        if (idx >= 0) completionsByDay[idx]++;
      }
    }

    const total = tasks.length;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;

    const payload = {
      totalTasks: total,
      byStatus,
      byPriority,
      completionRate,
      trend: last7.map((d, i) => ({
        date: d.toISOString().slice(0, 10),
        completed: completionsByDay[i],
      })),
      cached: false,
    };
    await cacheSet(cacheKey, { ...payload, cached: undefined }, Number(process.env.ANALYTICS_CACHE_TTL || 120));
    res.json(payload);
  } catch (e) {
    next(e);
  }
}
