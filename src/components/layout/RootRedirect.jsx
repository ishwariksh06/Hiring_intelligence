import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RootRedirect() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user.role === 'CANDIDATE') return <Navigate to="/candidate/upload" replace />;
  return <Navigate to="/dashboard" replace />;
}
