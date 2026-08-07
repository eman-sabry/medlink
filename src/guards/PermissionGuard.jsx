import { useAuth } from "../hooks/useAuth";
import { hasPermission } from "../permissions/permissions";

// إظهار المحتوى فقط إذا كان دور المستخدم الحالي يملك الصلاحية المطلوبة.
// الاستخدام: <PermissionGuard permission="patients:delete"><DeleteButton/></PermissionGuard>
export function PermissionGuard({ permission, fallback = null, children }) {
  const { role } = useAuth();

  if (!hasPermission(role, permission)) {
    return fallback;
  }

  return children;
}
