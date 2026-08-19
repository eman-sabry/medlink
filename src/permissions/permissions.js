import { ROLES } from "./roles";

export const PERMISSIONS = {
  [ROLES.OWNER]: ["*"],

  [ROLES.SECRETARY]: [
    "dashboard:view",
    "patients:view",
    "patients:add",
    "patients:edit",
    "patients:delete",
    "patients.read",
    "patients.write",
    "appointments:view",
    "appointments:add",
    "appointments:edit",
    "appointments:cancel",
    "appointments.read",
    "appointments.manage",
    "followup:view",
    "followup:edit",
    "followups.read",
    "followups.manage",
    "billing:view",
    "billing:print",
    "billing:create",
    "billing:record_payment",
    "invoices.read",
    "invoices.manage",
    "payments.receive",
    "rooms:view",
    "rooms:manage",
    "rooms.read",
    "packages:assign",
    "package_templates.read",
    "patient_packages.read",
    "patient_packages.sell",
    "archive:view",
    "archive:restore",
    "archive.read",
    "archive.restore",
    "profile:view",
    "profile:edit",
    "team:view",
    "staff.read",
  ],

  [ROLES.DOCTOR]: [
    "dashboard:view",
    "patients:view",
    "patients.read",
    "appointments:view",
    "appointments.read",
    "sessions:view",
    "sessions:start",
    "sessions:end",
    "sessions:edit",
    "sessions.read",
    "sessions.write",
    "clinical.sign",
    "clinical.amend",
    "notes:add",
    "prescriptions:add",
    "prescriptions:print",
    "profile:view",
    "profile:edit",
    "billing:view",
    "invoices.read",
  ],
};

export function hasPermission(roleOrUser, permission) {
  if (!roleOrUser) return false;

  let role = typeof roleOrUser === "object" ? roleOrUser.role : roleOrUser;
  const userPermissions = typeof roleOrUser === "object" && Array.isArray(roleOrUser.permissions) ? roleOrUser.permissions : [];

  const roleLower = String(role || "").trim().toLowerCase();

  // Owner / Admin has all permissions
  if (roleLower === "owner" || roleLower === "admin" || userPermissions.includes("*")) {
    return true;
  }

  // Check user fine-grained permissions array from backend if available
  if (userPermissions.length > 0) {
    if (userPermissions.includes(permission)) return true;
    const normalizedPerm = permission.replace(":", ".");
    if (userPermissions.includes(normalizedPerm)) return true;
    const colonPerm = permission.replace(".", ":");
    if (userPermissions.includes(colonPerm)) return true;
  }

  // Normalized standard role permissions
  let normalizedRole = ROLES.DOCTOR;
  if (roleLower === "secretary" || roleLower === "receptionist") {
    normalizedRole = ROLES.SECRETARY;
  } else if (roleLower === "doctor" || roleLower === "clinician") {
    normalizedRole = ROLES.DOCTOR;
  } else if (roleLower === "owner") {
    return true;
  }

  const rolePermissions = PERMISSIONS[normalizedRole] ?? [];
  if (rolePermissions.includes("*") || rolePermissions.includes(permission)) {
    return true;
  }

  // Check mapped dot notation vs colon notation
  const permAlt1 = permission.replace(":", ".");
  const permAlt2 = permission.replace(".", ":");
  return rolePermissions.includes(permAlt1) || rolePermissions.includes(permAlt2);
}

