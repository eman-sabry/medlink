import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../permissions/roles";

const DASHBOARD_BY_ROLE = {
  [ROLES.OWNER]: "/dashboard/owner",
  [ROLES.SECRETARY]: "/dashboard/secretary",
  [ROLES.DOCTOR]: "/dashboard/doctor",
};

export default function DashboardRedirect() {
  const { role } = useAuth();
  return <Navigate to={DASHBOARD_BY_ROLE[role] ?? "/access-denied"} replace />;
}
