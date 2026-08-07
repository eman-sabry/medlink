import {
  Clock3,
  Activity,
  TrendingUp,
  BarChart3,
  ShieldAlert,
  LayoutGrid,
} from "lucide-react";
import { useCenterPulse } from "../../hooks/useCenterPulse";
import { PulseHeader } from "../../components/pulse/PulseHeader";
import { KpiCard } from "../../components/dashboard/KpiCard";
import { DailySummaryCard } from "../../components/pulse/DailySummaryCard";
import { DoctorStatusList } from "../../components/pulse/DoctorStatusList";
import { RoomStatusGrid } from "../../components/pulse/RoomStatusGrid";
import { DeviceStatusGrid } from "../../components/pulse/DeviceStatusGrid";
import { DelayedCasesPanel } from "../../components/pulse/DelayedCasesPanel";
import { WaitingQueuePanel } from "../../components/pulse/WaitingQueuePanel";
import { SectionHeader } from "../../components/dashboard/SectionHeader";
import { SystemAlertsPanel } from "../../components/dashboard/SystemAlertsPanel";
import { LineChartCard } from "../../components/charts/LineChartCard";
import { AreaChartCard } from "../../components/charts/AreaChartCard";
import { BarChartCard } from "../../components/charts/BarChartCard";
import { buildPulseKpiCards } from "../../helpers/pulseKpi.helpers";

export default function CenterPulsePage() {
  const {
    isLoading,
    kpis,
    delayedCases,
    waitingQueue,
    doctorStatusList,
    roomStatusList,
    deviceStatusList,
    charts,
    alerts,
    centerStatus,
    dailySummary,
  } = useCenterPulse();

  const kpiCards = buildPulseKpiCards(kpis, charts);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto" dir="rtl">
      <PulseHeader centerStatus={centerStatus} />

      <section className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
          {kpiCards.map((card) => (
            <KpiCard key={card.key} {...card} isLoading={isLoading} />
          ))}
        </div>
      </section>

      <DailySummaryCard summary={dailySummary} />

      <section className="space-y-4">
        <SectionHeader eyebrow="Live" title="العمليات الحية" icon={Activity} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DelayedCasesPanel cases={delayedCases} />
          <WaitingQueuePanel queue={waitingQueue} />
        </div>
        <RoomStatusGrid rooms={roomStatusList} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DoctorStatusList doctors={doctorStatusList} />
          <DeviceStatusGrid devices={deviceStatusList} />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Today's Flow"
          title="اتجاهات اليوم بالساعة"
          icon={Clock3}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <LineChartCard
            title="المواعيد اليوم"
            subtitle="حسب الساعة"
            isLoading={isLoading}
            height={180}
            data={charts.appointmentsToday}
            xKey="hour"
            series={[{ key: "count", label: "مواعيد" }]}
          />
          <LineChartCard
            title="وصول المرضى"
            subtitle="حسب الساعة"
            isLoading={isLoading}
            height={180}
            data={charts.arrivalsToday}
            xKey="hour"
            series={[{ key: "count", label: "وصول" }]}
          />
          <LineChartCard
            title="طابور الانتظار"
            subtitle="حسب الساعة"
            isLoading={isLoading}
            height={180}
            data={charts.waitingQueueToday}
            xKey="hour"
            series={[{ key: "count", label: "منتظرون" }]}
          />
          <LineChartCard
            title="عبء عمل الأطباء"
            subtitle="حسب الساعة"
            isLoading={isLoading}
            height={180}
            data={charts.doctorWorkloadToday}
            xKey="hour"
            series={[{ key: "count", label: "جلسات نشطة" }]}
          />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Growth"
          title="النمو والاتجاهات العامة"
          icon={TrendingUp}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AreaChartCard
            title="نمو المواعيد شهرياً"
            subtitle="Appointment Growth"
            icon={TrendingUp}
            isLoading={isLoading}
            data={charts.appointmentGrowth}
            xKey="month"
            series={[{ key: "count", label: "المواعيد" }]}
          />
          <AreaChartCard
            title="نمو المرضى شهرياً"
            subtitle="Patient Growth"
            icon={TrendingUp}
            isLoading={isLoading}
            data={charts.patientGrowth}
            xKey="month"
            series={[{ key: "count", label: "مرضى جدد" }]}
          />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Insights"
          title="تحليلات إضافية"
          icon={BarChart3}
        />
        {charts.peakHour && (
          <p className="text-xs text-muted-foreground px-1">
            أكثر ساعات العمل ازدحاماً تاريخياً:{" "}
            <span className="font-black text-foreground">
              {charts.peakHour.hour}
            </span>{" "}
            بواقع {charts.peakHour.count} موعد
          </p>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BarChartCard
            title="الخدمات الأكثر طلباً"
            subtitle="Most Requested Services"
            icon={LayoutGrid}
            isLoading={isLoading}
            data={charts.topServices}
            xKey="name"
            series={[{ key: "value", label: "عدد المواعيد" }]}
          />
          <BarChartCard
            title="عبء العمل حسب الطبيب"
            subtitle="Doctor Workload"
            icon={Activity}
            isLoading={isLoading}
            data={charts.doctorWorkload}
            xKey="name"
            series={[{ key: "sessions", label: "مواعيد" }]}
          />
        </div>
        <BarChartCard
          title="حالة مواعيد اليوم"
          subtitle="Completed vs Cancelled vs NoShow"
          icon={BarChart3}
          isLoading={isLoading}
          data={charts.appointmentsByStatusToday}
          xKey="name"
          series={[{ key: "value", label: "عدد المواعيد" }]}
          colorByCategory
        />
      </section>

      <section className="space-y-4">
        <SectionHeader eyebrow="Alerts" title="التنبيهات" icon={ShieldAlert} />
        <SystemAlertsPanel alerts={alerts} />
      </section>
    </div>
  );
}
