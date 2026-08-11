import { motion } from "framer-motion";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

const LEVEL_STYLES = {
  error:
    "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/15",
  warning:
    "bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/15",
};

const LEVEL_ICONS = {
  error: AlertOctagon,
  warning: AlertTriangle,
};

export function SystemAlertsPanel({ alerts = [] }) {
  return (
    <div className="bg-card border border-border/80 rounded-[2.5rem] p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15 shadow-xs">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-black text-foreground text-sm md:text-base">
              تنبيهات النظام
            </h3>
            <p className="text-[11px] font-medium text-muted-foreground">
              حالة الأخطاء والتحذيرات الفورية
            </p>
          </div>
        </div>

        <span
          className={`text-xs font-black px-3 py-1.5 rounded-full border ${
            alerts.length > 0
              ? "bg-destructive/10 text-destructive border-destructive/20"
              : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
          }`}
        >
          {alerts.length > 0 ? `${alerts.length} تنبيه` : "آمن"}
        </span>
      </div>

      {alerts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold"
        >
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="font-black text-xs md:text-sm">
              لا توجد تنبيهات حالياً
            </p>
            <p className="text-[11px] font-medium text-emerald-600/80">
              كل الأنظمة والخدمات تعمل بشكل طبيعي تماماً.
            </p>
          </div>
        </motion.div>
      ) : (
        <ul className="space-y-3 max-h-72 overflow-y-auto pl-1 custom-scrollbar">
          {alerts.map((alert, index) => {
            const Icon = LEVEL_ICONS[alert.level] ?? AlertTriangle;
            return (
              <motion.li
                key={alert.id || index}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                className={`flex items-start gap-3.5 p-4 rounded-2xl border text-xs font-bold transition-all ${
                  LEVEL_STYLES[alert.level] ?? LEVEL_STYLES.warning
                }`}
              >
                <div className="p-2 rounded-xl bg-background/80 shrink-0 shadow-xs border border-current/20">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 space-y-0.5 pt-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider opacity-75 block">
                    {alert.level === "error" ? "خطأ حرج" : "تحذير نظام"}
                  </span>
                  <p className="font-bold text-xs md:text-sm leading-relaxed text-foreground">
                    {alert.message}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
