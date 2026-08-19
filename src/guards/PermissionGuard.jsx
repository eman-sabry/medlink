import { useAuth } from "../hooks/useAuth";
import { hasPermission } from "../permissions/permissions";

export function PermissionGuard({ permission, fallback = null, children }) {
  const { user, role } = useAuth();

  if (!hasPermission(user || role, permission)) {
    return fallback;
  }

  return children;
}
