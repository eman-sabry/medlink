import {
  ListFilter,
  CheckCircle2,
  Clock,
  Archive,
  Wrench,
  AlertTriangle,
  Users,
  Sparkles,
  XCircle,
  UserX,
} from "lucide-react";
import { ROLES, ROLE_LABELS } from "../permissions/roles";

const ALL_OPTION = {
  key: "all",
  label: "كل الحالات",
  icon: ListFilter,
  style: "bg-card text-foreground border-border hover:bg-muted/30",
};

export const PATIENT_STATUS_FILTER_OPTIONS = [
  ALL_OPTION,
  {
    key: "Active",
    label: "نشط",
    icon: CheckCircle2,
    style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    textClass: "text-emerald-600",
  },
  {
    key: "Inactive",
    label: "غير نشط",
    icon: Clock,
    style: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    textClass: "text-amber-600",
  },
  {
    key: "Archived",
    label: "مؤرشف",
    icon: Archive,
    style: "bg-slate-500/10 text-slate-600 border-slate-500/30",
    textClass: "text-slate-600",
  },
];

export const DEVICE_STATUS_FILTER_OPTIONS = [
  ALL_OPTION,
  {
    key: "Operational",
    label: "تعمل",
    icon: CheckCircle2,
    style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    textClass: "text-emerald-600",
  },
  {
    key: "Maintenance",
    label: "صيانة",
    icon: Wrench,
    style: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    textClass: "text-amber-600",
  },
  {
    key: "Out-Of-Service",
    label: "خارج الخدمة",
    icon: AlertTriangle,
    style: "bg-rose-500/10 text-rose-600 border-rose-500/30",
    textClass: "text-rose-600",
  },
];

export const MAINTENANCE_STATUS_FILTER_OPTIONS = [
  ALL_OPTION,
  {
    key: "Pending",
    label: "قيد الانتظار",
    icon: Clock,
    style: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    textClass: "text-amber-600",
  },
  {
    key: "Completed",
    label: "مكتملة",
    icon: CheckCircle2,
    style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    textClass: "text-emerald-600",
  },
];

export const ROOM_STATUS_FILTER_OPTIONS = [
  ALL_OPTION,
  {
    key: "Available",
    label: "متاحة",
    icon: CheckCircle2,
    style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    textClass: "text-emerald-600",
  },
  {
    key: "Occupied",
    label: "مشغولة",
    icon: Users,
    style: "bg-rose-500/10 text-rose-600 border-rose-500/30",
    textClass: "text-rose-600",
  },
  {
    key: "Cleaning",
    label: "تحت التنظيف",
    icon: Sparkles,
    style: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    textClass: "text-amber-600",
  },
  {
    key: "OutOfService",
    label: "خارج الخدمة",
    icon: Wrench,
    style: "bg-rose-500/10 text-rose-600 border-rose-500/30",
    textClass: "text-rose-600",
  },
];

export const ACTIVE_INACTIVE_FILTER_OPTIONS = [
  ALL_OPTION,
  {
    key: "Active",
    label: "نشطة",
    icon: CheckCircle2,
    style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    textClass: "text-emerald-600",
  },
  {
    key: "Inactive",
    label: "غير نشطة",
    icon: XCircle,
    style: "bg-slate-500/10 text-slate-600 border-slate-500/30",
    textClass: "text-slate-600",
  },
];

export const TEAM_ACCOUNT_STATUS_FILTER_OPTIONS = [
  ALL_OPTION,
  {
    key: "Active",
    label: "نشط",
    icon: CheckCircle2,
    style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    textClass: "text-emerald-600",
  },
  {
    key: "Inactive",
    label: "معطّل",
    icon: XCircle,
    style: "bg-rose-500/10 text-rose-600 border-rose-500/30",
    textClass: "text-rose-600",
  },
  {
    key: "NoAccount",
    label: "بلا حساب دخول",
    icon: UserX,
    style: "bg-slate-500/10 text-slate-600 border-slate-500/30",
    textClass: "text-slate-600",
  },
];

export const TEAM_ROLE_FILTER_OPTIONS = [
  ALL_OPTION,
  ...Object.values(ROLES).map((role) => ({
    key: role,
    label: ROLE_LABELS[role],
    icon: Users,
    style: "bg-primary/10 text-primary border-primary/30",
    textClass: "text-primary",
  })),
];
