import { ROLES, ROLE_LABELS } from "../permissions/roles";

export const STAFF_TYPE_LABELS = {
  Doctor: "طبيب",
  doctor: "طبيب",
  Nurse: "ممرض/ة",
  nurse: "ممرض/ة",
  Receptionist: "موظف استقبال",
  receptionist: "موظف استقبال",
  Admin: "إداري",
  admin: "إداري",
  Therapist: "معالج",
  therapist: "معالج",
  Owner: "مالك المركز",
  owner: "مالك المركز",
  Manager: "مدير",
  manager: "مدير",
};

export const STAFF_TYPE_OPTIONS = [
  { value: "Doctor", label: "طبيب" },
  { value: "Nurse", label: "ممرض/ة" },
  { value: "Receptionist", label: "موظف استقبال" },
  { value: "Admin", label: "إداري" },
  { value: "Therapist", label: "معالج" },
  { value: "Manager", label: "مدير" },
];

export const TEAM_ROLE_OPTIONS = Object.values(ROLES).map((role) => ({ value: role, label: ROLE_LABELS[role] }));

export const GENDER_LABELS = { Male: "ذكر", Female: "أنثى" };
export const GENDER_OPTIONS = Object.entries(GENDER_LABELS).map(([value, label]) => ({ value, label }));

export const ACCOUNT_STATUS_META = {
  Active: { label: "نشط", badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  active: { label: "نشط", badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  Inactive: { label: "معطّل", badge: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
  inactive: { label: "معطّل", badge: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
  NoAccount: { label: "بلا حساب دخول", badge: "bg-slate-500/10 text-slate-600 border-slate-500/20" },
};

export function enrichTeamMembers(staffList = [], usersList = []) {
  const staffArray = Array.isArray(staffList) ? staffList : (staffList?.items || []);
  const usersArray = Array.isArray(usersList) ? usersList : (usersList?.items || []);

  return staffArray.map((staff) => {
    const account = usersArray.find((u) => u.staff_id === staff.id) ?? null;
    const rawStatus = account ? (account.status || "active") : "NoAccount";
    const normalizedStatus =
      rawStatus === "NoAccount"
        ? "NoAccount"
        : rawStatus.toLowerCase() === "active"
        ? "Active"
        : "Inactive";

    return {
      ...staff,
      account,
      hasAccount: Boolean(account),
      accountStatus: normalizedStatus,
      role: account?.role ?? (staff.staff_type ? (staff.staff_type.toLowerCase() === "owner" ? "Owner" : staff.staff_type.toLowerCase() === "doctor" ? "Doctor" : "Receptionist") : null),
      email: staff.email_normalized || staff.email || account?.email_normalized || account?.email || null,
      phone: staff.phone || account?.phone || null,
      avatar: staff.avatar_url || account?.avatar || null,
      username: account?.username ?? (staff.email_normalized ? staff.email_normalized.split("@")[0] : null),
    };
  });
}

export function isStaffAvailableForAssignment(staffId, usersList = []) {
  const usersArray = Array.isArray(usersList) ? usersList : (usersList?.items || []);
  const account = usersArray.find((u) => u.staff_id === staffId);
  return !account || (account.status !== "Inactive" && account.status !== "inactive");
}
