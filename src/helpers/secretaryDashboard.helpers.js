import {
  CalendarClock,
  Clock,
  Users,
  Stethoscope,
  Plus,
  UserPlus,
FileText
} from "lucide-react";
import { trendFromMonthlySeries } from "../utils/dashboardStats";

export function buildSecretaryKpiCards(stats, charts) {
  return [
    {
      key: "today",
      label: "مواعيد اليوم",
      value: stats.todaysCount,
      description: "إجمالي مواعيد اليوم الحالي",
      icon: CalendarClock,
      color: "purple",
      sparklineData: charts.dailyAppointments,
    },
    {
      key: "waiting",
      label: "في الانتظار",
      value: stats.waitingCount,
      description: "مرضى ينتظرون حالياً",
      icon: Clock,
      color: "amber",
    },
    {
      key: "patients",
      label: "إجمالي المرضى",
      value: stats.totalPatients,
      description: "كل المرضى المسجلين بالمركز",
      icon: Users,
      color: "emerald",
      trend: trendFromMonthlySeries(charts.newPatientsTrend, "count"),
      sparklineData: charts.newPatientsTrend,
    },
    {
      key: "doctors",
      label: "الأطباء المتاحون",
      value: stats.totalDoctors,
      description: "أطباء جاهزون لاستقبال الحجوزات",
      icon: Stethoscope,
      color: "indigo",
    },
  ];
}

export function buildSecretaryQuickActions({ onQuickBooking }) {
  return [
    { label: "حجز موعد جديد", icon: Plus, onClick: onQuickBooking, color: "purple" },
    { label: "إضافة مريض", icon: UserPlus, to: "/patients", color: "blue" },
  ];
}
export function buildOwnerQuickActions() {
  return [{
      label: "إضافة مريض",
      icon: UserPlus,
      to: "/patients",
      color: "blue"
    },
    {
      label: "حجز موعد",
      icon: Plus,
      to: "/appointments",
      color: "purple"
    },
    {
      label: "إنشاء فاتورة",
      icon: FileText,
      to: "/invoices",
      color: "rose",
    },
  ];
}