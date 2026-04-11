/** Full analytics shape for UI when workspace has no tasks or API payload is incomplete. */

function last7DaysTrend() {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const completed = [2, 4, 3, 6, 5, 7, 5][6 - i] ?? 3;
    out.push({ date: d.toISOString().slice(0, 10), completed });
  }
  return out;
}

export const SAMPLE_ANALYTICS = {
  totalTasks: 52,
  byStatus: { todo: 9, in_progress: 16, review: 7, done: 20 },
  byPriority: { low: 11, medium: 24, high: 13, urgent: 4 },
  completionRate: 38,
  trend: last7DaysTrend(),
  cached: false,
  isSample: true,
};

const EMPTY_STATUS = { todo: 0, in_progress: 0, review: 0, done: 0 };
const EMPTY_PRIORITY = { low: 0, medium: 0, high: 0, urgent: 0 };

export function normalizeAnalyticsPayload(raw) {
  const base = {
    totalTasks: 0,
    byStatus: { ...EMPTY_STATUS },
    byPriority: { ...EMPTY_PRIORITY },
    completionRate: 0,
    trend: [],
    cached: false,
  };
  if (!raw || typeof raw !== 'object') return base;
  const trend =
    Array.isArray(raw.trend) && raw.trend.length > 0
      ? raw.trend.map((t) => ({
          date: t.date,
          completed: Number(t.completed) || 0,
        }))
      : [];
  return {
    ...base,
    ...raw,
    totalTasks: Number(raw.totalTasks) || 0,
    completionRate: Number(raw.completionRate) || 0,
    cached: Boolean(raw.cached),
    byStatus: { ...EMPTY_STATUS, ...(raw.byStatus || {}) },
    byPriority: { ...EMPTY_PRIORITY, ...(raw.byPriority || {}) },
    trend,
  };
}

/** Merge API result with guaranteed shape; use rich sample when there is no real task volume. */
export function resolveAnalyticsForUi(apiPayload) {
  const normalized = normalizeAnalyticsPayload(apiPayload);
  if (normalized.totalTasks > 0) {
    return { ...normalized, isSample: false };
  }
  return {
    ...SAMPLE_ANALYTICS,
    isSample: true,
    cached: normalized.cached,
  };
}
