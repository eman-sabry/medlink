import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AppLayout from "../layouts/AppLayout";

export default function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, role } = useAuth();

  // Login always redirects to the role dashboard, never back to this page — so the previous
  // location isn't tracked here.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}
