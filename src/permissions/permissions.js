import { ROLES } from "./roles";

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
    "billing:create",
    "billing:record_payment",
    "rooms:view",
    "rooms:manage",
    "packages:assign",
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
    "sessions:edit",
    "notes:add",
    "prescriptions:add",
    "prescriptions:print",
    "profile:view",
    "profile:edit",
  ],
};

export function hasPermission(role, permission) {
  const rolePermissions = PERMISSIONS[role] ?? [];
  return rolePermissions.includes("*") || rolePermissions.includes(permission);
}
