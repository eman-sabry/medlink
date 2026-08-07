import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { useOwnerDashboard } from "../../hooks/useOwnerDashboard";
import { KpiCard } from "../../components/dashboard/KpiCard";
import { LineChartCard } from "../../components/charts/LineChartCard";
import { BarChartCard } from "../../components/charts/BarChartCard";
import { AreaChartCard } from "../../components/charts/AreaChartCard";
import { ComposedChartCard } from "../../components/charts/ComposedChartCard";
import { RecentActivityList } from "../../components/dashboard/RecentActivityList";
import { AppointmentListPanel } from "../../components/dashboard/AppointmentListPanel";
import { TopDoctorsList } from "../../components/dashboard/TopDoctorsList";
import { SystemAlertsPanel } from "../../components/dashboard/SystemAlertsPanel";
import { QuickActionsPanel } from "../../components/dashboard/QuickActionsPanel";
import { SectionHeader } from "../../components/dashboard/SectionHeader";
import { buildOwnerQuickActions, buildOwnerKpiCards } from "../../helpers/ownerDashboard.helpers";
import {
  TrendingUp,
  CalendarRange,
  CalendarClock,
  Cpu,
  Layers,
  BarChart3,
  ActivitySquare,
  LayoutDashboard,
} from "lucide-react";

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const { isLoading, stats, charts, recentActivities, upcomingAppointments, systemAlerts } =
    useOwnerDashboard();

  const kpiCards = buildOwnerKpiCards(stats, charts);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-primary/10 via-purple-500/5 to-transparent" />
        <div className="relative flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              مرحباً، {user?.full_name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              نظرة شاملة على أداء المركز وتحليلاته.
            </p>
          </div>
        </div>
      </motion.div>

      <section className="space-y-4">
        <SectionHeader eyebrow="Overview" title="نظرة عامة" icon={ActivitySquare} color="blue" />
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {kpiCards.map((card) => (
            <KpiCard key={card.key} {...card} isLoading={isLoading} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader eyebrow="Growth Trends" title="اتجاهات النمو" icon={TrendingUp} color="purple" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LineChartCard
            title="اتجاه الإيرادات"
            subtitle="Revenue Trend"
            icon={TrendingUp}
            color="emerald"
            isLoading={isLoading}
            data={charts.revenueTrend}
            xKey="month"
            series={[{ key: "total", label: "الإيرادات (ج.م)" }]}
          />
          <BarChartCard
            title="المواعيد الشهرية"
            subtitle="Monthly Appointments"
            icon={CalendarRange}
            color="purple"
            isLoading={isLoading}
            data={charts.appointmentsPerMonth}
            xKey="month"
            series={[{ key: "count", label: "المواعيد" }]}
          />
          <BarChartCard
            title="المرضى الجدد شهرياً"
            subtitle="Patient Growth"
            icon={TrendingUp}
            color="blue"
            isLoading={isLoading}
            data={charts.patientsPerMonth}
            xKey="month"
            series={[{ key: "count", label: "مرضى جدد" }]}
          />
          <AreaChartCard
            title="نمط المواعيد الأسبوعي"
            subtitle="Weekly Pattern"
            icon={CalendarRange}
            color="cyan"
            isLoading={isLoading}
            data={charts.weeklyStatistics}
            xKey="day"
            series={[{ key: "count", label: "المواعيد" }]}
          />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader eyebrow="Operations" title="التحليلات التشغيلية" icon={BarChart3} color="indigo" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ComposedChartCard
            title="عبء العمل حسب الطبيب"
            subtitle="Doctor Workload — جلسات وساعات عمل"
            icon={Layers}
            color="indigo"
            isLoading={isLoading}
            data={charts.doctorPerformance}
            xKey="name"
            series={[
              { key: "completed", label: "جلسات مكتملة", type: "bar" },
              { key: "hours", label: "ساعات العمل", type: "line", axis: "right" },
            ]}
          />
          <BarChartCard
            title="توزيع حالات المواعيد"
            subtitle="Completed vs Waiting vs Cancelled"
            icon={CalendarRange}
            color="rose"
            isLoading={isLoading}
            data={charts.appointmentsByStatus}
            xKey="name"
            series={[{ key: "value", label: "عدد المواعيد" }]}
            colorByCategory
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <BarChartCard
            title="حالة الأجهزة"
            subtitle="Device Availability"
            icon={Cpu}
            color="amber"
            isLoading={isLoading}
            height={220}
            data={charts.deviceStatus}
            xKey="name"
            series={[{ key: "value", label: "عدد الأجهزة" }]}
            colorByCategory
          />
          <BarChartCard
            title="حالة المرضى"
            subtitle="Active vs Inactive"
            icon={Layers}
            color="blue"
            isLoading={isLoading}
            height={220}
            data={charts.patientsByStatus}
            xKey="name"
            series={[{ key: "value", label: "عدد المرضى" }]}
            colorByCategory
          />
          <BarChartCard
            title="حالة طلبات الصيانة"
            subtitle="Maintenance Status"
            icon={Layers}
            color="red"
            isLoading={isLoading}
            height={220}
            data={charts.maintenanceStatus}
            xKey="name"
            series={[{ key: "value", label: "عدد الطلبات" }]}
            colorByCategory
          />
          <BarChartCard
            title="شعبية الخدمات"
            subtitle="Service Popularity"
            icon={Layers}
            color="teal"
            isLoading={isLoading}
            height={220}
            data={charts.servicesDistribution}
            xKey="name"
            series={[{ key: "value", label: "عدد المواعيد" }]}
          />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader eyebrow="Activity" title="النشاط والتنبيهات" icon={CalendarClock} color="orange" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RecentActivityList activities={recentActivities} />
          <AppointmentListPanel
            title="المواعيد القادمة"
            icon={CalendarClock}
            appointments={upcomingAppointments}
            emptyMessage="لا توجد مواعيد قادمة حالياً"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TopDoctorsList doctors={charts.doctorPerformance} />
          <SystemAlertsPanel alerts={systemAlerts} />
        </div>
      </section>

      <QuickActionsPanel actions={buildOwnerQuickActions()} />
    </div>
  );
}
