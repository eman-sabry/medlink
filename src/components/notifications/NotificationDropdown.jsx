import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Volume2,
  VolumeX,
  ExternalLink,
  Inbox,
  Loader2,
  Settings,
} from "lucide-react";
import { NotificationItem } from "./NotificationItem";
import { getNotificationRoute } from "../../constants/notificationTypes";

export function NotificationDropdown({
  notifications = [],
  unreadNotifications = [],
  unreadCount = 0,
  isSoundEnabled = true,
  onToggleSound,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  isLoading = false,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'unread'
  const navigate = useNavigate();

  const displayedList = activeTab === "unread" ? unreadNotifications : notifications;

  const handleNavigate = (notification) => {
    const route = getNotificationRoute(notification);
    if (onClose) onClose();
    if (route) {
      navigate(route);
    }
  };

  return (
    <div
      className="w-80 sm:w-96 rounded-3xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden font-['Cairo',sans-serif] z-50 text-foreground animate-in fade-in zoom-in-95 duration-150"
      dir="rtl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-4 pb-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-foreground">
                مركز الإشعارات
              </h3>
              {unreadCount > 0 ? (
                <span className="text-[11px] font-bold text-primary">
                  {unreadCount} إشعار غير مقروء
                </span>
              ) : (
                <span className="text-[11px] font-medium text-muted-foreground">
                  كل الإشعارات مقروءة
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Sound toggle button */}
            <button
              type="button"
              onClick={onToggleSound}
              title={isSoundEnabled ? "كتم صوت الإشعارات" : "تفعيل صوت الإشعارات"}
              className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all cursor-pointer ${
                isSoundEnabled
                  ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                  : "border-border bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {isSoundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </button>

            {/* Mark all as read button */}
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                title="تحديد الكل كمقروء"
                className="flex items-center gap-1 px-2.5 h-8 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all cursor-pointer border border-border"
              >
                <CheckCheck className="h-3.5 w-3.5 text-primary" />
                <span className="hidden sm:inline text-[11px]">تحديد الكل</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab filters */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/40">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <span>الكل</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-bold">
              {notifications.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("unread")}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "unread"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <span>غير المقروءة</span>
            {unreadCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-destructive text-destructive-foreground font-extrabold animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-[380px] overflow-y-auto p-3 space-y-2 divide-y-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs font-medium">جاري تحميل الإشعارات…</span>
          </div>
        ) : displayedList.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-center px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-3">
              <Inbox className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-foreground">
              {activeTab === "unread" ? "لا توجد إشعارات غير مقروءة" : "لا توجد إشعارات حالياً"}
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
              {activeTab === "unread"
                ? "أنت على اطلاع بكل جديد وجميع التنبيهات تمت قراءتها."
                : "ستظهر هنا كافة الإشعارات الخاصة بالعيادة فور حدوثها."}
            </p>
          </div>
        ) : (
          displayedList.slice(0, 15).map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onNavigate={handleNavigate}
              onMarkAsRead={onMarkAsRead}
              onDelete={onDeleteNotification}
              compact={true}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-muted/20 flex items-center justify-between">
        <Link
          to="/notifications"
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
        >
          <span>عرض كافة الإشعارات ({notifications.length})</span>
          <ExternalLink className="h-3 w-3" />
        </Link>

        <Link
          to="/profile"
          onClick={onClose}
          title="إعدادات التنبيهات"
          className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
