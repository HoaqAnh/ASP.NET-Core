import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import type { JSX } from "react";

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRole?: 'Admin' | 'Student';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps): JSX.Element => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (!token || !user) {
    return <Navigate to="/authentication" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;