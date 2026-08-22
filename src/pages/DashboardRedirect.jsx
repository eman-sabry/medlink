import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLES, DASHBOARD_BY_ROLE } from "../permissions/roles";

export default function DashboardRedirect() {
  const { role } = useAuth();
  return <Navigate to={DASHBOARD_BY_ROLE[role] ?? "/access-denied"} replace />;
}
