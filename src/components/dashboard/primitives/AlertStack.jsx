import { AlertOctagon, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

const SEVERITY_CONFIG = {
  critical: {
    label: "حرج",
    icon: AlertOctagon,
    badge:
      "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 font-black",
    bar: "bg-red-500",
    row: "bg-red-500/[0.03] border border-red-500/15 hover:bg-red-500/[0.06] transition-colors",
    pulse: true,
  },
  warning: {
    label: "تحذير",
    icon: AlertTriangle,
    badge:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-black",
    bar: "bg-amber-500",
    row: "bg-amber-500/[0.03] border border-amber-500/15 hover:bg-amber-500/[0.06] transition-colors",
    pulse: false,
  },
  normal: {
    label: "طبيعي",
    icon: Clock,
    badge: "bg-muted text-muted-foreground border-border font-semibold",
    bar: "bg-muted-foreground/30",
    row: "bg-card border border-border/60 hover:bg-muted/30 transition-colors",
    pulse: false,
  },
};

export function AlertStack({
  items = [],
  title = "التنبيهات",
  icon: Icon = AlertTriangle,
  emptyMessage = "لا توجد تنبيهات حالياً، كل شيء يعمل بشكل طبيعي.",
}) {
  return (
    <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="font-black text-foreground text-sm tracking-tight">
            {title}
          </h3>
        </div>
        {items.length > 0 && (
          <span className="text-xs font-black bg-red-500/10 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-full border border-red-500/20">
            {items.length} تنبيهات
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{emptyMessage}</span>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const config =
              SEVERITY_CONFIG[item.severity] ?? SEVERITY_CONFIG.normal;
            const SeverityIcon = config.icon;
            return (
              <li
                key={item.id}
                className={`relative overflow-hidden flex items-center justify-between gap-3.5 p-3.5 pr-5 rounded-2xl text-xs ${config.row}`}
              >
              

                <div className="min-w-0 space-y-0.5">
                  <p className="font-extrabold text-foreground text-xs leading-relaxed truncate">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="text-muted-foreground text-[11px] truncate">
                      {item.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {item.meta && (
                    <span className="font-mono font-black text-xs text-foreground bg-muted/60 px-2 py-1 rounded-lg border border-border/60">
                      {item.meta}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] border ${config.badge}`}
                  >
                    <SeverityIcon
                      className={`h-3 w-3 ${config.pulse ? "animate-pulse" : ""}`}
                    />
                    {config.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
