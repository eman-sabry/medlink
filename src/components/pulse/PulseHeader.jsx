import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Clock, Radio, AlertTriangle } from "lucide-react";
import { STATUS_TONE_CLASSES } from "../../helpers/centerPulse.helpers";

function LiveClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  let dateLabel;
  let timeLabel;
  try {
    dateLabel = now.toLocaleDateString("ar-EG-u-nu-latn", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    timeLabel = now.toLocaleTimeString("ar-EG-u-nu-latn", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch {
    dateLabel = now.toLocaleDateString();
    timeLabel = now.toLocaleTimeString();
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <Radio className="h-3 w-3 animate-pulse" />
        <span>تحديث مباشر</span>
      </div>

      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground font-medium">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-primary" />
          {dateLabel}
        </span>
        <span className="text-border">•</span>
        <span className="font-mono font-bold text-foreground bg-muted/50 px-2 py-0.5 rounded-md border border-border/60">
          {timeLabel}
        </span>
      </div>
    </div>
  );
}

const BACKDROP_GLOW = {
  normal: "from-primary/10 via-cyan-500/5",
  busy: "from-amber-500/15 via-amber-500/5",
  critical: "from-destructive/15 via-destructive/5",
};

export function PulseHeader({ centerStatus }) {
  const isCritical =
    centerStatus.tone === "critical" || centerStatus.tone === "busy";

  return (
    <div className="relative space-y-4 bg-card rounded-3xl p-6 shadow-xs overflow-hidden">
      {centerStatus.tone !== "normal" && (
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-l ${BACKDROP_GLOW[centerStatus.tone]} to-transparent opacity-60`}
        />
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-cyan-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/25"
          >
            <Activity className="h-7 w-7 animate-pulse" />
          </motion.div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              نبض المركز
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              متابعة لحظية لحالة الأقسام والضغط والعمليات التشغيلية.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-muted/40 p-3 rounded-2xl border border-border/60">
          <LiveClock />

          <div className="hidden sm:block h-6 w-px bg-border" />

          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-black shadow-xs ${
              isCritical
                ? "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 animate-pulse"
                : STATUS_TONE_CLASSES[centerStatus.tone]
            }`}
          >
            {isCritical && (
              <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
            )}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
            </span>
            <span>{centerStatus.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
