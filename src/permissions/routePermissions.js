import { ROLES, ALL_ROLES } from "./roles";

// كل مسار مرتبط بقائمة الأدوار المسموح لها بالوصول إليه. المصدر الوحيد للحقيقة
// المستخدَم من الراوتر (ProtectedRoute) والقائمة الجانبية (Sidebar) معاً.
export const ROUTE_PERMISSIONS = {
  "/dashboard": ALL_ROLES,
  "/dashboard/owner": [ROLES.OWNER],
  "/dashboard/secretary": [ROLES.SECRETARY],
  "/dashboard/doctor": [ROLES.DOCTOR],
  "/patients": ALL_ROLES,
  "/appointments": ALL_ROLES,
  "/sessions": [ROLES.OWNER, ROLES.DOCTOR],
  "/devices": [ROLES.OWNER],
  "/maintenance": [ROLES.OWNER],
  "/followup": [ROLES.OWNER, ROLES.SECRETARY],
  "/packages": [ROLES.OWNER],
  "/services": [ROLES.OWNER],
  "/rooms": [ROLES.OWNER],
  "/profile": ALL_ROLES,
  // مسارات لم تُبنَ صفحاتها بعد (تنتهي بصفحة 404) — تبقى مقصورة على المالك حتى تُبنى
  "/pulse": [ROLES.OWNER],
  "/team": [ROLES.OWNER],
  "/attendance": [ROLES.OWNER],
};

export function canAccessRoute(role, path) {
  const allowedRoles = ROUTE_PERMISSIONS[path];
  if (!allowedRoles) return true; // مسار غير مقيّد صراحة (مثل صفحات عامة)
  return allowedRoles.includes(role);
}
