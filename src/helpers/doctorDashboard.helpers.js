import { CalendarClock, CheckCircle2, Clock, Activity } from "lucide-react";

export function buildDoctorKpiCards(stats, charts) {
  return [
    {
      key: "today",
      label: "مرضى اليوم",
      value: stats.todaysCount,
      description: "المرضى المجدولون اليوم",
      icon: CalendarClock,
      color: "purple",
      sparklineData: charts.dailyPatients,
    },
    {
      key: "active",
      label: "جلسة نشطة الآن",
      value: stats.hasActiveSession ? "نعم" : "لا",
      description: stats.hasActiveSession ? "لديك جلسة جارية الآن" : "لا توجد جلسة جارية",
      icon: Activity,
      color: "cyan",
    },
    {
      key: "upcoming",
      label: "جلسات قادمة",
      value: stats.upcomingCount,
      description: "بانتظار الحجز أو الوصول",
      icon: Clock,
      color: "amber",
    },
    {
      key: "completed",
      label: "جلسات مكتملة",
      value: stats.completedCount,
      description: "جلسات أُنجزت بنجاح",
      icon: CheckCircle2,
      color: "emerald",
      sparklineData: charts.completedSessions,
    },
  ];
}
