import { useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Line,
  ComposedChart,
  Legend,
} from 'recharts';
import {
  RefreshCw,
  Download,
  CheckCircle2,
  Zap,
  Timer,
  TrendingUp,
  Radio,
} from 'lucide-react';
import { G, chartTooltip, formatCompact } from './reportTheme.js';
import { A } from './analyticsTheme.js';
import {
  normalizeTrend,
  buildWeeklyBars,
  buildActivityHeatmap,
  buildBurnup,
  buildProductivityArea,
  deriveKpis,
  buildInsights,
  distributeMemberStats,
  uniqueProjectUsers,
  trendForRange,
} from './dashboardData.js';
import { MetricKpiCard } from './MetricKpiCard.jsx';
import { ActivityHeatmap } from './ActivityHeatmap.jsx';
import { SmartInsightsPanel } from './SmartInsightsPanel.jsx';
import { TeamPerformanceGrid } from './TeamPerformanceGrid.jsx';
import { EmptyAnalyticsState } from './EmptyAnalyticsState.jsx';
import { ChartFullscreenButton, ChartFullscreenModal } from './ChartFullscreenModal.jsx';

const STATUS_KEYS = ['todo', 'in_progress', 'review', 'done'];
const STATUS_LABEL = {
  todo: 'To do',
  in_progress: 'In progress',
  review: 'Review',
  done: 'Done',
};

const statusFill = [G.lime, G.light, G.main, G.forest];

function ReportSectionCard({ title, subtitle, action, children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111827]/90 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset,0_24px_48px_-24px_rgba(0,0,0,0.5)] backdrop-blur-sm ${className}`}
    >
      <div
        className={`${A.glowRadial} -right-10 -top-10 h-36 w-36 bg-gradient-to-br from-emerald-500/12 via-transparent to-violet-500/10`}
        aria-hidden
      />
      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-white">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="relative mt-4 min-h-0 flex-1">{children}</div>
    </motion.div>
  );
}

export function ReportsDashboard({
  data,
  projectName,
  cached,
  project,
  onRefresh,
  projectId,
}) {
  const [dateRange, setDateRange] = useState('7d');
  const [comparePrev, setComparePrev] = useState(false);
  const [fs, setFs] = useState(null);
  const [glow, setGlow] = useState({ x: 0, y: 0 });

  const owner = project?.owner;
  const memberRows = project?.members;
  const teamUsers = useMemo(() => uniqueProjectUsers(owner, memberRows), [owner, memberRows]);

  const trendBase = useMemo(
    () => normalizeTrend(data.trend || [], data.totalTasks || 0),
    [data.trend, data.totalTasks],
  );

  const trend = useMemo(() => trendForRange(trendBase, dateRange), [trendBase, dateRange]);

  const weekly = useMemo(() => buildWeeklyBars(trendBase), [trendBase]);
  const heatmap = useMemo(() => buildActivityHeatmap(trendBase, (data.totalTasks || 0) % 7), [trendBase, data.totalTasks]);
  const burnup = useMemo(
    () => buildBurnup(trend, data.totalTasks || Math.max(8, sumDone(data) * 2)),
    [trend, data.totalTasks, data.byStatus?.done],
  );
  const productivitySeries = useMemo(() => buildProductivityArea(trend), [trend]);

  const kpis = useMemo(
    () => deriveKpis(data, trendBase, comparePrev),
    [data, trendBase, comparePrev],
  );

  const teamNames = teamUsers.map((u) => u.name || u.email).filter(Boolean);
  const insights = useMemo(
    () => buildInsights(data, trendBase, teamNames),
    [data, trendBase, teamNames],
  );

  const teamStats = useMemo(
    () => distributeMemberStats(teamUsers, data.byStatus?.done ?? 0, data.totalTasks || 0),
    [teamUsers, data.byStatus?.done, data.totalTasks],
  );

  const statusData = STATUS_KEYS.map((k) => ({
    name: STATUS_LABEL[k] || k,
    value: data.byStatus[k] || 0,
  })).filter((d) => d.value > 0);

  const pieData = statusData.length ? statusData : [{ name: 'No tasks yet', value: 1 }];
  const completionPct = Math.min(100, Math.max(0, data.completionRate || 0));
  const ringCirc = 2 * Math.PI * 42;
  const ringDash = (completionPct / 100) * ringCirc;

  const priorityEntries = Object.entries(data.byPriority || {});
  const priTotal = priorityEntries.reduce((s, [, v]) => s + v, 0) || 1;

  const handleRefresh = useCallback(async () => {
    await onRefresh?.();
    toast.success('Metrics updated');
  }, [onRefresh]);

  const handleExport = useCallback(() => {
    toast.success('Opening print dialog — save as PDF from the dialog.');
    requestAnimationFrame(() => window.print());
  }, []);

  const onGlow = useCallback((e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    setGlow({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);

  if (!data.totalTasks && !data.isSample) {
    return (
      <div className="relative min-h-[60vh] rounded-3xl border border-white/[0.05] bg-[#0B0F19]">
        <EmptyAnalyticsState projectId={projectId} />
      </div>
    );
  }

  return (
    <div
      className="analytics-surface relative overflow-hidden rounded-3xl border border-white/[0.05] bg-[#0B0F19] print:border-0 print:bg-white"
      onMouseMove={onGlow}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-100"
        style={{
          background: `radial-gradient(520px circle at ${glow.x}px ${glow.y}px, rgba(56,189,248,0.055), transparent 55%), radial-gradient(480px circle at 80% 20%, rgba(167,139,250,0.06), transparent 50%), radial-gradient(400px circle at 10% 80%, rgba(16,185,129,0.05), transparent 45%)`,
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {data.isSample ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.08] px-4 py-3 text-sm text-amber-100/90"
          >
            <p>
              Showing <span className="font-semibold">sample metrics</span> — add and complete tasks on the board for
              live analytics.
            </p>
            {projectId ? (
              <Link
                to={`/app/projects/${projectId}/board`}
                className="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15"
              >
                Open board
              </Link>
            ) : null}
          </motion.div>
        ) : null}
        {/* Header */}
        <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between print:mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[28px] font-bold leading-tight tracking-tight text-white md:text-[32px]">
                Analytics &amp; Insights
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300/90">
                <Radio className="h-3 w-3 animate-pulse" />
                Live
              </span>
            </div>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Delivery metrics and team performance
              {projectName ? (
                <>
                  {' '}
                  — <span className="text-slate-300">{projectName}</span>
                </>
              ) : null}
            </p>
            {cached ? (
              <p className="mt-1 text-[11px] text-slate-600">Snapshot cached for speed — refresh for latest.</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
            <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
              {[
                { id: '7d', label: '7d' },
                { id: '14d', label: '14d' },
                { id: '30d', label: '30d' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setDateRange(r.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    dateRange === r.id
                      ? 'bg-white/[0.1] text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={comparePrev}
                onChange={(e) => setComparePrev(e.target.checked)}
                className="rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500/30"
              />
              Compare prior
            </label>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-200"
            >
              <Download className="h-3.5 w-3.5" />
              Export PDF
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRefresh}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-900/25"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh data
            </motion.button>
          </div>
        </header>

        {/* 12-col KPI row */}
        <div className="mb-8 grid grid-cols-12 gap-4 md:gap-5">
          <div className="col-span-12 sm:col-span-6 xl:col-span-3">
            <MetricKpiCard
              label="Total tasks completed"
              value={formatCompact(kpis.completedTasks.value)}
              sublabel="Moved to Done"
              trendPct={comparePrev ? kpis.completedTasks.trend - 4 : kpis.completedTasks.trend}
              spark={kpis.completedTasks.spark}
              icon={CheckCircle2}
              gradient="emerald"
              delay={0}
            />
          </div>
          <div className="col-span-12 sm:col-span-6 xl:col-span-3">
            <MetricKpiCard
              label="Sprint velocity"
              value={String(kpis.velocity.value)}
              sublabel={kpis.velocity.label}
              trendPct={comparePrev ? kpis.velocity.trend + 3 : kpis.velocity.trend}
              spark={kpis.velocity.spark}
              icon={Zap}
              gradient="blue"
              delay={0.05}
            />
          </div>
          <div className="col-span-12 sm:col-span-6 xl:col-span-3">
            <MetricKpiCard
              label="Avg cycle time"
              value={kpis.cycleTime.value}
              sublabel="Estimated from throughput"
              trendPct={kpis.cycleTime.trend}
              trendUpGood={false}
              spark={[5.2, 4.9, 4.6, 4.4, kpis.cycleTime.numeric, kpis.cycleTime.numeric - 0.2, kpis.cycleTime.numeric - 0.1]}
              icon={Timer}
              gradient="purple"
              delay={0.1}
            />
          </div>
          <div className="col-span-12 sm:col-span-6 xl:col-span-3">
            <MetricKpiCard
              label="Team productivity"
              value={`${kpis.productivity.value}`}
              sublabel="Composite score / 100"
              trendPct={kpis.productivity.trend}
              spark={productivitySeries.map((p) => p.productivity)}
              icon={TrendingUp}
              gradient="emerald"
              delay={0.12}
            />
          </div>
        </div>

        {/* Main + insights */}
        <div className="grid grid-cols-12 gap-5 lg:gap-6">
          <div className="col-span-12 space-y-5 xl:col-span-8">
            <ReportSectionCard
              title="Productivity trend"
              subtitle="Cumulative delivery signal across the selected window"
              delay={0.08}
              action={
                <ChartFullscreenButton onClick={() => setFs('productivity')} label="Expand productivity chart" />
              }
            >
              <div className="h-64 w-full sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={productivitySeries}>
                    <defs>
                      <linearGradient id="prodArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={A.blue} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={A.purpleDeep} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 8" stroke="rgba(148,163,184,0.08)" vertical={false} />
                    <XAxis dataKey="short" tick={{ fill: G.label, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: G.label, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={chartTooltip} />
                    <Area
                      type="monotone"
                      dataKey="productivity"
                      stroke={A.blue}
                      strokeWidth={2}
                      fill="url(#prodArea)"
                      isAnimationActive
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ReportSectionCard>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 lg:col-span-6">
                <ReportSectionCard
                  title="Weekly throughput"
                  subtitle="Tasks completed by week segment"
                  delay={0.1}
                  action={
                    <ChartFullscreenButton onClick={() => setFs('weekly')} label="Expand weekly chart" />
                  }
                >
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weekly} barGap={6}>
                        <CartesianGrid strokeDasharray="4 8" stroke="rgba(148,163,184,0.06)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: G.label, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: G.label, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={chartTooltip} />
                        <Bar dataKey="completed" radius={[10, 10, 0, 0]} isAnimationActive animationDuration={900}>
                          {weekly.map((_, i) => (
                            <Cell
                              key={i}
                              fill={[A.blue, A.light, A.purple, A.main][i % 4]}
                              fillOpacity={0.85}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ReportSectionCard>
              </div>
              <div className="col-span-12 lg:col-span-6">
                <ReportSectionCard
                  title="Status distribution"
                  subtitle="Workflow mix"
                  delay={0.12}
                  action={
                    <ChartFullscreenButton onClick={() => setFs('status')} label="Expand status chart" />
                  }
                >
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center">
                    <div className="h-52 w-full max-w-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius="58%"
                            outerRadius="88%"
                            paddingAngle={3}
                            stroke="rgba(17,24,39,0.95)"
                            strokeWidth={2}
                            isAnimationActive
                            animationDuration={900}
                          >
                            {pieData.map((_, i) => (
                              <Cell
                                key={i}
                                fill={statusData.length ? statusFill[i % statusFill.length] : 'rgba(51,65,85,0.9)'}
                              />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={chartTooltip} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
                      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(30,41,59,0.9)" strokeWidth="10" />
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="url(#doneRing)"
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={`${ringDash} ${ringCirc}`}
                        />
                        <defs>
                          <linearGradient id="doneRing" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={A.blue} />
                            <stop offset="100%" stopColor={A.main} />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold tabular-nums text-white">{completionPct}%</span>
                        <span className="text-[9px] uppercase tracking-wider text-slate-500">done rate</span>
                      </div>
                    </div>
                  </div>
                </ReportSectionCard>
              </div>
            </div>

            <ReportSectionCard
              title="Team activity heatmap"
              subtitle="Relative focus intensity by day"
              delay={0.14}
            >
              <ActivityHeatmap matrix={heatmap} delay={0.2} />
            </ReportSectionCard>

            <ReportSectionCard
              title="Daily completions"
              subtitle="Throughput per interval"
              delay={0.15}
              action={
                <ChartFullscreenButton onClick={() => setFs('throughput')} label="Expand throughput chart" />
              }
            >
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="thrArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={G.light} stopOpacity={0.45} />
                        <stop offset="100%" stopColor={G.main} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 8" stroke="rgba(148,163,184,0.08)" vertical={false} />
                    <XAxis dataKey="short" tick={{ fill: G.label, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: G.label, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={chartTooltip} />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stroke={G.light}
                      strokeWidth={2}
                      fill="url(#thrArea)"
                      isAnimationActive
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ReportSectionCard>

            <ReportSectionCard
              title="Sprint burnup"
              subtitle="Ideal vs actual cumulative completions"
              delay={0.16}
              action={<ChartFullscreenButton onClick={() => setFs('burnup')} label="Expand burnup chart" />}
            >
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={burnup}>
                    <CartesianGrid strokeDasharray="4 8" stroke="rgba(148,163,184,0.08)" vertical={false} />
                    <XAxis dataKey="short" tick={{ fill: G.label, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: G.label, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={chartTooltip} />
                    <Legend
                      wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                      formatter={(v) => <span className="text-slate-400">{v}</span>}
                    />
                    <Line
                      type="monotone"
                      dataKey="ideal"
                      name="Ideal"
                      stroke={A.purple}
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      dot={false}
                      isAnimationActive
                      animationDuration={1000}
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      name="Actual"
                      stroke={G.light}
                      strokeWidth={2.5}
                      dot={{ fill: G.light, r: 3 }}
                      isAnimationActive
                      animationDuration={1000}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </ReportSectionCard>

            <ReportSectionCard title="Priority load" subtitle="Share of backlog by priority" delay={0.18}>
              <ul className="space-y-4">
                {priorityEntries.map(([k, v], i) => {
                  const pct = Math.round((v / priTotal) * 100);
                  return (
                    <li key={k}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="capitalize text-slate-300">{k}</span>
                        <span className="font-mono text-slate-500">{v}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-800/80">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.2 + i * 0.06, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-400"
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </ReportSectionCard>

            <ReportSectionCard title="Pipeline health" subtitle="Live counts by column" delay={0.2} className="print:break-inside-avoid">
              <div className="grid grid-cols-12 gap-3">
                {STATUS_KEYS.map((k) => (
                  <div key={k} className="col-span-12 sm:col-span-6 lg:col-span-3">
                    <div className="rounded-xl border border-white/[0.06] bg-[#0B0F19]/80 px-4 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        {STATUS_LABEL[k]}
                      </p>
                      <p className="mt-1 text-2xl font-bold tabular-nums text-white">{data.byStatus[k] ?? 0}</p>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-800">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${data.totalTasks ? ((data.byStatus[k] || 0) / data.totalTasks) * 100 : 0}%`,
                          }}
                          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ReportSectionCard>

            <ReportSectionCard title="Team performance" subtitle="Velocity and load by member" delay={0.22}>
              <TeamPerformanceGrid members={teamStats} delay={0.25} />
            </ReportSectionCard>
          </div>

          <div className="col-span-12 xl:col-span-4 xl:sticky xl:top-24 xl:self-start">
            <SmartInsightsPanel insights={insights} delay={0.12} />
          </div>
        </div>

        <ReportSectionCard
          title="Recent reports"
          subtitle="Sprint, performance, and quality snapshots"
          delay={0.24}
          className="mt-8"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4">Report</th>
                  <th className="pb-3 pr-4">Owner</th>
                  <th className="pb-3 pr-4">Period</th>
                  <th className="pb-3">Updated</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {[
                  { name: 'Sprint delivery', owner: 'Product', period: 'Apr 1–7', at: '2h ago' },
                  { name: 'Engineering performance', owner: 'Eng lead', period: 'Mar 2026', at: 'Yesterday' },
                  { name: 'Bug trends', owner: 'QA', period: 'Last 14d', at: '3d ago' },
                ].map((row) => (
                  <tr key={row.name} className="border-b border-white/[0.04] transition hover:bg-white/[0.02]">
                    <td className="py-3 pr-4 font-medium text-white">{row.name}</td>
                    <td className="py-3 pr-4 text-slate-400">{row.owner}</td>
                    <td className="py-3 pr-4 text-slate-500">{row.period}</td>
                    <td className="py-3 text-slate-500">{row.at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSectionCard>
      </div>

      <ChartFullscreenModal
        open={!!fs}
        title={
          fs === 'productivity'
            ? 'Productivity trend'
            : fs === 'weekly'
              ? 'Weekly throughput'
              : fs === 'status'
                ? 'Status distribution'
                : fs === 'throughput'
                  ? 'Daily completions'
                  : fs === 'burnup'
                    ? 'Sprint burnup'
                    : 'Chart'
        }
        onClose={() => setFs(null)}
      >
        <div className="h-[min(70vh,520px)] w-full">
          {fs === 'productivity' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivitySeries}>
                <defs>
                  <linearGradient id="prodAreaFs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={A.blue} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={A.purpleDeep} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 8" stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis dataKey="short" tick={{ fill: G.label, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: G.label, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltip} />
                <Area type="monotone" dataKey="productivity" stroke={A.blue} strokeWidth={2} fill="url(#prodAreaFs)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : null}
          {fs === 'weekly' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="4 8" stroke="rgba(148,163,184,0.06)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: G.label, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: G.label, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltip} />
                <Bar dataKey="completed" fill={A.main} radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
          {fs === 'status' ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="45%"
                  outerRadius="75%"
                  paddingAngle={3}
                  label
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={statusData.length ? statusFill[i % statusFill.length] : 'rgba(51,65,85,0.9)'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltip} />
              </PieChart>
            </ResponsiveContainer>
          ) : null}
          {fs === 'throughput' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="thrFs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={G.light} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={G.main} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 8" stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis dataKey="short" tick={{ fill: G.label, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: G.label, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltip} />
                <Area type="monotone" dataKey="completed" stroke={G.light} strokeWidth={2} fill="url(#thrFs)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : null}
          {fs === 'burnup' ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={burnup}>
                <CartesianGrid strokeDasharray="4 8" stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis dataKey="short" tick={{ fill: G.label, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: G.label, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltip} />
                <Legend />
                <Line type="monotone" dataKey="ideal" name="Ideal" stroke={A.purple} strokeDasharray="6 4" dot={false} />
                <Line type="monotone" dataKey="actual" name="Actual" stroke={G.light} strokeWidth={2} dot />
              </ComposedChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </ChartFullscreenModal>
    </div>
  );
}

function sumDone(data) {
  return data.byStatus?.done ?? 0;
}
