import { ROLES, ALL_ROLES } from "./roles";

export const ROUTE_PERMISSIONS = {
  "/dashboard": ALL_ROLES,
  "/dashboard/owner": [ROLES.OWNER],
  "/dashboard/secretary": [ROLES.SECRETARY],
  "/dashboard/doctor": [ROLES.DOCTOR],
  "/patients": ALL_ROLES,
  "/patients/:id": ALL_ROLES,
  "/appointments": ALL_ROLES,
  "/sessions": [ROLES.OWNER, ROLES.DOCTOR],
  "/sessions/:id": [ROLES.OWNER, ROLES.DOCTOR, ROLES.SECRETARY],
  "/devices": [ROLES.OWNER],
  "/maintenance": [ROLES.OWNER],
  "/followup": [ROLES.OWNER, ROLES.SECRETARY],
  "/packages": [ROLES.OWNER],
  "/services": [ROLES.OWNER],
  "/invoices": [ROLES.OWNER, ROLES.SECRETARY],
  "/expenses": [ROLES.OWNER],
  "/rooms": [ROLES.OWNER, ROLES.SECRETARY],
  "/profile": ALL_ROLES,
  "/pulse": [ROLES.OWNER],
  "/team": [ROLES.OWNER],
  "/attendance": [ROLES.OWNER],
};

export function canAccessRoute(role, path) {
  const allowedRoles = ROUTE_PERMISSIONS[path];
  if (!allowedRoles) return true; 
  return allowedRoles.includes(role);
}
