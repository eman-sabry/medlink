import {
  Users,
  Stethoscope,
  UserCog,
  CalendarDays,
  DollarSign,
  Cpu,
  Wrench,
  Activity,
  BedDouble,
  Plus,
  UserPlus,
  Package,
} from "lucide-react";
import { trendFromMonthlySeries } from "../utils/dashboardStats";

// بطاقات مؤشرات الأداء الرئيسية للوحة المالك. المخطط المصغر والاتجاه يُفعّلان فقط للمؤشرات
// المدعومة فعلياً بسلسلة زمنية حقيقية (شهرية)، وليس بشكل تعسفي لكل بطاقة
export function buildOwnerKpiCards(stats, charts) {
  return [
    {
      key: "patients",
      label: "إجمالي المرضى",
      value: stats.totalPatients,
      description: "إجمالي المرضى المسجلين بالمركز",
      icon: Users,
      color: "blue",
      trend: trendFromMonthlySeries(charts.patientsPerMonth, "count"),
      sparklineData: charts.patientsPerMonth,
    },
    {
      key: "appointments",
      label: "إجمالي المواعيد",
      value: stats.totalAppointments,
      description: "كل المواعيد المسجلة على مر الوقت",
      icon: CalendarDays,
      color: "purple",
      trend: trendFromMonthlySeries(charts.appointmentsPerMonth, "count"),
      sparklineData: charts.appointmentsPerMonth,
    },
    {
      key: "revenue",
      label: "إجمالي الإيرادات",
      value: stats.revenue,
      suffix: "ج.م",
      description: "إجمالي المدفوعات المحصّلة",
      icon: DollarSign,
      color: "emerald",
      trend: trendFromMonthlySeries(charts.revenueTrend, "total"),
      sparklineData: charts.revenueTrend,
      sparklineKey: "total",
    },
    {
      key: "activeSessions",
      label: "جلسات نشطة الآن",
      value: stats.activeSessions,
      description: "جلسات علاجية جارية حالياً",
      icon: Activity,
      color: "cyan",
    },
    {
      key: "doctors",
      label: "إجمالي الأطباء",
      value: stats.totalDoctors,
      description: "من إجمالي الفريق الطبي",
      icon: Stethoscope,
      color: "indigo",
    },
    {
      key: "staff",
      label: "إجمالي الفريق",
      value: stats.totalStaff,
      description: "جميع الموظفين والأطباء",
      icon: UserCog,
      color: "teal",
    },
    {
      key: "devices",
      label: "الأجهزة العاملة",
      value: `${stats.devicesWorking}/${stats.devicesTotal}`,
      description: "من إجمالي أجهزة المركز",
      icon: Cpu,
      color: "amber",
    },
    {
      key: "maintenance",
      label: "طلبات صيانة معلّقة",
      value: stats.maintenancePending,
      description: "بحاجة متابعة فنية",
      icon: Wrench,
      color: "red",
    },
    {
      key: "occupancy",
      label: "معدل إشغال الغرف",
      value: stats.roomOccupancyRate,
      suffix: "%",
      description: "من إجمالي غرف المركز",
      icon: BedDouble,
      color: "pink",
    },
  ];
}

export function buildOwnerQuickActions() {
  return [
    { label: "إضافة مريض", icon: UserPlus, to: "/patients", color: "blue" },
    { label: "حجز موعد", icon: Plus, to: "/appointments", color: "purple" },
    { label: "إدارة الباقات", icon: Package, to: "/packages", color: "emerald" },
    { label: "تسجيل جهاز", icon: Cpu, to: "/devices", color: "amber" },
  ];
}
