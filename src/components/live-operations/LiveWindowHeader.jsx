import {
  Volume2,
  VolumeX,
  Pin,
  PinOff,
  Minus,
  Square,
  Minimize2,
  X,
  GripHorizontal,
  Radio,
} from "lucide-react";

export function LiveWindowHeader({
  isPinned,
  onTogglePin,
  isMinimized,
  onToggleMinimize,
  isMaximized,
  onToggleMaximize,
  onClose,
  soundEnabled,
  onToggleSound,
  onPointerDown,
}) {
  return (
    <div
      onPointerDown={onPointerDown}
      className={`select-none relative flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-slate-900 via-zinc-900 to-slate-900 text-white rounded-t-2xl border-b border-white/10 shadow-md ${
        isPinned || isMaximized ? "cursor-default" : "cursor-grab active:cursor-grabbing"
      }`}
      dir="rtl"
    >
      {/* Left side: Brand, Live indicator and Grip */}
      <div className="flex items-center gap-2.5 min-w-0">
        {!isPinned && !isMaximized && (
          <GripHorizontal className="h-4 w-4 text-zinc-400 shrink-0 opacity-60 hover:opacity-100 transition-opacity" />
        )}

        {/* Live Pulse Dot */}
        <div className="relative flex items-center justify-center shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
        </div>

        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-black tracking-wider uppercase truncate text-white">
            LIVE CENTER
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-500/20 border border-red-500/40 text-[10px] font-black text-red-400">
            <Radio className="h-2.5 w-2.5 animate-pulse" />
            مباشر
          </span>
        </div>
      </div>

      {/* Right side: Action controls */}
      <div
        className="flex items-center gap-1 shrink-0"
        onPointerDown={(e) => e.stopPropagation()} // Prevent dragging when clicking buttons
      >
        {/* Sound toggle */}
        <button
          type="button"
          onClick={onToggleSound}
          aria-label={soundEnabled ? "كتم صوت التشغيل المباشر" : "تفعيل صوت التشغيل المباشر"}
          title={soundEnabled ? "صوت التشغيل المباشر: مفعّل" : "صوت التشغيل المباشر: معطّل"}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            soundEnabled
              ? "text-zinc-300 hover:text-white hover:bg-white/10"
              : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
          }`}
        >
          {soundEnabled ? (
            <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <VolumeX className="h-3.5 w-3.5 text-zinc-400" />
          )}
        </button>

        {/* Pin toggle */}
        <button
          type="button"
          onClick={onTogglePin}
          aria-label={isPinned ? "إلغاء تثبيت النافذة" : "تثبيت النافذة"}
          title={isPinned ? "النافذة مثبتة (غير قابلة للتحريك)" : "تثبيت النافذة"}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isPinned
              ? "text-amber-400 bg-amber-500/20 hover:bg-amber-500/30"
              : "text-zinc-300 hover:text-white hover:bg-white/10"
          }`}
        >
          {isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
        </button>

        {/* Minimize */}
        <button
          type="button"
          onClick={onToggleMinimize}
          aria-label={isMinimized ? "استعادة النافذة" : "تصغير النافذة"}
          title={isMinimized ? "استعادة الحجم" : "تصغير إلى شريط"}
          className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        {/* Maximize */}
        <button
          type="button"
          onClick={onToggleMaximize}
          aria-label={isMaximized ? "استعادة الحجم السابق" : "تكبير النافذة"}
          title={isMaximized ? "استعادة الحجم السابق" : "تكبير النافذة"}
          className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          {isMaximized ? (
            <Minimize2 className="h-3.5 w-3.5" />
          ) : (
            <Square className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق نافذة التشغيل المباشر"
          title="إغلاق النافذة (مع إبقاء زر الإطلاق المباشر)"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
