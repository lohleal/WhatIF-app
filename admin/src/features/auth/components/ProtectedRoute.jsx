
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './../contexts/AuthContext';

export default function ProtectedRoute() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <p>Verificando acesso...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
