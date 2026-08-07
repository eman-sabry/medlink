import { useDoctorSessions } from "../hooks/useDoctorSessions";
import DoctorSessionCard from "../components/DoctorSessionCard";
import { SearchBar } from "../components/ui/SearchBar";
import { TabToggleGroup } from "../components/ui/TabToggleGroup";
import {
  CalendarX,
  Loader2,
  Stethoscope,
  Activity,
  CheckCircle2,
  Layers,
} from "lucide-react";

const SESSION_STATUS_TABS = [
  { key: "In-Progress", label: "قيد الجلسة", icon: Activity },
  { key: "Completed", label: "الجلسات المنتهية", icon: CheckCircle2 },
  { key: "all", label: "عرض الكل", icon: Layers },
];

export default function DoctorSessionsPage() {
  const {
    appointments,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    timers,
    formatTimer,
    handleStartSession,
    handlePauseSession,
    handleCompleteSession,
    isLoading,
  } = useDoctorSessions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8 w-full max-w-7xl mx-auto">
      {/* ترويسة الصفحة مع أيقونة معبرة */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Stethoscope className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-foreground mt-2">
            جلسات الأطباء
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            إدارة ومتابعة الجلسات العلاجية والمواعيد النشطة بكفاءة عالية
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 ">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="بحث باسم المريض أو رقم الملف..."
          className="md:w-80"
        />
        <TabToggleGroup
          tabs={SESSION_STATUS_TABS}
          value={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* قائمة الكروت */}
      {appointments.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {appointments.map((appointment) => (
            <DoctorSessionCard
              key={appointment.id}
              appointment={appointment}
              timerState={timers[appointment.id]}
              formatTimer={formatTimer}
              onStart={handleStartSession}
              onPause={handlePauseSession}
              onComplete={handleCompleteSession}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 bg-card border border-border rounded-3xl text-center space-y-3 shadow-sm">
          <div className="h-14 w-14 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
            <CalendarX className="h-7 w-7" />
          </div>
          <p className="text-sm font-bold text-foreground">
            لا توجد جلسات مطابقة للتبويب أو البحث المحدد.
          </p>
          <p className="text-xs text-muted-foreground">
            جرب تغيير كلمات البحث أو الانتقال إلى تبويب آخر.
          </p>
        </div>
      )}
    </div>
  );
}
