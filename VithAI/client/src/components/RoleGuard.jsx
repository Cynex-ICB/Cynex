import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from './LoadingSkeleton';

export default function RoleGuard({ role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSkeleton label="Checking session" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/assessments' : '/student/assessments'} replace />;
  }
  return <Outlet />;
}
