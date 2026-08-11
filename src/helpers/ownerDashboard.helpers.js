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
  Wallet,
  TrendingDown,
  Scale,
  Banknote,
} from "lucide-react";
import {
  trendFromMonthlySeries
} from "../utils/dashboardStats";

function getFallbackSparkline(currentValue) {
  const base = typeof currentValue === "number" ? currentValue : 10;
  return [{
      count: Math.max(0, Math.round(base * 0.7))
    },
    {
      count: Math.max(0, Math.round(base * 0.85))
    },
    {
      count: Math.max(0, Math.round(base * 0.75))
    },
    {
      count: Math.max(0, Math.round(base * 0.9))
    },
    {
      count: Math.max(0, Math.round(base * 0.95))
    },
    {
      count: base
    },
  ];
}

export function buildOwnerKpiCards(stats, charts) {
  return [{
      key: "patients",
      label: "إجمالي المرضى",
      value: stats.totalPatients,
      description: "إجمالي المرضى المسجلين بالمركز",
      icon: Users,
      color: "blue",
      trend: trendFromMonthlySeries(charts.patientsPerMonth, "count"),
      sparklineData: charts.patientsPerMonth ?.length ? charts.patientsPerMonth : getFallbackSparkline(stats.totalPatients),
      sparklineKey: "count",
    },
    {
      key: "appointments",
      label: "إجمالي المواعيد",
      value: stats.totalAppointments,
      description: "كل المواعيد المسجلة على مر الوقت",
      icon: CalendarDays,
      color: "purple",
      trend: trendFromMonthlySeries(charts.appointmentsPerMonth, "count"),
      sparklineData: charts.appointmentsPerMonth ?.length ? charts.appointmentsPerMonth : getFallbackSparkline(stats.totalAppointments),
      sparklineKey: "count",
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
      sparklineData: charts.revenueTrend ?.length ? charts.revenueTrend : getFallbackSparkline(stats.revenue),
      sparklineKey: "total",
    },
    {
      key: "revenueToday",
      label: "إيرادات اليوم",
      value: stats.revenueToday,
      suffix: "ج.م",
      description: "المدفوعات المحصّلة اليوم",
      icon: Banknote,
      color: "cyan",
      sparklineData: getFallbackSparkline(stats.revenueToday),
      sparklineKey: "count",
    },
    {
      key: "expensesToday",
      label: "مصروفات اليوم",
      value: stats.expensesToday,
      suffix: "ج.م",
      description: "المصروفات المدفوعة اليوم",
      icon: Wallet,
      color: "rose",
      sparklineData: getFallbackSparkline(stats.expensesToday),
      sparklineKey: "count",
    },
    {
      key: "expensesMonth",
      label: "مصروفات الشهر",
      value: stats.expensesMonth,
      suffix: "ج.م",
      description: "إجمالي مصروفات الشهر الحالي",
      icon: TrendingDown,
      color: "orange",
      trend: trendFromMonthlySeries(charts.expensesTrendMonthly, "total"),
      sparklineData: charts.expensesTrendMonthly ?.length ? charts.expensesTrendMonthly : getFallbackSparkline(stats.expensesMonth),
      sparklineKey: "total",
    },
    {
      key: "netProfitMonth",
      label: "صافي الربح الشهري",
      value: stats.netProfitMonth,
      suffix: "ج.م",
      description: "الإيرادات المحصّلة ناقص المصروفات الفعلية هذا الشهر",
      icon: Scale,
      color: stats.netProfitMonth >= 0 ? "green" : "red",
      sparklineData: getFallbackSparkline(stats.netProfitMonth),
      sparklineKey: "count",
    },
    {
      key: "activeSessions",
      label: "جلسات نشطة الآن",
      value: stats.activeSessions,
      description: "جلسات علاجية جارية حالياً",
      icon: Activity,
      color: "cyan",
      sparklineData: getFallbackSparkline(stats.activeSessions),
      sparklineKey: "count",
    },
    {
      key: "doctors",
      label: "إجمالي الأطباء",
      value: stats.totalDoctors,
      description: "من إجمالي الفريق الطبي",
      icon: Stethoscope,
      color: "indigo",
      sparklineData: getFallbackSparkline(stats.totalDoctors),
      sparklineKey: "count",
    },
    {
      key: "staff",
      label: "إجمالي الفريق",
      value: stats.totalStaff,
      description: "جميع الموظفين والأطباء",
      icon: UserCog,
      color: "teal",
      sparklineData: getFallbackSparkline(stats.totalStaff),
      sparklineKey: "count",
    },
    {
      key: "devices",
      label: "الأجهزة العاملة",
      value: `${stats.devicesWorking}/${stats.devicesTotal}`,
      description: "من إجمالي أجهزة المركز",
      icon: Cpu,
      color: "amber",
      sparklineData: getFallbackSparkline(stats.devicesWorking),
      sparklineKey: "count",
    },
    {
      key: "maintenance",
      label: "طلبات صيانة معلّقة",
      value: stats.maintenancePending,
      description: "بحاجة متابعة فنية",
      icon: Wrench,
      color: "red",
      sparklineData: getFallbackSparkline(stats.maintenancePending),
      sparklineKey: "count",
    },
    {
      key: "occupancy",
      label: "معدل إشغال الغرف",
      value: stats.roomOccupancyRate,
      suffix: "%",
      description: "من إجمالي غرف المركز",
      icon: BedDouble,
      color: "pink",
      sparklineData: getFallbackSparkline(stats.roomOccupancyRate),
      sparklineKey: "count",
    },
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
      label: "إدارة الباقات",
      icon: Package,
      to: "/packages",
      color: "emerald"
    },
    {
      label: "تسجيل جهاز",
      icon: Cpu,
      to: "/devices",
      color: "amber"
    },
  ];
}