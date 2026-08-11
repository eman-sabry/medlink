import {
  Users,
  CalendarCheck,
  DollarSign,
  Percent,
  CheckCircle2,
  Clock,
  AlarmClockOff,
  Stethoscope,
  Wrench,
  TrendingUp,
  Wallet,
  Scale,
} from "lucide-react";
import { TONE } from "../constants/semanticTone";

export function buildPulseKpiCards(kpis, charts) {
  return [
    {
      key: "patientsToday",
      label: "المرضى اليوم",
      value: kpis.patientsToday,
      description: "مرضى فريدون تمت رؤيتهم اليوم",
      icon: Users,
      color: TONE.info,
      trend: kpis.trends.patientsToday,
      sparklineData: charts.arrivalsToday,
    },
    {
      key: "appointmentsToday",
      label: "مواعيد اليوم",
      value: kpis.appointmentsToday,
      description: "إجمالي المواعيد المجدولة اليوم",
      icon: CalendarCheck,
      color: TONE.info,
      trend: kpis.trends.appointmentsToday,
      sparklineData: charts.appointmentsToday,
    },
    {
      key: "revenueToday",
      label: "إيرادات اليوم",
      value: kpis.revenueToday,
      suffix: "ج.م",
      description: "إجمالي المدفوعات المحصّلة اليوم",
      icon: DollarSign,
      color: TONE.success,
      trend: kpis.trends.revenueToday,
    },
    {
      key: "expensesToday",
      label: "مصروفات اليوم",
      value: kpis.expensesToday,
      suffix: "ج.م",
      description: "المصروفات الفعلية المدفوعة اليوم",
      icon: Wallet,
      color: TONE.critical,
      trend: kpis.trends.expensesToday,
    },
    {
      key: "netProfitToday",
      label: "صافي الربح اليوم",
      value: kpis.netProfitToday,
      suffix: "ج.م",
      description: "إيرادات اليوم ناقص مصروفات اليوم",
      icon: Scale,
      color: kpis.netProfitToday >= 0 ? TONE.success : TONE.critical,
    },
    {
      key: "completionRate",
      label: "نسبة الإنجاز اليوم",
      value: kpis.completionRateToday,
      suffix: "%",
      description: `${kpis.completedToday} مكتمل من ${kpis.appointmentsToday}`,
      icon: Percent,
      color: TONE.success,
      trend: kpis.trends.completedToday,
    },
  ];
}

export function buildPulseInsights(kpis, charts) {
  const insights = [
    {
      id: "completion",
      icon: CheckCircle2,
      tone: "success",
      text: `${kpis.completedToday} من ${kpis.appointmentsToday} موعد مكتمل اليوم (${kpis.completionRateToday}%)`,
    },
  ];

  if (kpis.waitingNow > 0) {
    insights.push({
      id: "waiting",
      icon: Clock,
      tone: "attention",
      text: `${kpis.waitingNow} مريض بالانتظار الآن، متوسط الانتظار ${kpis.avgWaitingMinutes} دقيقة`,
    });
  }

  if (kpis.delayedCount > 0) {
    insights.push({
      id: "delayed",
      icon: AlarmClockOff,
      tone: "critical",
      text: `${kpis.delayedCount} موعد متأخر عن وقته المحدد`,
    });
  }

  insights.push({
    id: "doctors",
    icon: Stethoscope,
    tone: kpis.availableDoctors === 0 ? "critical" : "info",
    text: `${kpis.availableDoctors} من ${kpis.totalDoctors} طبيب متاح الآن`,
  });

  if (kpis.devicesNeedingMaintenance > 0) {
    insights.push({
      id: "devices",
      icon: Wrench,
      tone: "attention",
      text: `${kpis.devicesNeedingMaintenance} جهاز بحاجة صيانة`,
    });
  }

  if (charts.peakHour) {
    insights.push({
      id: "peak",
      icon: TrendingUp,
      tone: "analytics",
      text: `أكثر الساعات ازدحاماً تاريخياً: ${charts.peakHour.hour} بواقع ${charts.peakHour.count} موعد`,
    });
  }

  return insights;
}

export function buildPatientFlowSeries(charts) {
  return charts.appointmentsToday.map((item, index) => ({
    hour: item.hour,
    appointments: item.count,
    arrivals: charts.arrivalsToday[index]?.count ?? 0,
    waiting: charts.waitingQueueToday[index]?.count ?? 0,
  }));
}
