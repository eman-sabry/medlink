import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const CHIP_STYLES = {
  success: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/15",
  info: "bg-blue-500/10 text-blue-600 ring-blue-500/15",
  analytics: "bg-purple-500/10 text-purple-600 ring-purple-500/15",
  attention: "bg-amber-500/10 text-amber-600 ring-amber-500/15",
  critical: "bg-rose-500/10 text-rose-600 ring-rose-500/15",
  neutral: "bg-slate-500/10 text-slate-600 ring-slate-500/15",
};

export function InsightBanner({ title = "ملخص لحظي", insights = [] }) {
  if (insights.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-primary/10 via-cyan-500/5 to-transparent" />
      <div className="relative space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-black text-foreground text-sm">{title}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {insights.map((insight) => {
            const Icon = insight.icon;
            return (
              <span
                key={insight.id}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ring-1 ${
                  CHIP_STYLES[insight.tone] ?? CHIP_STYLES.info
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                {insight.text}
              </span>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
