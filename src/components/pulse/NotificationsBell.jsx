import { Bell, BellRing } from "lucide-react";
import { Dropdown, DropdownHeader } from "../ui/Dropdown";
import { useNotifications } from "../../hooks/useNotifications";

export function NotificationsBell() {
  const { notifications, unreadCount } = useNotifications();

  return (
    <Dropdown
      align="left"
      trigger={
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-xs"
        >
          {unreadCount > 0 ? (
            <BellRing className="h-4.5 w-4.5 text-primary" />
          ) : (
            <Bell className="h-4.5 w-4.5" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4.5 w-4.5 min-w-4.5 px-1 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-black ring-2 ring-card">
              {unreadCount}
            </span>
          )}
        </button>
      }
    >
      <DropdownHeader title="الإشعارات" subtitle={`${unreadCount} غير مقروء`} />
      <div className="max-h-72 overflow-y-auto space-y-1">
        {notifications.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">لا توجد إشعارات حالياً</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.recipientId}
              className="flex items-start gap-2.5 p-2.5 rounded-2xl hover:bg-muted/50 transition-colors"
            >
              <span
                className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                  n.readAt ? "bg-muted" : "bg-primary"
                }`}
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{n.title}</p>
                <p className="text-[11px] text-muted-foreground">{n.type}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Dropdown>
  );
}
