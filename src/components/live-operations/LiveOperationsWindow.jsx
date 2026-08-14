import { useState, useEffect, useRef, useCallback } from "react";
import { LiveWindowHeader } from "./LiveWindowHeader";
import { LiveSummaryBar } from "./LiveSummaryBar";
import { LiveEventList } from "./LiveEventList";
import { LiveLauncher } from "./LiveLauncher";
import { useLiveOperations } from "../../hooks/useLiveOperations";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../permissions/roles";
import {
  Volume2,
  VolumeX,
  ChevronUp,
  X,
} from "lucide-react";

const WINDOW_STORAGE_KEY = "medlink_live_window_state_v2";

const DEFAULT_DIMENSIONS = {
  width: 380,
  height: 520,
  minWidth: 320,
  minHeight: 360,
  maxWidth: 720,
  maxHeight: 850,
};

function getInitialWindowState() {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const defaultX = typeof window !== "undefined" ? Math.max(20, window.innerWidth - 420) : 100;
  const defaultY = 90;

  try {
    const saved = localStorage.getItem(WINDOW_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        x: typeof parsed.x === "number" ? parsed.x : defaultX,
        y: typeof parsed.y === "number" ? parsed.y : defaultY,
        width: typeof parsed.width === "number" ? parsed.width : DEFAULT_DIMENSIONS.width,
        height: typeof parsed.height === "number" ? parsed.height : DEFAULT_DIMENSIONS.height,
        isMinimized: Boolean(parsed.isMinimized),
        isClosed: Boolean(parsed.isClosed),
        isMaximized: Boolean(parsed.isMaximized),
        isPinned: Boolean(parsed.isPinned),
        soundEnabled: parsed.soundEnabled !== false,
      };
    }
  } catch {
    // fallback
  }

  return {
    x: defaultX,
    y: defaultY,
    width: isMobile ? 340 : DEFAULT_DIMENSIONS.width,
    height: DEFAULT_DIMENSIONS.height,
    isMinimized: false,
    isClosed: false,
    isMaximized: false,
    isPinned: false,
    soundEnabled: true,
  };
}

export function LiveOperationsWindow() {
  const { user } = useAuth();
  const role = user?.role || "";

  // Only render for Secretary and Owner
  const isAuthorized = role === ROLES.SECRETARY || role === ROLES.OWNER || role === "Secretary" || role === "Owner";

  const [windowState, setWindowState] = useState(getInitialWindowState);
  const [selectedTab, setSelectedTab] = useState("all");
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, startX: 0, startY: 0 });
  const resizeStartRef = useRef({ pointerX: 0, pointerY: 0, startWidth: 0, startHeight: 0, startX: 0 });
  const prevDimensionsRef = useRef({ width: windowState.width, height: windowState.height, x: windowState.x, y: windowState.y });

  const {
    activeSessions,
    waitingPatients,
    appointmentsNow,
    delayedAppointments,
    completedSessions,
    doctorStatuses,
    roomStatuses,
    allEvents,
    newEventsCount,
    hasCriticalAttention,
    soundEnabled,
    toggleSound,
    setSound,
    acknowledgeEvent,
    acknowledgeAll,
  } = useLiveOperations();

  // Sync sound settings between hook and window state
  useEffect(() => {
    if (windowState.soundEnabled !== soundEnabled) {
      setSound(windowState.soundEnabled);
    }
  }, [windowState.soundEnabled, soundEnabled, setSound]);

  // Persist window state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WINDOW_STORAGE_KEY, JSON.stringify(windowState));
    } catch {
      // ignore
    }
  }, [windowState]);

  // Handle Dragging
  const handlePointerDownHeader = (e) => {
    if (windowState.isPinned || windowState.isMaximized) return;
    if (e.target.closest("button") || e.target.closest("input")) return;

    e.preventDefault();
    setIsDragging(true);

    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startX: windowState.x,
      startY: windowState.y,
    };

    const handlePointerMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - dragStartRef.current.pointerX;
      const deltaY = moveEvent.clientY - dragStartRef.current.pointerY;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const currentWidth = windowState.isMinimized ? 320 : windowState.width;
      const currentHeight = windowState.isMinimized ? 44 : windowState.height;

      const maxX = Math.max(0, viewportWidth - currentWidth - 10);
      const maxY = Math.max(0, viewportHeight - currentHeight - 10);

      const nextX = Math.min(Math.max(10, dragStartRef.current.startX + deltaX), maxX);
      const nextY = Math.min(Math.max(10, dragStartRef.current.startY + deltaY), maxY);

      setWindowState((prev) => ({
        ...prev,
        x: nextX,
        y: nextY,
      }));
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // Handle Resizing
  const handlePointerDownResize = (e) => {
    if (windowState.isMinimized || windowState.isMaximized) return;

    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    resizeStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startWidth: windowState.width,
      startHeight: windowState.height,
      startX: windowState.x,
    };

    const handlePointerMove = (moveEvent) => {
      // Resizing from bottom-left corner in RTL
      const deltaX = resizeStartRef.current.pointerX - moveEvent.clientX;
      const deltaY = moveEvent.clientY - resizeStartRef.current.pointerY;

      const nextWidth = Math.min(
        Math.max(DEFAULT_DIMENSIONS.minWidth, resizeStartRef.current.startWidth + deltaX),
        Math.min(window.innerWidth - 40, DEFAULT_DIMENSIONS.maxWidth)
      );

      const nextHeight = Math.min(
        Math.max(DEFAULT_DIMENSIONS.minHeight, resizeStartRef.current.startHeight + deltaY),
        Math.min(window.innerHeight - 40, DEFAULT_DIMENSIONS.maxHeight)
      );

      setWindowState((prev) => ({
        ...prev,
        width: nextWidth,
        height: nextHeight,
      }));
    };

    const handlePointerUp = () => {
      setIsResizing(false);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handleTogglePin = useCallback(() => {
    setWindowState((prev) => ({ ...prev, isPinned: !prev.isPinned }));
  }, []);

  const handleToggleMinimize = useCallback(() => {
    setWindowState((prev) => ({ ...prev, isMinimized: !prev.isMinimized, isMaximized: false }));
  }, []);

  const handleToggleMaximize = useCallback(() => {
    setWindowState((prev) => {
      if (prev.isMaximized) {
        return {
          ...prev,
          isMaximized: false,
          width: prevDimensionsRef.current.width,
          height: prevDimensionsRef.current.height,
          x: prevDimensionsRef.current.x,
          y: prevDimensionsRef.current.y,
        };
      } else {
        prevDimensionsRef.current = { width: prev.width, height: prev.height, x: prev.x, y: prev.y };
        return {
          ...prev,
          isMaximized: true,
          isMinimized: false,
        };
      }
    });
  }, []);

  const handleClose = useCallback(() => {
    setWindowState((prev) => ({ ...prev, isClosed: true }));
  }, []);

  const handleReopen = useCallback(() => {
    setWindowState((prev) => ({ ...prev, isClosed: false }));
  }, []);

  const handleToggleSound = useCallback(() => {
    const nextVal = toggleSound();
    setWindowState((prev) => ({ ...prev, soundEnabled: nextVal }));
  }, [toggleSound]);

  if (!isAuthorized) return null;

  // Render launcher when window is closed
  if (windowState.isClosed) {
    return (
      <LiveLauncher
        onOpen={handleReopen}
        newCount={newEventsCount}
        hasCritical={hasCriticalAttention}
        soundEnabled={soundEnabled}
      />
    );
  }

  // Minimized Bar Mode
  if (windowState.isMinimized) {
    return (
      <div
        style={{
          position: "fixed",
          left: `${windowState.x}px`,
          top: `${windowState.y}px`,
          zIndex: 50,
        }}
        onPointerDown={handlePointerDownHeader}
        className={`group flex items-center justify-between gap-3 px-3 py-2 bg-gradient-to-r from-slate-900 via-zinc-900 to-slate-900 text-white rounded-2xl shadow-2xl border border-red-500/40 select-none ${
          windowState.isPinned ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        }`}
        dir="rtl"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <span className="text-xs font-black tracking-wider uppercase truncate">
            LIVE CENTER
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-300">
            <span className="text-emerald-400">• {activeSessions.length} نشطة</span>
            <span className="text-amber-400">• {waitingPatients.length} انتظار</span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0" onPointerDown={(e) => e.stopPropagation()}>
          {newEventsCount > 0 && (
            <span className="flex items-center justify-center h-4.5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-black animate-pulse">
              {newEventsCount} جديد
            </span>
          )}

          <button
            type="button"
            onClick={handleToggleSound}
            aria-label="تبديل صوت التشغيل المباشر"
            className="p-1 rounded text-zinc-400 hover:text-white cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-emerald-400" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleToggleMinimize}
            aria-label="توسيع النافذة"
            title="توسيع النافذة"
            className="p-1 rounded text-zinc-300 hover:text-white cursor-pointer"
          >
            <ChevronUp className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleClose}
            aria-label="إغلاق"
            title="إغلاق"
            className="p-1 rounded text-zinc-400 hover:text-rose-400 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Maximized vs Normal Style
  const windowStyle = windowState.isMaximized
    ? {
        position: "fixed",
        top: "80px",
        left: "20px",
        right: "20px",
        bottom: "20px",
        zIndex: 50,
        width: "auto",
        height: "auto",
        maxWidth: "900px",
        margin: "0 auto",
      }
    : {
        position: "fixed",
        left: `${windowState.x}px`,
        top: `${windowState.y}px`,
        width: `${windowState.width}px`,
        height: `${windowState.height}px`,
        zIndex: 50,
      };

  return (
    <div
      style={windowStyle}
      className={`flex flex-col bg-card/95 backdrop-blur-xl text-foreground rounded-2xl shadow-2xl border border-border/80 overflow-hidden select-none transition-shadow ${
        isDragging || isResizing ? "shadow-red-500/20 ring-2 ring-red-500/40" : "shadow-2xl"
      }`}
      dir="rtl"
    >
      {/* Header */}
      <LiveWindowHeader
        isPinned={windowState.isPinned}
        onTogglePin={handleTogglePin}
        isMinimized={windowState.isMinimized}
        onToggleMinimize={handleToggleMinimize}
        isMaximized={windowState.isMaximized}
        onToggleMaximize={handleToggleMaximize}
        onClose={handleClose}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onPointerDown={handlePointerDownHeader}
      />

      {/* Quick Status Metric Pills */}
      <LiveSummaryBar
        activeCount={activeSessions.length}
        waitingCount={waitingPatients.length}
        nowCount={appointmentsNow.length}
        delayedCount={delayedAppointments.length}
        selectedTab={selectedTab}
        onSelectTab={setSelectedTab}
      />

      {/* Main Events List */}
      <LiveEventList
        activeSessions={activeSessions}
        waitingPatients={waitingPatients}
        appointmentsNow={appointmentsNow}
        delayedAppointments={delayedAppointments}
        completedSessions={completedSessions}
        doctorStatuses={doctorStatuses}
        roomStatuses={roomStatuses}
        allEvents={allEvents}
        selectedTab={selectedTab}
        onSelectTab={setSelectedTab}
        onAcknowledge={acknowledgeEvent}
        onAcknowledgeAll={acknowledgeAll}
        newCount={newEventsCount}
      />

      {/* Bottom Footer Status & Resize Handle */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/40 border-t border-border/40 text-[11px] text-muted-foreground shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold">تحديث مباشر مستمر</span>
          {soundEnabled && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              (الصوت مفعّل)
            </span>
          )}
        </div>

        {/* Resize Grip (Bottom-left corner for RTL) */}
        {!windowState.isMaximized && (
          <div
            onPointerDown={handlePointerDownResize}
            title="تكبير / تصغير حجم النافذة"
            className="w-4 h-4 flex items-center justify-center cursor-nwse-resize text-muted-foreground hover:text-foreground active:text-primary transition-colors"
          >
            <div className="w-2 h-2 border-b-2 border-l-2 border-current rounded-bl" />
          </div>
        )}
      </div>
    </div>
  );
}
