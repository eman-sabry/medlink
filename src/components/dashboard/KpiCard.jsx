import { memo } from "react";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Sparkline } from "./Sparkline";
import { getDashboardTheme } from "./dashboardTheme";

function TrendBadge({ trend }) {
  if (!trend) return null;
  const isUp = trend.direction === "up";
  const Icon = isUp ? TrendingUp : TrendingDown;
  const toneClass = isUp ? "bg-emerald-500/15 text-emerald-600" : "bg-rose-500/15 text-rose-600";

  return (
    <span
      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black ${toneClass}`}
    >
      <Icon className="h-3 w-3" />
      {trend.percent}%
    </span>
  );
}

export const KpiCard = memo(function KpiCard({
  label,
  value,
  suffix,
  description,
  icon: Icon,
  color = "blue",
  trend,
  sparklineData,
  sparklineKey = "count",
  isLoading = false,
}) {
  const theme = getDashboardTheme(color);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm animate-pulse space-y-4">
        <div className="h-10 w-10 rounded-2xl bg-muted" />
        <div className="h-6 w-16 rounded-lg bg-muted" />
        <div className="h-3 w-24 rounded bg-muted" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-sm hover:shadow-lg transition-shadow duration-300`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${theme.glow} to-transparent`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-xs font-bold text-muted-foreground block truncate">{label}</span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <motion.span
              key={String(value)}
              initial={{ opacity: 0.4, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="text-2xl font-black text-foreground"
            >
              {value}
            </motion.span>
            {suffix && <span className="text-xs font-bold text-muted-foreground">{suffix}</span>}
            <TrendBadge trend={trend} />
          </div>
          {description && (
            <p className="text-[11px] text-muted-foreground mt-1 truncate">{description}</p>
          )}
        </div>

        {Icon && (
          <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${theme.icon}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {sparklineData && sparklineData.length > 1 && (
        <div className="relative mt-3 -mx-1">
          <Sparkline data={sparklineData} dataKey={sparklineKey} color={theme.spark} />
        </div>
      )}
    </motion.div>
  );
});
