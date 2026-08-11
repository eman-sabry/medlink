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
      activeStyle:
        "bg-primary/15 border-primary/80 shadow-xl shadow-primary/15 ring-2 ring-primary/30",
      normalStyle:
        "bg-card border-border/80 hover:border-primary/50 hover:shadow-lg hover:bg-primary/[0.04]",
      iconStyle: "bg-primary/15 text-primary",
      activeIconStyle: "bg-primary text-primary-foreground shadow-md",
      gradient: "from-primary/[0.07] via-transparent to-transparent",
    },
    {
      key: "Scheduled",
      label: "مجدولة",
      count: stats.scheduled,
      icon: Calendar,
      activeStyle:
        "bg-indigo-500/15 border-indigo-500/80 shadow-xl shadow-indigo-500/15 ring-2 ring-indigo-500/30",
      normalStyle:
        "bg-card border-border/80 hover:border-indigo-500/50 hover:shadow-lg hover:bg-indigo-500/[0.04]",
      iconStyle: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
      activeIconStyle: "bg-indigo-500 text-white shadow-md",
      gradient: "from-indigo-500/[0.07] via-transparent to-transparent",
    },
    {
      key: "Waiting",
      label: "في الانتظار",
      count: stats.waiting,
      icon: Clock,
      activeStyle:
        "bg-amber-500/15 border-amber-500/80 shadow-xl shadow-amber-500/15 ring-2 ring-amber-500/30",
      normalStyle:
        "bg-card border-border/80 hover:border-amber-500/50 hover:shadow-lg hover:bg-amber-500/[0.04]",
      iconStyle: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      activeIconStyle: "bg-amber-500 text-white shadow-md",
      gradient: "from-amber-500/[0.07] via-transparent to-transparent",
    },
    {
      key: "InSession",
      label: "قيد الجلسة",
      count: stats.inSession,
      icon: Activity,
      activeStyle:
        "bg-cyan-500/15 border-cyan-500/80 shadow-xl shadow-cyan-500/15 ring-2 ring-cyan-500/30",
      normalStyle:
        "bg-card border-border/80 hover:border-cyan-500/50 hover:shadow-lg hover:bg-cyan-500/[0.04]",
      iconStyle: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
      activeIconStyle: "bg-cyan-500 text-white shadow-md animate-pulse",
      gradient: "from-cyan-500/[0.07] via-transparent to-transparent",
    },
    {
      key: "NoShow",
      label: "لم يحضر",
      count: stats.noShow,
      icon: UserX,
      activeStyle:
        "bg-rose-500/15 border-rose-500/80 shadow-xl shadow-rose-500/15 ring-2 ring-rose-500/30",
      normalStyle:
        "bg-card border-border/80 hover:border-rose-500/50 hover:shadow-lg hover:bg-rose-500/[0.04]",
      iconStyle: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
      activeIconStyle: "bg-rose-500 text-white shadow-md",
      gradient: "from-rose-500/[0.07] via-transparent to-transparent",
    },
    {
      key: "Completed",
      label: "مكتملة",
      count: stats.completed,
      icon: CheckCircle2,
      activeStyle:
        "bg-emerald-500/15 border-emerald-500/80 shadow-xl shadow-emerald-500/15 ring-2 ring-emerald-500/30",
      normalStyle:
        "bg-card border-border/80 hover:border-emerald-500/50 hover:shadow-lg hover:bg-emerald-500/[0.04]",
      iconStyle: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      activeIconStyle: "bg-emerald-500 text-white shadow-md",
      gradient: "from-emerald-500/[0.07] via-transparent to-transparent",
      span: "col-span-2 sm:col-span-1",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((item) => {
        const Icon = item.icon;
        const isActive = statusFilter === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => setStatusFilter(item.key)}
            className={`${item.span || ""} relative overflow-hidden p-5 rounded-3xl border text-right transition-all duration-300 cursor-pointer flex flex-col justify-between group hover:-translate-y-1.5 ${
              isActive ? `${item.activeStyle} scale-[1.02]` : item.normalStyle
            }`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${item.gradient} transition-opacity duration-300 pointer-events-none ${
                isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"
              }`}
            />

            <div className="flex items-center justify-between w-full mb-5 relative z-10">
              <span
                className={`text-xs sm:text-sm font-black transition-colors ${
                  isActive
                    ? "text-foreground font-extrabold"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              >
                {item.label}
              </span>
              <div
                className={`p-3 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${
                  isActive ? item.activeIconStyle : item.iconStyle
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="relative z-10 flex items-baseline justify-between w-full">
              <span className="text-3xl font-black tracking-tight text-foreground">
                {item.count}
              </span>
              {isActive && (
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-background/95 text-foreground shadow-xs animate-fade-in border border-border/50">
                  نشط الآن
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
