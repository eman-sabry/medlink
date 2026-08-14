import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { NotificationDropdown } from "./NotificationDropdown";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const {
    notifications,
    unreadNotifications,
    unreadCount,
    isSoundEnabled,
    toggleSound,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isLoading,
  } = useNotifications();

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const displayCount = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="الإشعارات"
        aria-expanded={isOpen}
        className={`relative cursor-pointer flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-200 shadow-xs outline-none ${
          isOpen
            ? "border-primary bg-primary/10 text-primary"
            : "border-border/80 bg-card text-muted-foreground hover:bg-card hover:text-foreground hover:border-primary/40"
        }`}
      >
        <Bell className={`h-5 w-5 transition-transform ${unreadCount > 0 ? "animate-[swing_2s_ease-in-out_infinite]" : ""}`} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-black text-destructive-foreground ring-2 ring-card shadow-sm animate-in zoom-in-50">
            {displayCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-3 z-50 origin-top-left">
          <NotificationDropdown
            notifications={notifications}
            unreadNotifications={unreadNotifications}
            unreadCount={unreadCount}
            isSoundEnabled={isSoundEnabled}
            onToggleSound={toggleSound}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDeleteNotification={deleteNotification}
            isLoading={isLoading}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
