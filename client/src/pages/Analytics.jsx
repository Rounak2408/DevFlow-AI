import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api.js';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { ErrorFallback } from '../components/ui/ErrorFallback.jsx';
import { ReportsDashboard } from '../components/reports/ReportsDashboard.jsx';
import { resolveAnalyticsForUi } from '../components/reports/sampleAnalyticsFallback.js';

export function Analytics() {
  const { projectId } = useParams();
  const [data, setData] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const load = useCallback(async () => {
    if (!projectId) {
      setErr('Workspace missing — open Reports from a project.');
      setLoading(false);
      setData(null);
      return;
    }
    setLoading(true);
    setErr(null);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 28000);
    try {
      const [analyticsRes, projectRes] = await Promise.all([
        api.get(`/projects/${projectId}/analytics`, { signal: controller.signal }),
        api.get(`/projects/${projectId}`, { signal: controller.signal }).catch(() => ({ data: null })),
      ]);
      setData(resolveAnalyticsForUi(analyticsRes.data));
      setProject(projectRes.data?.project || null);
    } catch (e) {
      const msg =
        e.name === 'CanceledError' || e.code === 'ERR_CANCELED'
          ? 'Request timed out — showing sample metrics. Check API & Redis, then retry.'
          : 'Could not load live analytics — showing sample metrics.';
      toast.error(msg);
      setData(resolveAnalyticsForUi(null));
      setProject(null);
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  if (err && !loading) {
    return (
      <div className="max-w-lg">
        <ErrorFallback message={err} onRetry={load} />
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <ReportsDashboard
      data={data}
      projectName={project?.name || ''}
      project={project}
      cached={!!data.cached}
      onRefresh={load}
      projectId={projectId}
    />
  );
}
