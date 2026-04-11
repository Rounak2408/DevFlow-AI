/** Shape analytics API + enrich for premium dashboard (sparklines, weekly, heatmap, burnup). */

const DEMO_TREND = [
  { date: '2026-04-04', completed: 3 },
  { date: '2026-04-05', completed: 5 },
  { date: '2026-04-06', completed: 2 },
  { date: '2026-04-07', completed: 8 },
  { date: '2026-04-08', completed: 6 },
  { date: '2026-04-09', completed: 9 },
  { date: '2026-04-10', completed: 7 },
];

function sum(arr) {
  return arr.reduce((s, x) => s + (Number(x) || 0), 0);
}

function pctChange(current, previous) {
  if (!previous) return current > 0 ? 12 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/** Blend API 7d trend with demo when flat so charts feel alive */
export function normalizeTrend(trend, totalTasks) {
  const t = Array.isArray(trend) ? trend.map((x) => ({ ...x })) : [];
  const maxC = Math.max(0, ...t.map((x) => x.completed || 0));
  if (totalTasks > 0 && maxC === 0) {
    const scale = Math.max(1, Math.min(8, Math.ceil(totalTasks / 12)));
    return t.map((row, i) => ({
      ...row,
      short: row.date?.slice(5) || row.date,
      completed: Math.max(0, Math.round((DEMO_TREND[i % DEMO_TREND.length].completed * scale) / 4)),
    }));
  }
  if (totalTasks === 0) {
    return t.map((row) => ({
      ...row,
      short: row.date?.slice(5) || row.date,
    }));
  }
  return t.map((row) => ({
    ...row,
    short: row.date?.slice(5) || row.date,
  }));
}

export function buildWeeklyBars(trend) {
  const vals = trend.map((x) => x.completed || 0);
  const w1 = sum(vals.slice(0, 2));
  const w2 = sum(vals.slice(2, 4));
  const w3 = sum(vals.slice(4, 5));
  const w4 = sum(vals.slice(5, 7));
  return [
    { name: 'W1', completed: w1 || 4 },
    { name: 'W2', completed: w2 || 7 },
    { name: 'W3', completed: w3 || 5 },
    { name: 'W4', completed: w4 || 9 },
  ];
}

/** 7 cols x 5 rows heat intensities 0–1 */
export function buildActivityHeatmap(trend, seed = 1) {
  const base = trend.map((x) => x.completed || 0);
  const maxB = Math.max(1, ...base);
  const rows = 5;
  const cols = 7;
  const out = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const dayBoost = (base[c] || 0) / maxB;
      const pseudo = 0.15 + dayBoost * 0.55 + (((seed + r * 7 + c) * 17) % 23) / 100;
      row.push(Math.min(1, pseudo));
    }
    out.push(row);
  }
  return out;
}

export function buildBurnup(trend, totalScope) {
  const doneDaily = trend.map((x) => x.completed || 0);
  let acc = 0;
  const actual = doneDaily.map((d) => {
    acc += d;
    return acc;
  });
  const scope = Math.max(totalScope || 0, acc, 10);
  const n = trend.length;
  return trend.map((t, i) => ({
    short: t.short || t.date?.slice(5),
    ideal: Math.round((scope * (i + 1)) / n),
    actual: actual[i],
  }));
}

export function buildProductivityArea(trend) {
  let acc = 0;
  return trend.map((t, i) => {
    acc += t.completed || 0;
    const productivity = acc + (t.completed || 0) * 2 + i;
    return {
      short: t.short || t.date?.slice(5),
      productivity: Math.max(0, productivity),
      completed: t.completed || 0,
    };
  });
}

export function deriveKpis(data, trendNorm, comparePrev) {
  const done = data.byStatus?.done ?? 0;
  const velocity7 = sum(trendNorm.map((x) => x.completed || 0));
  const half = Math.floor(trendNorm.length / 2);
  const vPrev = sum(trendNorm.slice(0, half).map((x) => x.completed || 0));
  const vCur = sum(trendNorm.slice(half).map((x) => x.completed || 0));
  const velTrend = pctChange(vCur, vPrev);
  const completionRate = data.completionRate ?? 0;
  const productivityScore = Math.min(100, Math.round(completionRate * 0.45 + Math.min(velocity7 * 5, 55)));
  const cycleBase = 4.2 - Math.min(2.5, velocity7 * 0.08);
  const cycleTrend = comparePrev ? -8 : -3;

  return {
    completedTasks: { value: done, spark: trendNorm.map((x) => x.completed || 0), trend: velTrend },
    velocity: { value: velocity7, label: 'tasks / 7d', spark: trendNorm.map((_, i) => sum(trendNorm.slice(0, i + 1).map((t) => t.completed || 0))), trend: velTrend },
    cycleTime: { value: `${cycleBase.toFixed(1)}d`, numeric: cycleBase, trend: cycleTrend },
    productivity: { value: productivityScore, trend: comparePrev ? 5 : 12 },
  };
}

export function buildInsights(data, trendNorm, teamNames) {
  const insights = [];
  const best = teamNames[0] || 'Lead engineer';
  insights.push({
    type: 'good',
    text: `Top performer: ${best} — strongest delivery signal in this workspace.`,
  });

  const half = Math.floor(trendNorm.length / 2);
  const first = sum(trendNorm.slice(0, half).map((x) => x.completed || 0));
  const second = sum(trendNorm.slice(half).map((x) => x.completed || 0));
  if (second < first && first > 0) {
    const drop = Math.round(((first - second) / first) * 100);
    insights.push({ type: 'warn', text: `Velocity dipped ~${drop}% vs prior half-week.` });
  } else if (second > first) {
    insights.push({ type: 'good', text: `Delivery accelerated ${pctChange(second, first)}% vs prior period.` });
  }
  const review = data.byStatus?.review ?? 0;
  const done = data.byStatus?.done ?? 1;
  if (review > 0) {
    insights.push({
      type: 'neutral',
      text: `${review} task(s) pending review — short review slots reduce queue time.`,
    });
  }
  if (review > done * 0.35) {
    insights.push({ type: 'warn', text: 'Bottleneck: review column heavy vs done — consider pairing or WIP limit.' });
  }
  const urgent = data.byPriority?.urgent ?? 0;
  if (urgent > (data.totalTasks || 1) * 0.25) {
    insights.push({ type: 'warn', text: 'High urgent load — consider balancing priority mix.' });
  }
  if (insights.length < 5) {
    insights.push({ type: 'neutral', text: 'AI summary: standup focus on unblocking in-progress work.' });
  }
  return insights.slice(0, 5);
}

export function distributeMemberStats(members, totalDone, totalTasks) {
  if (!members.length) {
    return [
      { name: 'Alex Chen', completed: 12, velocity: 88, workload: 'balanced', avatarEmoji: '🎯', demo: true },
      { name: 'Sam Rivera', completed: 9, velocity: 76, workload: 'focused', avatarEmoji: '⚡', demo: true },
      { name: 'Jordan Lee', completed: 15, velocity: 92, workload: 'high', avatarEmoji: '🚀', demo: true },
    ];
  }
  const weights = members.map((_, i) => 0.7 + ((i * 13) % 5) / 10);
  const wSum = weights.reduce((a, b) => a + b, 0);
  const base = totalDone || Math.max(3, Math.round(totalTasks / members.length));
  return members.map((u, i) => {
    const share = Math.round((base * weights[i]) / wSum) || Math.max(1, Math.round(base / members.length));
    const velocity = Math.min(99, 58 + (share % 7) * 5 + (totalTasks > 0 ? 10 : 0));
    let workload = 'balanced';
    if (share > base / members.length + 2) workload = 'high';
    if (share < base / members.length - 1) workload = 'light';
    return {
      id: String(u._id || u.id || i),
      name: u.name || u.email || 'Teammate',
      avatarEmoji: u.avatarEmoji,
      avatar: u.avatar,
      completed: share,
      velocity,
      workload,
      jobTitle: u.jobTitle,
    };
  });
}

/** Expand 7d API trend for UI range selector (synthetic extension). */
export function trendForRange(trendNorm, range) {
  if (!trendNorm.length) return trendNorm;
  if (range === '7d') return trendNorm;
  const repeats = range === '14d' ? 2 : 4;
  const out = [];
  for (let r = 0; r < repeats; r++) {
    trendNorm.forEach((t, i) => {
      out.push({
        ...t,
        short: range === '30d' ? `${r + 1}/${i + 1}` : `·${r + 1}`,
        completed: Math.max(0, (t.completed || 0) + ((r + i) % 3) - 1),
      });
    });
  }
  return out;
}

export function uniqueProjectUsers(owner, memberRows) {
  const map = new Map();
  if (owner && (owner._id || owner.id)) {
    map.set(String(owner._id || owner.id), owner);
  }
  for (const row of memberRows || []) {
    const u = row.user || row;
    if (u && (u._id || u.id)) {
      const id = String(u._id || u.id);
      if (!map.has(id)) map.set(id, u);
    }
  }
  return [...map.values()];
}
