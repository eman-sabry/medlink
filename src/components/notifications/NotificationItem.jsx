import React from "react";
import { Check, Trash2, ChevronLeft } from "lucide-react";
import {
  getNotificationIcon,
  SEVERITY_CONFIG,
  formatNotificationTime,
} from "../../constants/notificationTypes";

function NotificationIcon({ type, entityType, className = "h-5 w-5" }) {
  const Icon = getNotificationIcon(type, entityType);
  if (!Icon) return null;
  return React.createElement(Icon, { className });
}

export function NotificationItem({
  notification,
  onNavigate,
  onMarkAsRead,
  onDelete,
  compact = false,
}) {
  const {
    id,
    type,
    title,
    message,
    severity = "info",
    entity_type,
    created_at,
    is_read_for_user,
  } = notification;

  const severityStyle = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info;
  const timeFormatted = formatNotificationTime(created_at);

  const handleClick = () => {
    if (!is_read_for_user && onMarkAsRead) {
      onMarkAsRead(notification);
    }
    if (onNavigate) {
      onNavigate(notification);
    }
  };

  const handleMarkReadClick = (e) => {
    e.stopPropagation();
    if (onMarkAsRead) {
      onMarkAsRead(notification);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex items-start gap-3 rounded-2xl p-3.5 transition-all duration-200 cursor-pointer text-right border ${
        !is_read_for_user
          ? "bg-primary/5 dark:bg-primary/10 border-primary/20 hover:bg-primary/10 shadow-xs"
          : "bg-card/40 hover:bg-card border-border/40 hover:border-border"
      } ${compact ? "py-3 px-3" : "py-4 px-4"}`}
    >
      {/* Unread indicator dot */}
      {!is_read_for_user && (
        <span className="absolute top-4 right-2.5 h-2 w-2 rounded-full bg-primary animate-pulse ring-2 ring-primary/20" />
      )}

      {/* Icon with severity color */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${severityStyle.bgClass} shadow-xs`}
      >
        <NotificationIcon type={type} entityType={entity_type} className="h-5 w-5" />
      </div>

      {/* Content area */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`text-sm truncate ${
                !is_read_for_user ? "font-black text-foreground" : "font-bold text-foreground/80"
              }`}
            >
              {title}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${severityStyle.badgeClass}`}
            >
              {severityStyle.label}
            </span>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap shrink-0">
            {timeFormatted}
          </span>
        </div>

        <p
          className={`text-xs leading-relaxed line-clamp-2 ${
            !is_read_for_user ? "text-foreground/90 font-medium" : "text-muted-foreground"
          }`}
        >
          {message}
        </p>

        {/* Bottom toolbar on hover / mobile */}
        <div className="mt-2 flex items-center justify-between pt-1 border-t border-border/30">
          <span className="text-[11px] font-bold text-primary flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <span>عرض التفاصيل</span>
            <ChevronLeft className="h-3 w-3" />
          </span>

          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {!is_read_for_user && (
              <button
                type="button"
                onClick={handleMarkReadClick}
                title="تحديد كمقروء"
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={handleDeleteClick}
                title="حذف الإشعار"
                className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
