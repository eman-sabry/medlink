import { useAuth } from "../hooks/useAuth";
import { hasPermission } from "../permissions/permissions";

export function PermissionGuard({ permission, fallback = null, children }) {
  const { role } = useAuth();

  if (!hasPermission(role, permission)) {
    return fallback;
  }

  return children;
}
