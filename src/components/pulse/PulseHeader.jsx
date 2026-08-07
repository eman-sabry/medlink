import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Clock } from "lucide-react";
{/*import { useAuth } from "../../hooks/useAuth";
import { ROLE_LABELS } from "../../permissions/roles";
import { QuickSearchBox } from "./QuickSearchBox";
import { NotificationsBell } from "./NotificationsBell";*/}

const STATUS_TONE_CLASSES = {
  normal: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  busy: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  critical: "bg-destructive/10 text-destructive border-destructive/30",
};

function LiveClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dateLabel = new Intl.DateTimeFormat("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  const timeLabel = new Intl.DateTimeFormat("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(now);

  return (
    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
      <span className="inline-flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" />
        {dateLabel}
      </span>
      <span className="text-border">•</span>
      <span className="font-mono font-bold text-foreground">{timeLabel}</span>
    </p>
  );
}

export function PulseHeader({ centerStatus }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-cyan-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/30"
          >
            <Activity className="h-6 w-6" />
          </motion.div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              نبض المركز
            </h1>
            <LiveClock />
          </div>
        </div>

        {/* <div className="flex items-center gap-2.5 flex-wrap">
          <QuickSearchBox />
          <NotificationsBell />

          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-2xl border border-border">
            <Link
              to="/appointments"
              title="حجز موعد"
              className="h-8 w-8 flex items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-card transition-all"
            >
              <CalendarPlus className="h-4 w-4" />
            </Link>
            <Link
              to="/patients"
              title="إضافة مريض"
              className="h-8 w-8 flex items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-card transition-all"
            >
              <UserPlus className="h-4 w-4" />
            </Link>
          </div>

          <Link
            to="/profile"
            className="flex items-center gap-2.5 rounded-2xl border border-border bg-card p-1.5 pl-3 hover:shadow-md transition-all"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-foreground leading-tight">{user?.full_name}</p>
              <p className="text-[10px] text-primary font-semibold">
                {ROLE_LABELS[user?.role] ?? user?.role}
              </p>
            </div>
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
              {initial}
            </div>
          </Link>
        </div>*/}
      </div>

      <div
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-black ${
          STATUS_TONE_CLASSES[centerStatus.tone]
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
        حالة المركز الآن: {centerStatus.label}
      </div>
    </div>
  );
}
