import { ROLES, ROLE_LABELS } from "../permissions/roles";

export const STAFF_TYPE_LABELS = {
  Doctor: "طبيب",
  Nurse: "ممرض/ة",
  Receptionist: "موظف استقبال",
  Admin: "إداري",
  Therapist: "معالج",
};

export const STAFF_TYPE_OPTIONS = Object.entries(STAFF_TYPE_LABELS).map(([value, label]) => ({ value, label }));

export const TEAM_ROLE_OPTIONS = Object.values(ROLES).map((role) => ({ value: role, label: ROLE_LABELS[role] }));

export const GENDER_LABELS = { Male: "ذكر", Female: "أنثى" };
export const GENDER_OPTIONS = Object.entries(GENDER_LABELS).map(([value, label]) => ({ value, label }));

export const ACCOUNT_STATUS_META = {
  Active: { label: "نشط", badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  Inactive: { label: "معطّل", badge: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
  NoAccount: { label: "بلا حساب دخول", badge: "bg-slate-500/10 text-slate-600 border-slate-500/20" },
};

export function enrichTeamMembers(staffList = [], usersList = []) {
  return staffList.map((staff) => {
    const account = usersList.find((u) => u.staff_id === staff.id) ?? null;
    return {
      ...staff,
      account,
      hasAccount: Boolean(account),
      accountStatus: account ? account.status : "NoAccount",
      role: account?.role ?? null,
      email: account?.email ?? null,
      phone: account?.phone ?? null,
      avatar: account?.avatar ?? null,
      username: account?.username ?? null,
    };
  });
}

export function isStaffAvailableForAssignment(staffId, usersList = []) {
  const account = usersList.find((u) => u.staff_id === staffId);
  return !account || account.status !== "Inactive";
}
