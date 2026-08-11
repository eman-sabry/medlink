import {
  Clock,
  Activity,
  AlarmClockOff,
  BarChart3,
  ShieldAlert,
} from "lucide-react";
import { useCenterPulse } from "../../hooks/useCenterPulse";
import { PulseHeader } from "../../components/pulse/PulseHeader";
import { KpiCard } from "../../components/dashboard/KpiCard";
import { LiveStatTile } from "../../components/dashboard/primitives/LiveStatTile";
import { InsightBanner } from "../../components/dashboard/primitives/InsightBanner";
import { AlertStack } from "../../components/dashboard/primitives/AlertStack";
import { DoctorStatusCompact } from "../../components/pulse/DoctorStatusCompact";
import { RoomStatusGrid } from "../../components/pulse/RoomStatusGrid";
import { DeviceStatusGrid } from "../../components/pulse/DeviceStatusGrid";
import { WaitingQueuePanel } from "../../components/pulse/WaitingQueuePanel";
import { SectionHeader } from "../../components/dashboard/SectionHeader";
import { ComposedChartCard } from "../../components/charts/ComposedChartCard";
import { BarChartCard } from "../../components/charts/BarChartCard";
import {
  buildPulseKpiCards,
  buildPulseInsights,
  buildPatientFlowSeries,
} from "../../helpers/pulseKpi.helpers";
import { MissedPatientsPanel } from "../../components/pulse/MissedPatientsPanel";

export default function CenterPulsePage() {
  const {
    isLoading,
    kpis,
    waitingQueue,
    doctorStatusList,
    roomStatusList,
    missedPatientsList,
    deviceStatusList,
    charts,
    alerts,
    centerStatus,
  } = useCenterPulse();

  const kpiCards = buildPulseKpiCards(kpis, charts);
  const insights = buildPulseInsights(kpis, charts);
  const patientFlowData = buildPatientFlowSeries(charts);

  const systemAlertItems = alerts.map((a) => ({
    id: a.id,
    title: a.message,
    severity: a.level === "error" ? "critical" : "warning",
  }));

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto" dir="rtl">
      <PulseHeader centerStatus={centerStatus} />

      <section className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <LiveStatTile
            label="في الانتظار الآن"
            value={kpis.waitingNow}
            description={`متوسط الانتظار ${kpis.avgWaitingMinutes} دقيقة`}
            icon={Clock}
            tone="attention"
            isLoading={isLoading}
          />
          <LiveStatTile
            label="جلسات نشطة الآن"
            value={kpis.activeSessionsNow}
            description="مرضى داخل جلسات علاجية حالياً"
            icon={Activity}
            tone="cyan"
            isLoading={isLoading}
          />
          <LiveStatTile
            label="حالات متأخرة"
            value={kpis.delayedCount}
            description={
              kpis._longWaitCount > 0
                ? `${kpis._longWaitCount} منها تجاوز ٣٠ دقيقة`
                : "لا توجد حالات تأخير طويل"
            }
            icon={AlarmClockOff}
            tone="critical"
            isLoading={isLoading}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map(({ key, ...cardProps }) => (
            <KpiCard key={key} {...cardProps} isLoading={isLoading} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <AlertStack
          items={systemAlertItems}
          title="تنبيهات النظام"
          icon={ShieldAlert}
        />
      </section>

      <InsightBanner insights={insights} />

      <section className="space-y-4">
        <SectionHeader eyebrow="Live" title="العمليات الحية" icon={Activity} />
        <WaitingQueuePanel queue={waitingQueue} />
        <MissedPatientsPanel patients={missedPatientsList} />
        <DoctorStatusCompact doctors={doctorStatusList} />
      </section>

      <section className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ComposedChartCard
            title="تدفق المرضى اليوم"
            subtitle="مواعيد · وصول · انتظار — حسب الساعة"
            color="info"
            isLoading={isLoading}
            data={patientFlowData}
            xKey="hour"
            series={[
              { key: "appointments", label: "مواعيد", type: "line" },
              { key: "arrivals", label: "وصول", type: "line" },
              { key: "waiting", label: "انتظار", type: "line" },
            ]}
          />
          <BarChartCard
            title="حالة مواعيد اليوم"
            subtitle=""
            icon={BarChart3}
            isLoading={isLoading}
            data={charts.appointmentsByStatusToday}
            xKey="name"
            series={[{ key: "value", label: "عدد المواعيد" }]}
            colorByCategory
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RoomStatusGrid rooms={roomStatusList} />
          <DeviceStatusGrid devices={deviceStatusList} />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Insights"
          title="تحليلات إضافية"
          icon={BarChart3}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BarChartCard
            title="الخدمات الأكثر طلباً"
            color="analytics"
            isLoading={isLoading}
            data={charts.topServices}
            xKey="name"
            series={[{ key: "value", label: "عدد المواعيد" }]}
          />
          <BarChartCard
            title="عبء العمل حسب الطبيب"
            color="analytics"
            isLoading={isLoading}
            data={charts.doctorWorkload}
            xKey="name"
            series={[{ key: "sessions", label: "مواعيد" }]}
          />
        </div>
      </section>
    </div>
  );
}
