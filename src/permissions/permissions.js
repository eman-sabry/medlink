import { ROLES } from "./roles";

// كل صلاحية بالصيغة "المورد:الإجراء". "*" تعني كل الصلاحيات بدون استثناء (المالك).
export const PERMISSIONS = {
  [ROLES.OWNER]: ["*"],

  [ROLES.SECRETARY]: [
    "dashboard:view",
    "patients:view",
    "patients:add",
    "patients:edit",
    "patients:delete",
    "appointments:view",
    "appointments:add",
    "appointments:edit",
    "appointments:cancel",
    "followup:view",
    "followup:edit",
    "billing:view",
    "billing:print",
    "profile:view",
    "profile:edit",
  ],

  [ROLES.DOCTOR]: [
    "dashboard:view",
    "patients:view",
    "appointments:view",
    "sessions:view",
    "sessions:start",
    "sessions:end",
    "notes:add",
    "prescriptions:add",
    "profile:view",
    "profile:edit",
  ],
};

export function hasPermission(role, permission) {
  const rolePermissions = PERMISSIONS[role] ?? [];
  return rolePermissions.includes("*") || rolePermissions.includes(permission);
}
