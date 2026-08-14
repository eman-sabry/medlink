import { Radio, AlertCircle } from "lucide-react";

export function LiveLauncher({
  onOpen,
  newCount = 0,
  hasCritical = false,
}) {
  return (
    <div
      className="fixed bottom-6 right-6 z-40 flex items-center print:hidden"
      dir="rtl"
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label="فتح شاشة التشغيل المباشر (Live Center)"
        title="شاشة التشغيل المباشر للمركز"
        className={`group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer border ${
          hasCritical
            ? "bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 border-rose-400 text-white shadow-rose-600/40 animate-bounce-subtle ring-4 ring-rose-500/20"
            : "bg-gradient-to-r from-slate-900 via-slate-800 to-zinc-900 dark:from-zinc-900 dark:via-zinc-800 dark:to-black border-red-500/40 text-white shadow-red-500/20 hover:border-red-500"
        }`}
      >
        {/* Live Indicator Icon */}
        <div className="relative flex items-center justify-center">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500" />
          </span>
        </div>

        {/* Title */}
        <div className="flex flex-col text-right">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black tracking-wider uppercase">
              LIVE CENTER
            </span>
            <Radio className="h-3 w-3 text-red-400 animate-pulse" />
          </div>
          <span className="text-[10px] text-zinc-300 font-medium">
            شاشة التشغيل المباشر
          </span>
        </div>

        {/* New events badge */}
        {newCount > 0 && (
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-black shadow-md animate-pulse">
            {newCount}
          </span>
        )}

        {/* Critical Alert Icon */}
        {hasCritical && (
          <AlertCircle className="h-4 w-4 text-amber-200 animate-spin-slow" />
        )}
      </button>
    </div>
  );
}
