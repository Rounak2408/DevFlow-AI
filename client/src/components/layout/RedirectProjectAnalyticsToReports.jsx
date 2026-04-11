import { Navigate, useParams } from 'react-router-dom';

/** Legacy `/analytics` → `/reports` */
export function RedirectProjectAnalyticsToReports() {
  const { projectId } = useParams();
  return <Navigate to={`/app/projects/${projectId}/reports`} replace />;
}
