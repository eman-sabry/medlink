import { motion } from "framer-motion";
import { AlertOctagon, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

const LEVEL_STYLES = {
  error: "bg-destructive/10 text-destructive border-destructive/30",
  warning: "bg-amber-500/10 text-amber-600 border-amber-500/30",
};

const LEVEL_ICONS = {
  error: AlertOctagon,
  warning: AlertTriangle,
};

export function SystemAlertsPanel({ alerts = [] }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <ShieldAlert className="h-4 w-4" />
        </div>
        <h3 className="font-black text-foreground text-sm">تنبيهات النظام</h3>
      </div>

      {alerts.length === 0 ? (
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 text-xs font-bold">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>لا توجد تنبيهات حالياً، كل شيء يعمل بشكل طبيعي.</span>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {alerts.map((alert, index) => {
            const Icon = LEVEL_ICONS[alert.level] ?? AlertTriangle;
            return (
              <motion.li
                key={alert.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold ${
                  LEVEL_STYLES[alert.level] ?? LEVEL_STYLES.warning
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{alert.message}</span>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
