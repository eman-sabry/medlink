import { memo } from "react";
import { motion } from "framer-motion";
import { getDashboardTheme } from "../dashboardTheme";

export const LiveStatTile = memo(function LiveStatTile({
  label,
  value,
  description,
  icon: Icon,
  tone = "info",
  live = true,
  isLoading = false,
}) {
  const theme = getDashboardTheme(tone);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm animate-pulse space-y-4">
        <div className="h-3 w-20 rounded bg-muted" />
        <div className="h-10 w-16 rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-sm"
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-l ${theme.icon}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {live && (
              <span className="relative flex h-2 w-2 shrink-0">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                  style={{ backgroundColor: theme.spark }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ backgroundColor: theme.spark }}
                />
              </span>
            )}
            <span className="text-xs font-bold text-muted-foreground truncate">{label}</span>
          </div>
          <motion.span
            key={String(value)}
            initial={{ opacity: 0.4, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="block text-4xl font-black text-foreground mt-2 tracking-tight"
          >
            {value}
          </motion.span>
          {description && (
            <p className="text-[11px] text-muted-foreground mt-1.5 truncate">{description}</p>
          )}
        </div>

        {Icon && (
          <div
            className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${theme.icon}`}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
      </div>
    </motion.div>
  );
});
