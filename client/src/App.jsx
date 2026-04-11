import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeBootstrap } from './components/ThemeBootstrap.jsx';
import { ProtectedRoute } from './components/layout/ProtectedRoute.jsx';
import { AppShell } from './components/layout/AppShell.jsx';
import { Landing } from './pages/Landing.jsx';
import { AuthLogin } from './pages/AuthLogin.jsx';
import { AuthRegister } from './pages/AuthRegister.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Workspace } from './pages/Workspace.jsx';
import { Kanban } from './pages/Kanban.jsx';
import { Analytics } from './pages/Analytics.jsx';
import { Roadmap } from './pages/Roadmap.jsx';
import { Members } from './pages/Members.jsx';
import { Settings } from './pages/Settings.jsx';
import { AssistantPage } from './pages/AssistantPage.jsx';
import { RedirectProjectAnalyticsToReports } from './components/layout/RedirectProjectAnalyticsToReports.jsx';

export default function App() {
  return (
    <>
      <ThemeBootstrap />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<AuthLogin />} />
        <Route path="/register" element={<AuthRegister />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="assistant" element={<AssistantPage />} />
          <Route path="settings" element={<Settings />} />
          <Route path="projects/:projectId" element={<Workspace />} />
          <Route path="projects/:projectId/members" element={<Members />} />
          <Route path="projects/:projectId/board" element={<Kanban />} />
          <Route path="projects/:projectId/reports" element={<Analytics />} />
          <Route path="projects/:projectId/roadmap" element={<Roadmap />} />
          <Route path="projects/:projectId/analytics" element={<RedirectProjectAnalyticsToReports />} />
        </Route>
        <Route
          path="/assistant"
          element={
            <ProtectedRoute>
              <Navigate to="/app/assistant" replace />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
