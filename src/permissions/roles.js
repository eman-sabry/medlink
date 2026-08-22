export const ROLES = {
  OWNER: "Owner",
  SECRETARY: "Secretary",
  DOCTOR: "Doctor",
};

export const ALL_ROLES = Object.values(ROLES);

export const ROLE_LABELS = {
  [ROLES.OWNER]: "مالك المركز",
  [ROLES.SECRETARY]: "سكرتارية",
  [ROLES.DOCTOR]: "طبيب",
};

export const DASHBOARD_BY_ROLE = {
  [ROLES.OWNER]: "/dashboard/owner",
  [ROLES.SECRETARY]: "/dashboard/secretary",
  [ROLES.DOCTOR]: "/dashboard/doctor",
};
