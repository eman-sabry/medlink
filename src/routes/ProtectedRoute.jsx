import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AppLayout from "../layouts/AppLayout";

export default function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}
