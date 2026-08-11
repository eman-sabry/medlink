import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wallet,
  Receipt,
  TrendingUp,
  BanknoteArrowUp,
  FileWarning,
} from "lucide-react";
import {
  computeNetPaid,
  computeRemainingBalance,
  computePaymentStatus,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "../utils/billing";
import { colorForStatus } from "../components/charts/chartColors";
import {
  groupSumByMonth,
  groupSumByDay,
  groupSumByField,
  isSameDay,
} from "../utils/dashboardStats";

function toValidDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

export function enrichInvoiceList({ invoices, patients, appointments, staffList, invoiceItems, payments, paymentRefunds }) {
  const patientsById = new Map(patients.map((p) => [p.id, p]));
  const appointmentsById = new Map(appointments.map((a) => [a.id, a]));
  const staffById = new Map(staffList.map((s) => [s.id, s]));

  return invoices.map((invoice) => {
    const patient = patientsById.get(invoice.patient_id);
    const relatedAppointment = appointmentsById.get(invoice.appointment_id);
    const doctorId = invoice.doctor_id ?? relatedAppointment?.doctor_id ?? null;
    const doctorName = staffById.get(doctorId)?.full_name ?? relatedAppointment?.doctor_name ?? null;

    const items = invoiceItems.filter((it) => it.invoice_id === invoice.id);
    const invoicePayments = payments.filter((p) => p.invoice_id === invoice.id);
    const netPaid = computeNetPaid(invoicePayments, paymentRefunds);
    const balanceDue = computeRemainingBalance(invoice.total_amount ?? 0, netPaid);
    const computedStatus = computePaymentStatus({ total: invoice.total_amount ?? 0, netPaid });

    const lastPayment = [...invoicePayments].sort(
      (a, b) => new Date(b.paid_at ?? 0) - new Date(a.paid_at ?? 0),
    )[0];

    return {
      ...invoice,
      patientName: patient?.full_name ?? "مريض غير معروف",
      patientFileNo: patient?.file_no ?? "—",
      patientPhone: patient?.phone ?? "",
      doctorId,
      doctorName: doctorName ?? "—",
      itemsCount: items.length,
      servicesSummary: items.map((it) => it.description).join("، ") || "—",
      netPaid,
      balanceDue,
      computedStatus,
      lastPaymentMethod: lastPayment?.method ?? null,
    };
  });
}

const DATE_RANGE_DAYS = { today: 0, week: 7, month: 30 };

export function filterInvoices(enrichedInvoices, { search = "", status = "all", dateRange = "all", method = "all", doctorId = "all" } = {}) {
  const query = search.trim().toLowerCase();
  const now = new Date();

  return enrichedInvoices.filter((inv) => {
    const matchesSearch =
      !query ||
      inv.invoice_no?.toLowerCase().includes(query) ||
      inv.patientName?.toLowerCase().includes(query) ||
      inv.patientFileNo?.toLowerCase().includes(query) ||
      inv.patientPhone?.includes(query);

    const matchesStatus = status === "all" || inv.computedStatus === status;
    const matchesMethod = method === "all" || (inv.payment_method ?? inv.lastPaymentMethod) === method;
    const matchesDoctor = doctorId === "all" || inv.doctorId === doctorId;

    let matchesDate = true;
    if (dateRange !== "all") {
      const issued = toValidDate(inv.issued_at);
      if (!issued) matchesDate = false;
      else if (dateRange === "today") matchesDate = isSameDay(inv.issued_at, now);
      else matchesDate = (now - issued) / (1000 * 60 * 60 * 24) <= DATE_RANGE_DAYS[dateRange];
    }

    return matchesSearch && matchesStatus && matchesMethod && matchesDoctor && matchesDate;
  });
}

export function buildInvoiceStats(enrichedInvoices) {
  const totalInvoices = enrichedInvoices.length;
  const paidCount = enrichedInvoices.filter((i) => i.computedStatus === PAYMENT_STATUS.PAID).length;
  const partialCount = enrichedInvoices.filter((i) => i.computedStatus === PAYMENT_STATUS.PARTIAL).length;
  const unpaidCount = enrichedInvoices.filter((i) => i.computedStatus === PAYMENT_STATUS.UNPAID).length;
  const totalAmount = enrichedInvoices.reduce((sum, i) => sum + (i.total_amount ?? 0), 0);
  const outstandingTotal = enrichedInvoices.reduce((sum, i) => sum + i.balanceDue, 0);
  return { totalInvoices, paidCount, partialCount, unpaidCount, totalAmount, outstandingTotal };
}

export function buildRevenueStats(payments, paymentRefunds) {
  const now = new Date();
  const activePayments = payments; 
  const totalRevenue = computeNetPaid(activePayments, paymentRefunds);
  const todayPayments = activePayments.filter((p) => isSameDay(p.paid_at, now));
  const todayRevenue = computeNetPaid(todayPayments, paymentRefunds);
  const monthPayments = activePayments.filter((p) => {
    const d = toValidDate(p.paid_at);
    return d && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const monthRevenue = computeNetPaid(monthPayments, paymentRefunds);
  return { totalRevenue, todayRevenue, monthRevenue };
}

export function buildInvoiceStatItems(invoiceStats, revenueStats) {
  return [
    {
      key: "total",
      label: "إجمالي الفواتير",
      value: invoiceStats.totalInvoices,
      icon: Receipt,
      iconWrapperClassName: "bg-blue-500/10 text-blue-600",
    },
    {
      key: "paid",
      label: "فواتير مدفوعة",
      value: invoiceStats.paidCount,
      icon: CheckCircle2,
      valueClassName: "text-emerald-600",
      iconWrapperClassName: "bg-emerald-500/10 text-emerald-600",
    },
    {
      key: "partial",
      label: "مدفوعة جزئياً",
      value: invoiceStats.partialCount,
      icon: Clock,
      valueClassName: "text-amber-600",
      iconWrapperClassName: "bg-amber-500/10 text-amber-600",
    },
    {
      key: "unpaid",
      label: "غير مدفوعة",
      value: invoiceStats.unpaidCount,
      icon: XCircle,
      valueClassName: "text-rose-600",
      iconWrapperClassName: "bg-rose-500/10 text-rose-600",
    },
    {
      key: "revenue",
      label: "إجمالي الإيرادات",
      value: revenueStats.totalRevenue,
      suffix: "ج.م",
      icon: TrendingUp,
      valueClassName: "text-emerald-600",
      iconWrapperClassName: "bg-emerald-500/10 text-emerald-600",
    },
    {
      key: "today",
      label: "إيرادات اليوم",
      value: revenueStats.todayRevenue,
      suffix: "ج.م",
      icon: BanknoteArrowUp,
      iconWrapperClassName: "bg-cyan-500/10 text-cyan-600",
    },
    {
      key: "month",
      label: "إيرادات الشهر",
      value: revenueStats.monthRevenue,
      suffix: "ج.م",
      icon: CalendarDays,
      iconWrapperClassName: "bg-purple-500/10 text-purple-600",
    },
    {
      key: "outstanding",
      label: "المبلغ المستحق",
      value: invoiceStats.outstandingTotal,
      suffix: "ج.م",
      icon: FileWarning,
      valueClassName: invoiceStats.outstandingTotal > 0 ? "text-rose-600" : "text-emerald-600",
      iconWrapperClassName: "bg-rose-500/10 text-rose-600",
    },
  ];
}

export function buildInvoiceCharts({ enrichedInvoices, invoiceItems, payments, servicesList, staffList }) {
  const activePayments = payments.filter((p) => !p.voided_at);
  const servicesById = new Map(servicesList.map((s) => [s.id, s]));
  const staffById = new Map(staffList.map((s) => [s.id, s]));

  const revenueByMonth = groupSumByMonth(activePayments, "paid_at", "amount");
  const revenueByDay = groupSumByDay(activePayments, "paid_at", "amount", 14);

  const statusDistribution = Object.values(PAYMENT_STATUS)
    .map((statusKey) => ({
      name: PAYMENT_STATUS_LABELS[statusKey],
      value: enrichedInvoices.filter((i) => i.computedStatus === statusKey).length,
      color: colorForStatus(statusKey),
    }))
    .filter((item) => item.value > 0);

  const revenueByService = groupSumByField(invoiceItems, "service_id", "line_total", (id) => servicesById.get(id)?.name ?? "خدمة أخرى")
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const revenueByDoctor = groupSumByField(enrichedInvoices, "doctorId", "total_amount", (id) => staffById.get(id)?.full_name ?? "غير محدد")
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const revenueByMethod = groupSumByField(activePayments, "method", "amount", (m) => PAYMENT_METHOD_LABELS[m] ?? m);

  return { revenueByMonth, revenueByDay, statusDistribution, revenueByService, revenueByDoctor, revenueByMethod };
}

export const INVOICE_STATUS_FILTER_OPTIONS = [
  { key: "all", label: "كل الحالات", icon: Receipt, style: "bg-card text-foreground border-border hover:bg-muted/30" },
  {
    key: PAYMENT_STATUS.PAID,
    label: "مدفوعة",
    icon: CheckCircle2,
    style: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    textClass: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: PAYMENT_STATUS.PARTIAL,
    label: "مدفوعة جزئياً",
    icon: Clock,
    style: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    textClass: "text-amber-600 dark:text-amber-400",
  },
  {
    key: PAYMENT_STATUS.UNPAID,
    label: "غير مدفوعة",
    icon: AlertTriangle,
    style: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    textClass: "text-rose-600 dark:text-rose-400",
  },
];

export const DATE_RANGE_FILTER_OPTIONS = [
  { key: "all", label: "كل الفترات", icon: CalendarDays, style: "bg-card text-foreground border-border hover:bg-muted/30" },
  { key: "today", label: "اليوم", icon: Clock, style: "bg-blue-500/10 text-blue-600 border-blue-500/30", textClass: "text-blue-600" },
  { key: "week", label: "هذا الأسبوع", icon: CalendarDays, style: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30", textClass: "text-indigo-600" },
  { key: "month", label: "هذا الشهر", icon: CalendarDays, style: "bg-purple-500/10 text-purple-600 border-purple-500/30", textClass: "text-purple-600" },
];

export function buildMethodFilterOptions() {
  return [
    { key: "all", label: "كل طرق الدفع", icon: Wallet, style: "bg-card text-foreground border-border hover:bg-muted/30" },
    ...Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => ({
      key,
      label,
      icon: Wallet,
      style: "bg-teal-500/10 text-teal-600 border-teal-500/30",
      textClass: "text-teal-600",
    })),
  ];
}
