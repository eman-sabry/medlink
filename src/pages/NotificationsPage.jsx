import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Volume2,
  VolumeX,
  Search,
  Calendar,
  User,
  Activity,
  Receipt,
  Cpu,
  BedDouble,
  Inbox,
  Volume1,
  RefreshCw,
} from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import { NotificationItem } from "../components/notifications/NotificationItem";
import { getNotificationRoute } from "../constants/notificationTypes";
import { playNotificationChime } from "../utils/notificationSound";

const CATEGORIES = [
  { id: "all", label: "كافة الفئات", icon: Bell },
  { id: "appointment", label: "المواعيد", icon: Calendar },
  { id: "patient", label: "المرضى", icon: User },
  { id: "session", label: "الجلسات", icon: Activity },
  { id: "billing", label: "المالية والفواتير", icon: Receipt },
  { id: "device", label: "الأجهزة والصيانة", icon: Cpu },
  { id: "room", label: "الغرف والأسرة", icon: BedDouble },
];

const SEVERITIES = [
  { id: "all", label: "كافة المستويات" },
  { id: "info", label: "معلومات" },
  { id: "success", label: "نجاح" },
  { id: "warning", label: "تنبيه" },
  { id: "critical", label: "عاجل" },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isSoundEnabled,
    toggleSound,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isLoading,
    refetch,
  } = useNotifications();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState("all"); // 'all' | 'unread' | 'read'
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // Compute stats
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayCount = notifications.filter(
      (n) => new Date(n.created_at || 0).toDateString() === today
    ).length;
    const criticalCount = notifications.filter(
      (n) => n.severity === "critical" || n.severity === "warning"
    ).length;

    return {
      total: notifications.length,
      unread: unreadCount,
      today: todayCount,
      critical: criticalCount,
    };
  }, [notifications, unreadCount]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // Status filter
      if (statusTab === "unread" && notif.is_read_for_user) return false;
      if (statusTab === "read" && !notif.is_read_for_user) return false;

      // Severity filter
      if (selectedSeverity !== "all" && notif.severity !== selectedSeverity) return false;

      // Category filter
      if (selectedCategory !== "all") {
        if (selectedCategory === "billing") {
          if (!["invoice", "payment", "expense"].includes(notif.entity_type)) return false;
        } else if (selectedCategory === "device") {
          if (!["device", "maintenance"].includes(notif.entity_type)) return false;
        } else if (selectedCategory === "room") {
          if (!["room", "bed"].includes(notif.entity_type)) return false;
        } else if (notif.entity_type !== selectedCategory) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = notif.title?.toLowerCase().includes(query);
        const msgMatch = notif.message?.toLowerCase().includes(query);
        if (!titleMatch && !msgMatch) return false;
      }

      return true;
    });
  }, [notifications, statusTab, selectedSeverity, selectedCategory, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredNotifications.slice(start, start + itemsPerPage);
  }, [filteredNotifications, page]);

  const handleNavigate = (notification) => {
    const route = getNotificationRoute(notification);
    if (route) {
      navigate(route);
    }
  };

  const handleTestChime = () => {
    playNotificationChime("info");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-['Cairo',sans-serif]" dir="rtl">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                مركز الإشعارات والتنبيهات
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                متابعة فورية لكافة المواعيد، الجلسات، الفواتير والعمليات التشغيلية داخل العيادة
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Sound toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer shadow-xs ${
              isSoundEnabled
                ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {isSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span>{isSoundEnabled ? "صوت التنبيه مفعّل" : "صوت التنبيه مكتوم"}</span>
          </button>

          {isSoundEnabled && (
            <button
              type="button"
              onClick={handleTestChime}
              title="تجربة رنين التنبيه"
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-border bg-card hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-xs"
            >
              <Volume1 className="h-4 w-4 text-primary" />
              <span>تجربة النغمة</span>
            </button>
          )}

          {/* Mark all as read */}
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-sm hover:opacity-90 transition-all cursor-pointer"
            >
              <CheckCheck className="h-4 w-4" />
              <span>تحديد الكل كمقروء ({unreadCount})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => refetch()}
            title="تحديث البيانات"
            className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Stats summary grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl border border-border bg-card shadow-xs">
          <div className="text-xs font-bold text-muted-foreground">إجمالي الإشعارات</div>
          <div className="text-2xl font-black text-foreground mt-1">{stats.total}</div>
        </div>

        <div className="p-4 rounded-3xl border border-border bg-card shadow-xs">
          <div className="text-xs font-bold text-primary">غير المقروءة</div>
          <div className="text-2xl font-black text-primary mt-1">{stats.unread}</div>
        </div>

        <div className="p-4 rounded-3xl border border-border bg-card shadow-xs">
          <div className="text-xs font-bold text-muted-foreground">إشعارات اليوم</div>
          <div className="text-2xl font-black text-foreground mt-1">{stats.today}</div>
        </div>

        <div className="p-4 rounded-3xl border border-border bg-card shadow-xs">
          <div className="text-xs font-bold text-amber-500">تنبيهات هامة وعاجلة</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {stats.critical}
          </div>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="p-4 sm:p-5 rounded-3xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="ابحث في عنوان الإشعار أو تفاصيله..."
              className="w-full h-11 pr-10 pl-4 rounded-2xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:border-primary transition-all shadow-xs"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 w-full md:w-auto bg-muted/50 p-1 rounded-2xl border border-border/50">
            <button
              type="button"
              onClick={() => {
                setStatusTab("all");
                setPage(1);
              }}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusTab === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              الكل ({notifications.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusTab("unread");
                setPage(1);
              }}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusTab === "unread"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              غير مقروء ({unreadCount})
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusTab("read");
                setPage(1);
              }}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusTab === "read"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              المقروءة ({notifications.length - unreadCount})
            </button>
          </div>

          {/* Severity selector */}
          <div className="w-full md:w-44">
            <select
              value={selectedSeverity}
              onChange={(e) => {
                setSelectedSeverity(e.target.value);
                setPage(1);
              }}
              className="w-full h-11 px-3 rounded-2xl border border-border bg-background text-xs font-bold text-foreground focus:outline-hidden focus:border-primary transition-all shadow-xs cursor-pointer"
            >
              {SEVERITIES.map((sev) => (
                <option key={sev.id} value={sev.id}>
                  {sev.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((cat) => {
            const CatIcon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(1);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary shadow-xs"
                    : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <CatIcon className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="py-16 rounded-3xl border border-border bg-card text-center flex flex-col items-center justify-center px-4 shadow-xs">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-muted/60 text-muted-foreground mb-4">
              <Inbox className="h-8 w-8" />
            </div>
            <h3 className="text-base font-black text-foreground">لا توجد إشعارات تطابق خيارات البحث</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              يمكنك تجربة تغيير كلمات البحث أو إعادة تعيين الفلاتر لعرض باقي التنبيهات.
            </p>
            {(searchQuery || statusTab !== "all" || selectedCategory !== "all" || selectedSeverity !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusTab("all");
                  setSelectedCategory("all");
                  setSelectedSeverity("all");
                  setPage(1);
                }}
                className="mt-4 px-4 py-2 rounded-2xl bg-muted text-foreground text-xs font-bold hover:bg-muted/80 transition-all cursor-pointer"
              >
                إعادة ضبط الفلاتر
              </button>
            )}
          </div>
        ) : (
          paginatedList.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onNavigate={handleNavigate}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-xs font-bold text-muted-foreground">
            صفحة {page} من {totalPages} ({filteredNotifications.length} إشعار)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-2xl border border-border bg-card text-xs font-bold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              السابق
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-2 rounded-2xl border border-border bg-card text-xs font-bold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
