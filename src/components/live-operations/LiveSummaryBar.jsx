import { Activity, Clock, Calendar, AlertTriangle } from "lucide-react";

export function LiveSummaryBar({
  activeCount = 0,
  waitingCount = 0,
  nowCount = 0,
  delayedCount = 0,
  selectedTab = "all",
  onSelectTab,
}) {
  return (
    <div className="grid grid-cols-4 gap-1.5 p-2 bg-muted/40 dark:bg-zinc-900/60 border-b border-border/40 text-right select-none" dir="rtl">
      {/* Active Sessions */}
      <button
        type="button"
        onClick={() => onSelectTab?.(selectedTab === "session" ? "all" : "session")}
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all cursor-pointer ${
          selectedTab === "session"
            ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-xs"
            : "bg-card/60 hover:bg-card border-border/60 text-foreground/80"
        }`}
        title="الجلسات الحية النشطة"
      >
        <div className="flex items-center gap-1">
          <Activity className="h-3 w-3 text-emerald-500 animate-pulse" />
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
            {activeCount}
          </span>
        </div>
        <span className="text-[9px] font-bold text-muted-foreground mt-0.5 truncate max-w-full">
          نشطة
        </span>
      </button>

      {/* Waiting */}
      <button
        type="button"
        onClick={() => onSelectTab?.(selectedTab === "waiting" ? "all" : "waiting")}
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all cursor-pointer ${
          selectedTab === "waiting"
            ? "bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 shadow-xs"
            : "bg-card/60 hover:bg-card border-border/60 text-foreground/80"
        }`}
        title="المرضى في الانتظار"
      >
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-amber-500" />
          <span className="text-xs font-black text-amber-600 dark:text-amber-400">
            {waitingCount}
          </span>
        </div>
        <span className="text-[9px] font-bold text-muted-foreground mt-0.5 truncate max-w-full">
          انتظار
        </span>
      </button>

      {/* Now */}
      <button
        type="button"
        onClick={() => onSelectTab?.(selectedTab === "now" ? "all" : "now")}
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all cursor-pointer ${
          selectedTab === "now"
            ? "bg-blue-500/15 border-blue-500 text-blue-600 dark:text-blue-400 shadow-xs"
            : "bg-card/60 hover:bg-card border-border/60 text-foreground/80"
        }`}
        title="مواعيد الآن"
      >
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-blue-500" />
          <span className="text-xs font-black text-blue-600 dark:text-blue-400">
            {nowCount}
          </span>
        </div>
        <span className="text-[9px] font-bold text-muted-foreground mt-0.5 truncate max-w-full">
          الآن
        </span>
      </button>

      {/* Delayed */}
      <button
        type="button"
        onClick={() => onSelectTab?.(selectedTab === "delayed" ? "all" : "delayed")}
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all cursor-pointer ${
          selectedTab === "delayed"
            ? "bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400 shadow-xs"
            : "bg-card/60 hover:bg-card border-border/60 text-foreground/80"
        }`}
        title="المواعيد المتأخرة"
      >
        <div className="flex items-center gap-1">
          <AlertTriangle className={`h-3 w-3 ${delayedCount > 0 ? "text-rose-500 animate-pulse" : "text-muted-foreground"}`} />
          <span className={`text-xs font-black ${delayedCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground/70"}`}>
            {delayedCount}
          </span>
        </div>
        <span className="text-[9px] font-bold text-muted-foreground mt-0.5 truncate max-w-full">
          متأخر
        </span>
      </button>
    </div>
  );
}
