import { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarClock,
  Clock,
  ListChecks,
  UserPlus,
  TrendingUp,
  ActivitySquare,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useSecretaryDashboard } from "../../hooks/useSecretaryDashboard";
import { KpiCard } from "../../components/dashboard/KpiCard";
import { BarChartCard } from "../../components/charts/BarChartCard";
import { AreaChartCard } from "../../components/charts/AreaChartCard";
import { LineChartCard } from "../../components/charts/LineChartCard";
import { AppointmentListPanel } from "../../components/dashboard/AppointmentListPanel";
import { DoctorScheduleList } from "../../components/dashboard/DoctorScheduleList";
import { NewPatientsList } from "../../components/dashboard/NewPatientsList";
import { QuickActionsPanel } from "../../components/dashboard/QuickActionsPanel";
import { SectionHeader } from "../../components/dashboard/SectionHeader";
import { AppointmentModal } from "../../components/AppointmentModal";
import {
  buildSecretaryKpiCards,
  buildOwnerQuickActions,
} from "../../helpers/secretaryDashboard.helpers";

export default function SecretaryDashboardPage() {
  const { user } = useAuth();
  const {
    isLoading,
    stats,
    charts,
    todaysAppointments,
    waitingPatients,
    newPatients,
    recentBookings,
    doctorSchedule,
    patients,
    doctors,
    addAppointment,
  } = useSecretaryDashboard();

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const kpiCards = buildSecretaryKpiCards(stats, charts);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto" dir="rtl">
      <QuickActionsPanel
        title="إجراءات سريعة"
        actions={buildOwnerQuickActions()}
      />
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-purple-500/10 via-primary/5 to-transparent" />
        <div className="relative flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-primary text-white flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/30">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              مرحباً، {user?.full_name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              متابعة مواعيد اليوم وحجوزات المرضى بسهولة.
            </p>
          </div>
        </div>
      </motion.div>

      <section className="space-y-4">
        <SectionHeader
          title="نظرة عامة على اليوم"
          icon={ActivitySquare}
          color="purple"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map(({ key, ...cardProps }) => (
            <KpiCard key={key} {...cardProps} isLoading={isLoading} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AppointmentListPanel
            title="مواعيد اليوم"
            icon={CalendarClock}
            appointments={todaysAppointments}
            emptyMessage="لا توجد مواعيد اليوم"
          />
          <AppointmentListPanel
            title="مرضى في الانتظار"
            icon={Clock}
            appointments={waitingPatients}
            emptyMessage="لا يوجد مرضى في الانتظار حالياً"
            badgeClassName="bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/15"
          />
        </div>
      </section>

      <section className="space-y-4">
        <DoctorScheduleList doctors={doctorSchedule} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AppointmentListPanel
            title="أحدث الحجوزات"
            icon={ListChecks}
            appointments={recentBookings}
            emptyMessage="لا توجد حجوزات حديثة"
          />
          <NewPatientsList patients={newPatients} />
        </div>
      </section>

      <section className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AreaChartCard
            title="المواعيد حسب يوم الأسبوع"
            icon={CalendarClock}
            color="purple"
            isLoading={isLoading}
            data={charts.dailyAppointments}
            xKey="day"
            series={[{ key: "count", label: "المواعيد" }]}
          />
          <LineChartCard
            title="نمو المرضى الجدد شهرياً"
            icon={TrendingUp}
            color="emerald"
            isLoading={isLoading}
            data={charts.newPatientsTrend}
            xKey="month"
            series={[{ key: "count", label: "مرضى جدد" }]}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BarChartCard
            title="أوقات الانتظار حسب يوم الأسبوع"
            icon={Clock}
            color="amber"
            isLoading={isLoading}
            data={charts.waitingTime}
            xKey="day"
            series={[{ key: "count", label: "مرضى منتظرون" }]}
          />
          <BarChartCard
            title="المرضى الجدد حسب يوم الأسبوع"
            icon={UserPlus}
            color="blue"
            isLoading={isLoading}
            data={charts.weeklyPatients}
            xKey="day"
            series={[{ key: "count", label: "مرضى جدد" }]}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BarChartCard
            title="حالة المواعيد"
            icon={ListChecks}
            color="rose"
            isLoading={isLoading}
            data={charts.appointmentStatus}
            xKey="name"
            series={[{ key: "value", label: "عدد المواعيد" }]}
            colorByCategory
          />
          <BarChartCard
            title="حالة المرضى"
            icon={ListChecks}
            color="teal"
            isLoading={isLoading}
            data={charts.patientStatus}
            xKey="name"
            series={[{ key: "value", label: "عدد المرضى" }]}
            colorByCategory
          />
        </div>
      </section>

      <AppointmentModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSave={async (data) => {
          const saved = await addAppointment(data);
          setIsBookingOpen(false);
          return saved;
        }}
        appointmentToEdit={null}
        patients={patients}
        doctors={doctors}
      />
    </div>
  );
}
