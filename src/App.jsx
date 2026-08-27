import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import RootRedirect from './components/layout/RootRedirect';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import DashboardPage from './pages/DashboardPage';
import JobsListPage from './pages/JobsListPage';
import JobFormPage from './pages/JobFormPage';
import JobDetailPage from './pages/JobDetailPage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import AssistantPage from './pages/AssistantPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import CandidateResumeUploadPage from './pages/CandidateResumeUploadPage';
import ApplicationStatusPage from './pages/ApplicationStatusPage';

const RECRUITER_ROLES = ['RECRUITER', 'ADMIN'];

const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/unauthorized', element: <UnauthorizedPage /> },
  {
    element: <ProtectedRoute allowedRoles={RECRUITER_ROLES} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage />, handle: { title: 'Dashboard' } },
          { path: '/jobs', element: <JobsListPage />, handle: { title: 'Job Management' } },
          { path: '/jobs/new', element: <JobFormPage mode="create" />, handle: { title: 'Create Job' } },
          { path: '/jobs/:id/edit', element: <JobFormPage mode="edit" />, handle: { title: 'Edit Job' } },
          { path: '/jobs/:id', element: <JobDetailPage />, handle: { title: 'Job Detail & Ranking' } },
          { path: '/upload', element: <ResumeUploadPage />, handle: { title: 'Resume Upload' } },
          { path: '/candidates/:id', element: <CandidateProfilePage />, handle: { title: 'Candidate Profile' } },
          { path: '/assistant', element: <AssistantPage />, handle: { title: 'AI Chat Assistant' } },
          { path: '/analytics', element: <AnalyticsPage />, handle: { title: 'Analytics Dashboard' } },
          { path: '/reports', element: <ReportsPage />, handle: { title: 'Reports' } },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['CANDIDATE']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/candidate/upload', element: <CandidateResumeUploadPage />, handle: { title: 'Upload Resume' } },
          { path: '/candidate/status', element: <ApplicationStatusPage />, handle: { title: 'Application Status' } },
        ],
      },
    ],
  },
  { path: '*', element: <RootRedirect /> },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
