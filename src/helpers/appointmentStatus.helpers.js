import {
  Clock,
  Calendar,
  XCircle,
  CheckCircle2,
  UserCheck,
  UserX,
  Activity,
  CalendarDays,
} from "lucide-react";

export const STATUS_FILTER_OPTIONS = [
  {
    key: "all",
    label: "جميع الحالات",
    icon: CalendarDays,
    style: "bg-card text-foreground border-border hover:bg-muted/30",
  },
  {
    key: "Scheduled",
    label: "مجدولة",
    icon: Calendar,
    style:
      "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    textClass: "text-indigo-600 dark:text-indigo-400",
  },
  {
    key: "Waiting",
    label: "في الانتظار",
    icon: Clock,
    style:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    textClass: "text-amber-600 dark:text-amber-400",
  },
  {
    key: "InSession",
    label: "قيد الجلسة",
    icon: Activity,
    style: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    textClass: "text-cyan-600 dark:text-cyan-400",
  },
  {
    key: "Arrived",
    label: "تم تسجيل الوصول",
    icon: UserCheck,
    style: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    textClass: "text-blue-600 dark:text-blue-400",
  },
  {
    key: "NoShow",
    label: "لم يحضر",
    icon: UserX,
    style: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    textClass: "text-rose-600 dark:text-rose-400",
  },
  {
    key: "Completed",
    label: "مكتمل",
    icon: CheckCircle2,
    style:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    textClass: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "Cancelled",
    label: "ملغي",
    icon: XCircle,
    style: "bg-destructive/10 text-destructive border-destructive/30",
    textClass: "text-destructive",
  },
];
