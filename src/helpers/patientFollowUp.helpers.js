import {
  PhoneCall,
  CheckCircle2,
  CalendarCheck,
  UserX,
  CalendarDays,
} from "lucide-react";

export const FOLLOW_UP_STAT_CONFIG = [
  {
    key: "needsCall",
    label: "بحاجة اتصال",
    icon: PhoneCall,
    iconWrapperClassName: "bg-rose-500/10 text-rose-600",
    className: "hover:border-rose-500/50",
    activeClassName: "border-rose-500 shadow-md ring-1 ring-rose-500/20 bg-rose-500/5",
  },
  {
    key: "contacted",
    label: "تم الاتصال",
    icon: CheckCircle2,
    iconWrapperClassName: "bg-amber-500/10 text-amber-600",
    className: "hover:border-amber-500/50",
    activeClassName: "border-amber-500 shadow-md ring-1 ring-amber-500/20 bg-amber-500/5",
  },
  {
    key: "rebooked",
    label: "أعاد الحجز",
    icon: CalendarCheck,
    iconWrapperClassName: "bg-emerald-500/10 text-emerald-600",
    className: "hover:border-emerald-500/50",
    activeClassName: "border-emerald-500 shadow-md ring-1 ring-emerald-500/20 bg-emerald-500/5",
  },
  {
    key: "wontReturn",
    label: "لن يعود",
    icon: UserX,
    iconWrapperClassName: "bg-slate-500/10 text-slate-600",
    className: "hover:border-slate-500/50",
    activeClassName: "border-slate-500 shadow-md ring-1 ring-slate-500/20 bg-slate-500/5",
  },
];

export const FOLLOW_UP_TAB_OPTIONS = [
  {
    key: "all",
    label: "جميع الحالات",
    icon: CalendarDays,
    style: "bg-background text-foreground border-input",
  },
  {
    key: "needsCall",
    label: "بحاجة اتصال",
    icon: PhoneCall,
    style: "bg-rose-500/10 text-rose-600 border-rose-500/30",
    textClass: "text-rose-600",
  },
  {
    key: "contacted",
    label: "تم الاتصال",
    icon: CheckCircle2,
    style: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    textClass: "text-amber-600",
  },
  {
    key: "rebooked",
    label: "أعاد الحجز",
    icon: CalendarCheck,
    style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    textClass: "text-emerald-600",
  },
  {
    key: "wontReturn",
    label: "لن يعود",
    icon: UserX,
    style: "bg-slate-500/10 text-slate-600 border-slate-500/30",
    textClass: "text-slate-600",
  },
];
