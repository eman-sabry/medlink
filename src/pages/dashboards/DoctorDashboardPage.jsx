import { motion } from "framer-motion";
import {
  CalendarClock,
  ClipboardList,
  Stethoscope,
  ActivitySquare,
  TrendingUp,
  BarChart3,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useDoctorDashboard } from "../../hooks/useDoctorDashboard";
import { usePatients } from "../../hooks/usePatients";
import { KpiCard } from "../../components/dashboard/KpiCard";
import { BarChartCard } from "../../components/charts/BarChartCard";
import { AreaChartCard } from "../../components/charts/AreaChartCard";
import { LineChartCard } from "../../components/charts/LineChartCard";
import { AppointmentListPanel } from "../../components/dashboard/AppointmentListPanel";
import { PatientHistoryPanel } from "../../components/dashboard/PatientHistoryPanel";
import { PatientSearchWidget } from "../../components/dashboard/PatientSearchWidget";
import { SectionHeader } from "../../components/dashboard/SectionHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import DoctorSessionCard from "../../components/DoctorSessionCard";
import { buildDoctorKpiCards } from "../../helpers/doctorDashboard.helpers";

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const {
    isLoading,
    stats,
    charts,
    todaysPatients,
    currentSession,
    upcomingSessions,
    timers,
    formatTimer,
    handleStartSession,
    handlePauseSession,
    handleCompleteSession,
    myTreatmentSessions,
  } = useDoctorDashboard();
  const { patients } = usePatients();
  const kpiCards = buildDoctorKpiCards(stats, charts);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-cyan-500/10 via-primary/5 to-transparent" />
        <div className="relative flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-primary text-white flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/30">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              مرحباً، {user?.full_name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              جدول جلساتك ومرضاك لهذا اليوم.
            </p>
          </div>
        </div>
      </motion.div>

      <section className="space-y-4">
        <SectionHeader eyebrow="Today" title="نظرة عامة على اليوم" icon={ActivitySquare} color="cyan" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card) => (
            <KpiCard key={card.key} {...card} isLoading={isLoading} />
          ))}
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Stethoscope className="h-4 w-4" />
            </div>
            <h3 className="font-black text-foreground text-sm">الجلسة الحالية</h3>
          </div>
          {currentSession ? (
            <DoctorSessionCard
              appointment={currentSession}
              timerState={timers[currentSession.id]}
              formatTimer={formatTimer}
              onStart={handleStartSession}
              onPause={handlePauseSession}
              onComplete={handleCompleteSession}
            />
          ) : (
            <EmptyState message="لا توجد جلسة نشطة حالياً" rounded="rounded-2xl" />
          )}
        </div>

        <div className="space-y-3">
          <h3 className="font-black text-foreground text-sm px-1">مرضى اليوم</h3>
          {todaysPatients.length === 0 ? (
            <EmptyState message="لا يوجد مرضى مجدولون اليوم" />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {todaysPatients.map((appointment) => (
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
          )}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader eyebrow="Trends" title="اتجاهات العمل" icon={TrendingUp} color="purple" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AreaChartCard
            title="المرضى حسب يوم الأسبوع"
            subtitle="Daily Patients"
            icon={CalendarClock}
            color="purple"
            isLoading={isLoading}
            data={charts.dailyPatients}
            xKey="day"
            series={[{ key: "count", label: "مرضى" }]}
          />
          <LineChartCard
            title="ساعات العمل الفعلية"
            subtitle="Working Hours"
            icon={ClipboardList}
            color="indigo"
            isLoading={isLoading}
            data={charts.workingHours}
            xKey="day"
            series={[{ key: "hours", label: "ساعات" }]}
          />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader eyebrow="Analytics" title="التحليلات الطبية" icon={BarChart3} color="emerald" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BarChartCard
            title="الجلسات المكتملة"
            subtitle="Completed Sessions"
            icon={ClipboardList}
            color="emerald"
            isLoading={isLoading}
            data={charts.completedSessions}
            xKey="day"
            series={[{ key: "count", label: "جلسات مكتملة" }]}
          />
          <BarChartCard
            title="إحصائيات التشخيص"
            subtitle="Diagnosis Statistics"
            icon={ClipboardList}
            color="rose"
            isLoading={isLoading}
            data={charts.diagnosisStatistics}
            xKey="name"
            series={[{ key: "value", label: "عدد الحالات" }]}
            colorByCategory
          />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader eyebrow="Patients" title="المرضى والسجلات" icon={CalendarClock} color="teal" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AppointmentListPanel
            title="الجلسات القادمة"
            icon={CalendarClock}
            appointments={upcomingSessions}
            emptyMessage="لا توجد جلسات قادمة"
          />
          <PatientHistoryPanel sessions={myTreatmentSessions} />
        </div>
        <PatientSearchWidget patients={patients} />
      </section>
    </div>
  );
}
