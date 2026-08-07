// src/components/AppointmentsStats.jsx
import {
  CalendarDays,
  Calendar,
  Clock,
  Activity,
  UserX,
  CheckCircle2,
} from "lucide-react";

export function AppointmentsStats({ stats, statusFilter, setStatusFilter }) {
  const statItems = [
    {
      key: "all",
      label: "الإجمالي",
      count: stats.total,
      icon: CalendarDays,
      activeBg: "bg-primary/15 border-primary ring-2 ring-primary/20",
      iconStyle: "bg-primary/10 text-primary",
    },
    {
      key: "Scheduled",
      label: "مجدولة",
      count: stats.scheduled,
      icon: Calendar,
      activeBg: "bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/20",
      iconStyle: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    },
    {
      key: "Waiting",
      label: "في الانتظار",
      count: stats.waiting,
      icon: Clock,
      activeBg: "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20",
      iconStyle: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      key: "InSession",
      label: "قيد الجلسة",
      count: stats.inSession,
      icon: Activity,
      activeBg: "bg-cyan-500/10 border-cyan-500 ring-2 ring-cyan-500/20",
      iconStyle: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    },
    {
      key: "NoShow",
      label: "لم يحضر",
      count: stats.noShow,
      icon: UserX,
      activeBg: "bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/20",
      iconStyle: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
    {
      key: "Completed",
      label: "مكتملة",
      count: stats.completed,
      icon: CheckCircle2,
      activeBg:
        "bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20",
      iconStyle: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      span: "col-span-2 sm:col-span-1",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {statItems.map((item) => {
        const Icon = item.icon;
        const isActive = statusFilter === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => setStatusFilter(item.key)}
            className={`${item.span || ""} p-4 rounded-3xl border text-right transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md ${
              isActive
                ? item.activeBg
                : "bg-card border-border hover:border-primary/40 hover:bg-muted/30 text-foreground"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <span className="text-xs font-bold text-muted-foreground">
                {item.label}
              </span>
              <div className={`p-2 rounded-2xl ${item.iconStyle}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <span className="text-2xl font-black text-foreground">
              {item.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
