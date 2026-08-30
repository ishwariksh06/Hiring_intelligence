import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import RootRedirect from './components/layout/RootRedirect';

import LoginPage from './pages/LoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import DashboardPage from './pages/DashboardPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import IngestPage from './pages/IngestPage';
import CandidatePoolPage from './pages/CandidatePoolPage';
import JobsListPage from './pages/JobsListPage';
import JobFormPage from './pages/JobFormPage';
import JobDetailPage from './pages/JobDetailPage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';

const BOTH = ['ADMIN', 'RECRUITER'];

const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/unauthorized', element: <UnauthorizedPage /> },
  {
    element: <ProtectedRoute allowedRoles={BOTH} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage />, handle: { title: 'Overview' } },
          { path: '/jobs', element: <JobsListPage />, handle: { title: 'Jobs' } },
          { path: '/jobs/new', element: <JobFormPage mode="create" />, handle: { title: 'New Job' } },
          { path: '/jobs/:id/edit', element: <JobFormPage mode="edit" />, handle: { title: 'Edit Job' } },
          { path: '/jobs/:id', element: <JobDetailPage />, handle: { title: 'Job & Shortlist' } },
          { path: '/candidates/:id', element: <CandidateProfilePage />, handle: { title: 'Candidate' } },
          { path: '/analytics', element: <AnalyticsPage />, handle: { title: 'Analytics' } },
          { path: '/reports', element: <ReportsPage />, handle: { title: 'Reports' } },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['ADMIN']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/companies', element: <CompaniesPage />, handle: { title: 'Client Companies' } },
          { path: '/companies/:id', element: <CompanyDetailPage />, handle: { title: 'Client Company' } },
          { path: '/ingest', element: <IngestPage />, handle: { title: 'Resume Ingestion' } },
          { path: '/candidates', element: <CandidatePoolPage />, handle: { title: 'Candidate Pool' } },
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
