import { useDoctorSessions } from "../hooks/useDoctorSessions";
import DoctorSessionCard from "../components/DoctorSessionCard";
import { SearchBar } from "../components/ui/SearchBar";
import { TabToggleGroup } from "../components/ui/TabToggleGroup";
import { StatsGrid } from "../components/ui/StatCard";
import { LoadingState } from "../components/ui/LoadingState";
import { ErrorState } from "../components/ui/ErrorState";
import { EmptyState } from "../components/ui/EmptyState";
import { Stethoscope, Clock, Activity, CheckCircle2, Layers } from "lucide-react";

const SESSION_STATUS_TABS = [
  { key: "Waiting", label: "في الانتظار", icon: Clock },
  { key: "In-Progress", label: "قيد الجلسة", icon: Activity },
  { key: "Completed", label: "الجلسات المنتهية", icon: CheckCircle2 },
  { key: "all", label: "عرض الكل", icon: Layers },
];

export default function DoctorSessionsPage() {
  const {
    appointments,
    stats,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    handleStartSession,
    handleCompleteSession,
    startingAppointmentId,
    completingAppointmentId,
    isLoading,
    isError,
    refetch,
  } = useDoctorSessions();

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 w-full max-w-7xl mx-auto">
        <LoadingState message="جاري تحميل الجلسات..." rounded="rounded-3xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 md:p-8 w-full max-w-7xl mx-auto">
        <ErrorState message="تعذّر تحميل الجلسات. تأكد من تشغيل JSON Server." onRetry={refetch} />
      </div>
    );
  }

  const statsItems = [
    {
      key: "waiting",
      label: "بانتظار البدء",
      value: stats.waiting,
      icon: Clock,
      iconWrapperClassName: "bg-amber-500/15 text-amber-600",
      gradient: "from-amber-500/[0.07] via-transparent to-transparent",
      active: activeTab === "Waiting",
      onClick: () => setActiveTab("Waiting"),
    },
    {
      key: "inProgress",
      label: "قيد الجلسة الآن",
      value: stats.inProgress,
      icon: Activity,
      iconWrapperClassName: "bg-cyan-500/15 text-cyan-600",
      gradient: "from-cyan-500/[0.07] via-transparent to-transparent",
      active: activeTab === "In-Progress",
      onClick: () => setActiveTab("In-Progress"),
    },
    {
      key: "completed",
      label: "مكتملة",
      value: stats.completed,
      icon: CheckCircle2,
      iconWrapperClassName: "bg-emerald-500/15 text-emerald-600",
      gradient: "from-emerald-500/[0.07] via-transparent to-transparent",
      active: activeTab === "Completed",
      onClick: () => setActiveTab("Completed"),
    },
    {
      key: "total",
      label: "إجمالي الجلسات اليوم",
      value: stats.total,
      icon: Layers,
      iconWrapperClassName: "bg-primary/15 text-primary",
      active: activeTab === "all",
      onClick: () => setActiveTab("all"),
    },
  ];

  return (
    <div className="space-y-6 p-6 md:p-8 w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Stethoscope className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-foreground mt-2">جلسات الأطباء</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            إدارة ومتابعة الجلسات العلاجية والمواعيد النشطة بكفاءة عالية
          </p>
        </div>
      </div>

      <StatsGrid items={statsItems} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="بحث باسم المريض، رقم الملف، أو الهاتف..."
          className="md:w-80"
        />
        <TabToggleGroup tabs={SESSION_STATUS_TABS} value={activeTab} onChange={setActiveTab} />
      </div>

      {appointments.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {appointments.map((appointment) => (
            <DoctorSessionCard
              key={appointment.id}
              appointment={appointment}
              onStart={handleStartSession}
              onComplete={handleCompleteSession}
              isStarting={startingAppointmentId === appointment.id}
              isCompleting={completingAppointmentId === appointment.id}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          message="لا توجد جلسات مطابقة للتبويب أو البحث المحدد."
          rounded="rounded-3xl"
          className="p-16 space-y-3"
        />
      )}
    </div>
  );
}
