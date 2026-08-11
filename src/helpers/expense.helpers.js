import {
  ListFilter,
  CheckCircle2,
  Clock,
  Tag,
  Wrench,
  Cpu,
  HeartPulse,
  Package,
  Zap,
  Home,
  Users,
  Sparkles,
  Truck,
  Megaphone,
  Laptop,
  BedDouble,
  Activity,
  Pencil,
  MoreHorizontal,
  Wallet,
  CalendarDays,
  CalendarClock,
  Hash,
  TrendingUp,
  ArrowUpCircle,
} from "lucide-react";
import { roundMoney, PAYMENT_METHOD_LABELS } from "../utils/billing";
import { parseDate } from "../utils/date";
import { groupSumByMonth, groupSumByDay, groupSumByField, isSameDay, computeTrend } from "../utils/dashboardStats";
import { sumBy } from "../utils/stats";
import { DATE_RANGE_FILTER_OPTIONS, buildMethodFilterOptions } from "./invoices.helpers";

export { DATE_RANGE_FILTER_OPTIONS, buildMethodFilterOptions };

export const EXPENSE_STATUS = {
  PAID: "Paid",
  PENDING: "Pending",
};

export const EXPENSE_STATUS_LABELS = {
  [EXPENSE_STATUS.PAID]: "مدفوع",
  [EXPENSE_STATUS.PENDING]: "قيد الانتظار",
};

export const EXPENSE_CATEGORIES = {
  Maintenance: "صيانة",
  Equipment: "معدات",
  MedicalSupplies: "مستلزمات طبية",
  Supplies: "مستلزمات عامة",
  Utilities: "مرافق (كهرباء ومياه)",
  Rent: "إيجار",
  Salaries: "رواتب",
  Cleaning: "نظافة",
  Transportation: "مواصلات",
  Marketing: "تسويق",
  Software: "برمجيات",
  Other: "أخرى",
};

const CATEGORY_ICONS = {
  Maintenance: Wrench,
  Equipment: Cpu,
  MedicalSupplies: HeartPulse,
  Supplies: Package,
  Utilities: Zap,
  Rent: Home,
  Salaries: Users,
  Cleaning: Sparkles,
  Transportation: Truck,
  Marketing: Megaphone,
  Software: Laptop,
  Other: MoreHorizontal,
};

export const EXPENSE_SOURCE_TYPES = {
  Manual: "يدوي",
  Maintenance: "صيانة",
  Device: "جهاز",
  Room: "غرفة",
  Equipment: "معدات",
  Supplies: "مستلزمات",
  Operational: "تشغيلي",
  Other: "أخرى",
};

const SOURCE_TYPE_ICONS = {
  Manual: Pencil,
  Maintenance: Wrench,
  Device: Cpu,
  Room: BedDouble,
  Equipment: Cpu,
  Supplies: Package,
  Operational: Activity,
  Other: MoreHorizontal,
};

export const SOURCE_TYPES_WITH_RELATED_ENTITY = ["Maintenance", "Device", "Room"];

const DATE_RANGE_DAYS = { today: 0, week: 7, month: 30 };

export function enrichExpenseList({
  expenses,
  staffList = [],
  usersList = [],
  maintenanceList = [],
  devicesList = [],
  roomsList = [],
}) {
  const staffById = new Map(staffList.map((s) => [s.id, s]));
  const usersById = new Map(usersList.map((u) => [u.id, u]));
  const maintenanceById = new Map(maintenanceList.map((m) => [m.id, m]));
  const devicesById = new Map(devicesList.map((d) => [d.id, d]));
  const roomsById = new Map(roomsList.map((r) => [r.id, r]));

  return expenses.map((exp) => {
    const description = exp.description ?? exp.name ?? "—";
    const category = exp.category ?? "Other";
    const sourceType = exp.source_type ?? "Manual";
    const status = exp.status ?? EXPENSE_STATUS.PAID;
    const amount = Number(exp.amount) || 0;

    const createdByName =
      usersById.get(exp.created_by_user_id)?.full_name ??
      staffById.get(exp.paid_by_staff_id)?.full_name ??
      "—";

    let relatedEntityName = null;
    let relatedEntityRoute = null;
    if (sourceType === "Maintenance" && exp.source_id) {
      const maintenance = maintenanceById.get(exp.source_id);
      if (maintenance) {
        const device = devicesById.get(maintenance.device_id);
        relatedEntityName = device ? `صيانة — ${device.name}` : `صيانة — ${maintenance.reason}`;
        relatedEntityRoute = "/maintenance";
      }
    } else if (sourceType === "Device" && exp.source_id) {
      const device = devicesById.get(exp.source_id);
      relatedEntityName = device?.name ?? null;
      relatedEntityRoute = device ? "/devices" : null;
    } else if (sourceType === "Room" && exp.source_id) {
      const room = roomsById.get(exp.source_id);
      relatedEntityName = room?.name ?? null;
      relatedEntityRoute = room ? "/rooms" : null;
    }

    return {
      ...exp,
      description,
      category,
      sourceType,
      status,
      amount,
      createdByName,
      sourceLabel: EXPENSE_SOURCE_TYPES[sourceType] ?? sourceType,
      categoryLabel: EXPENSE_CATEGORIES[category] ?? category,
      relatedEntityName,
      relatedEntityRoute,
    };
  });
}

export function filterExpenses(
  enrichedExpenses,
  {
    search = "",
    category = "all",
    sourceType = "all",
    status = "all",
    paymentMethod = "all",
    dateRange = "all",
    createdBy = "all",
    minAmount = "",
    maxAmount = "",
  } = {},
) {
  const query = search.trim().toLowerCase();
  const now = new Date();

  return enrichedExpenses.filter((exp) => {
    const matchesSearch =
      !query ||
      exp.id?.toLowerCase().includes(query) ||
      exp.description?.toLowerCase().includes(query) ||
      exp.categoryLabel?.toLowerCase().includes(query) ||
      exp.sourceLabel?.toLowerCase().includes(query) ||
      exp.createdByName?.toLowerCase().includes(query);

    const matchesCategory = category === "all" || exp.category === category;
    const matchesSource = sourceType === "all" || exp.sourceType === sourceType;
    const matchesStatus = status === "all" || exp.status === status;
    const matchesMethod = paymentMethod === "all" || exp.payment_method === paymentMethod;
    const matchesCreatedBy =
      createdBy === "all" ||
      exp.created_by_user_id === createdBy ||
      exp.paid_by_staff_id === createdBy;

    let matchesDate = true;
    if (dateRange !== "all") {
      const expenseDate = parseDate(exp.date);
      if (!expenseDate) matchesDate = false;
      else if (dateRange === "today") matchesDate = isSameDay(exp.date, now);
      else matchesDate = (now - expenseDate) / (1000 * 60 * 60 * 24) <= DATE_RANGE_DAYS[dateRange];
    }

    const matchesMin = minAmount === "" || exp.amount >= Number(minAmount);
    const matchesMax = maxAmount === "" || exp.amount <= Number(maxAmount);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesSource &&
      matchesStatus &&
      matchesMethod &&
      matchesCreatedBy &&
      matchesDate &&
      matchesMin &&
      matchesMax
    );
  });
}

export function buildExpenseStats(enrichedExpenses) {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const isInLastDays = (exp, days) => {
    const d = parseDate(exp.date);
    return d && (now - d) / (1000 * 60 * 60 * 24) <= days;
  };
  const isInMonth = (exp, ref) => {
    const d = parseDate(exp.date);
    return d && d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
  };

  const todayExpenses = enrichedExpenses.filter((e) => isSameDay(e.date, now));
  const yesterdayExpenses = enrichedExpenses.filter((e) => isSameDay(e.date, yesterday));
  const weekExpenses = enrichedExpenses.filter((e) => isInLastDays(e, 7));
  const monthExpenses = enrichedExpenses.filter((e) => isInMonth(e, now));
  const previousMonthExpenses = enrichedExpenses.filter((e) => isInMonth(e, previousMonthDate));

  const todayTotal = roundMoney(sumBy(todayExpenses, (e) => e.amount));
  const yesterdayTotal = roundMoney(sumBy(yesterdayExpenses, (e) => e.amount));
  const weekTotal = roundMoney(sumBy(weekExpenses, (e) => e.amount));
  const monthTotal = roundMoney(sumBy(monthExpenses, (e) => e.amount));
  const previousMonthTotal = roundMoney(sumBy(previousMonthExpenses, (e) => e.amount));
  const totalAmount = roundMoney(sumBy(enrichedExpenses, (e) => e.amount));
  const count = enrichedExpenses.length;
  const average = count > 0 ? roundMoney(totalAmount / count) : 0;
  const largest = enrichedExpenses.reduce((max, e) => (e.amount > max ? e.amount : max), 0);

  return {
    todayTotal,
    weekTotal,
    monthTotal,
    totalAmount,
    count,
    average,
    largest,
    trendVsYesterday: computeTrend(todayTotal, yesterdayTotal),
    trendVsPreviousMonth: computeTrend(monthTotal, previousMonthTotal),
  };
}

export function buildExpenseCharts(expenses) {
  return {
    expensesByCategory: groupSumByField(expenses, "category", "amount", (key) => EXPENSE_CATEGORIES[key] ?? key),
    expensesBySource: groupSumByField(expenses, "source_type", "amount", (key) => EXPENSE_SOURCE_TYPES[key] ?? key),
    expensesTrendDaily: groupSumByDay(expenses, "date", "amount", 30),
    expensesTrendMonthly: groupSumByMonth(expenses, "date", "amount"),
    maintenanceExpensesTrend: groupSumByDay(
      expenses.filter((e) => (e.source_type ?? "Manual") === "Maintenance"),
      "date",
      "amount",
      30,
    ),
  };
}

export const EXPENSE_STATUS_FILTER_OPTIONS = [
  { key: "all", label: "كل الحالات", icon: ListFilter, style: "bg-card text-foreground border-border hover:bg-muted/30" },
  {
    key: EXPENSE_STATUS.PAID,
    label: "مدفوع",
    icon: CheckCircle2,
    style: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    textClass: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: EXPENSE_STATUS.PENDING,
    label: "قيد الانتظار",
    icon: Clock,
    style: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    textClass: "text-amber-600 dark:text-amber-400",
  },
];

export function buildCategoryFilterOptions() {
  return [
    { key: "all", label: "كل التصنيفات", icon: Tag, style: "bg-card text-foreground border-border hover:bg-muted/30" },
    ...Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => ({
      key,
      label,
      icon: CATEGORY_ICONS[key] ?? Tag,
      style: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
      textClass: "text-indigo-600",
    })),
  ];
}

export function buildSourceTypeFilterOptions() {
  return [
    { key: "all", label: "كل المصادر", icon: ListFilter, style: "bg-card text-foreground border-border hover:bg-muted/30" },
    ...Object.entries(EXPENSE_SOURCE_TYPES).map(([key, label]) => ({
      key,
      label,
      icon: SOURCE_TYPE_ICONS[key] ?? Tag,
      style: "bg-purple-500/10 text-purple-600 border-purple-500/30",
      textClass: "text-purple-600",
    })),
  ];
}

export function categoryOptionsForSelect() {
  return Object.entries(EXPENSE_CATEGORIES).map(([value, label]) => ({ value, label }));
}

export function sourceTypeOptionsForSelect() {
  return Object.entries(EXPENSE_SOURCE_TYPES).map(([value, label]) => ({ value, label }));
}

export { PAYMENT_METHOD_LABELS };

function toStatTrend(trend) {
  if (!trend) return null;
  return { direction: trend.direction, label: `${trend.direction === "up" ? "+" : "-"}${trend.percent}%` };
}

export function buildExpenseStatItems(stats) {
  return [
    {
      key: "today",
      label: "مصروفات اليوم",
      value: stats.todayTotal,
      suffix: "ج.م",
      icon: CalendarClock,
      valueClassName: "text-rose-600",
      iconWrapperClassName: "bg-rose-500/10 text-rose-600",
      trend: toStatTrend(stats.trendVsYesterday),
    },
    {
      key: "week",
      label: "مصروفات الأسبوع",
      value: stats.weekTotal,
      suffix: "ج.م",
      icon: CalendarDays,
      valueClassName: "text-amber-600",
      iconWrapperClassName: "bg-amber-500/10 text-amber-600",
    },
    {
      key: "month",
      label: "مصروفات الشهر",
      value: stats.monthTotal,
      suffix: "ج.م",
      icon: CalendarDays,
      valueClassName: "text-orange-600",
      iconWrapperClassName: "bg-orange-500/10 text-orange-600",
      trend: toStatTrend(stats.trendVsPreviousMonth),
    },
    {
      key: "total",
      label: "إجمالي المصروفات",
      value: stats.totalAmount,
      suffix: "ج.م",
      icon: Wallet,
      valueClassName: "text-foreground",
      iconWrapperClassName: "bg-primary/10 text-primary",
    },
    {
      key: "count",
      label: "عدد المصروفات",
      value: stats.count,
      icon: Hash,
      iconWrapperClassName: "bg-indigo-500/10 text-indigo-600",
    },
    {
      key: "average",
      label: "متوسط قيمة المصروف",
      value: stats.average,
      suffix: "ج.م",
      icon: TrendingUp,
      iconWrapperClassName: "bg-cyan-500/10 text-cyan-600",
    },
    {
      key: "largest",
      label: "أكبر مصروف",
      value: stats.largest,
      suffix: "ج.م",
      icon: ArrowUpCircle,
      valueClassName: "text-purple-600",
      iconWrapperClassName: "bg-purple-500/10 text-purple-600",
    },
  ];
}
