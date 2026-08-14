import { useState, useMemo } from "react";
import { LiveEventItem } from "./LiveEventItem";
import { CheckCheck, Inbox, Search, X } from "lucide-react";

export function LiveEventList({
  activeSessions = [],
  waitingPatients = [],
  appointmentsNow = [],
  delayedAppointments = [],
  completedSessions = [],
  doctorStatuses = [],
  roomStatuses = [],
  allEvents = [],
  selectedTab = "all",
  onSelectTab,
  onAcknowledge,
  onAcknowledgeAll,
  newCount = 0,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = useMemo(() => {
    let list;

    switch (selectedTab) {
      case "session":
        list = [...activeSessions];
        break;
      case "waiting":
        list = [...waitingPatients];
        break;
      case "now":
        list = [...appointmentsNow];
        break;
      case "delayed":
        list = [...delayedAppointments];
        break;
      case "completed":
        list = [...completedSessions];
        break;
      case "resources":
        list = [...doctorStatuses, ...roomStatuses];
        break;
      case "all":
      default:
        list = [...allEvents];
        break;
    }

    if (!searchQuery.trim()) return list;

    const query = searchQuery.trim().toLowerCase();
    return list.filter((ev) => {
      const patient = ev.patientName?.toLowerCase() || "";
      const doctor = ev.doctorName?.toLowerCase() || "";
      const room = ev.roomName?.toLowerCase() || "";
      const title = ev.title?.toLowerCase() || "";
      return (
        patient.includes(query) ||
        doctor.includes(query) ||
        room.includes(query) ||
        title.includes(query)
      );
    });
  }, [
    selectedTab,
    activeSessions,
    waitingPatients,
    appointmentsNow,
    delayedAppointments,
    completedSessions,
    doctorStatuses,
    roomStatuses,
    allEvents,
    searchQuery,
  ]);

  const tabs = [
    { id: "all", label: "الكل", count: allEvents.length },
    { id: "session", label: "الجلسات", count: activeSessions.length },
    { id: "waiting", label: "الانتظار", count: waitingPatients.length },
    { id: "now", label: "الآن", count: appointmentsNow.length },
    { id: "delayed", label: "متأخر", count: delayedAppointments.length },
    { id: "resources", label: "الأطباء والغرف", count: doctorStatuses.length + roomStatuses.length },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background/95 text-right select-none" dir="rtl">
      {/* Category Tabs & Quick Action Bar */}
      <div className="p-2 border-b border-border/40 bg-muted/20 space-y-2 shrink-0">
        {/* Search input & Acknowledge All */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث مريض، طبيب، غرفة..."
              className="w-full pl-7 pr-8 py-1 text-xs rounded-lg border border-border/60 bg-card focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {newCount > 0 && (
            <button
              type="button"
              onClick={onAcknowledgeAll}
              title="تحديد الكل كمقروء"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold border border-primary/20 transition-colors shrink-0 cursor-pointer"
            >
              <CheckCheck className="h-3 w-3" />
              <span className="hidden sm:inline">مسح الجديد</span>
            </button>
          )}
        </div>

        {/* Scrollable Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-xs"
                    : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-1 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar min-h-0">
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-2">
              <Inbox className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-foreground">لا توجد عمليات حالية</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px]">
              الوضع مستقر ولا توجد أحداث ضمن هذا التصنيف حالياً
            </p>
          </div>
        ) : (
          filteredEvents.map((ev) => (
            <LiveEventItem
              key={ev.id}
              event={ev}
              onAcknowledge={onAcknowledge}
            />
          ))
        )}
      </div>
    </div>
  );
}
