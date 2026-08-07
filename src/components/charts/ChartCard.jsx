import { motion } from "framer-motion";
import { AlertTriangle, BarChart3, TrendingDown, TrendingUp } from "lucide-react";
import { getDashboardTheme } from "../dashboard/dashboardTheme";

function ChartSkeleton() {
  return (
    <div className="h-full w-full flex items-end gap-2 px-2 animate-pulse">
      {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-lg bg-muted"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

function ChartMessage({ icon: Icon, message }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-3 text-center">
      <div className="h-11 w-11 rounded-2xl bg-muted/60 flex items-center justify-center">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-xs font-medium text-muted-foreground max-w-[220px]">{message}</p>
    </div>
  );
}

function TrendBadge({ trend }) {
  if (!trend) return null;
  const isUp = trend.direction === "up";
  const Icon = isUp ? TrendingUp : TrendingDown;
  const tone = trend.tone === "bad" ? !isUp : isUp;
  const toneClass = tone
    ? "bg-emerald-500/10 text-emerald-600"
    : "bg-rose-500/10 text-rose-600";

  return (
    <div
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${toneClass}`}
    >
      <Icon className="h-3 w-3" />
      <span>{trend.label}</span>
    </div>
  );
}

export function ChartCard({
  title,
  subtitle,
  icon: Icon,
  color,
  isLoading = false,
  isEmpty = false,
  isError = false,
  emptyMessage = "لا توجد بيانات كافية لعرضها بعد",
  errorMessage = "تعذر تحميل بيانات الرسم البياني",
  height = 280,
  trend,
  actions,
  children,
}) {
  const theme = color ? getDashboardTheme(color) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-5"
      dir="rtl"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div
              className={
                theme
                  ? `h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${theme.icon}`
                  : "p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0 ring-1 ring-primary/15"
              }
            >
              <Icon className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-black text-foreground text-sm tracking-tight truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <TrendBadge trend={trend} />
          {actions}
        </div>
      </div>

      <div style={{ height }} className="w-full">
        {isLoading ? (
          <ChartSkeleton />
        ) : isError ? (
          <ChartMessage icon={AlertTriangle} message={errorMessage} />
        ) : isEmpty ? (
          <ChartMessage icon={BarChart3} message={emptyMessage} />
        ) : (
          children
        )}
      </div>
    </motion.div>
  );
}
