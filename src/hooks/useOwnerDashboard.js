import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { countBy } from "../utils/stats";
import {
  groupCountByField,
  groupCountByMonth,
  groupCountByWeekday,
  groupSumByMonth,
  isSameDay,
} from "../utils/dashboardStats";
import { colorForStatus } from "../components/charts/chartColors";
import {
  APPOINTMENT_STATUS_LABELS,
  DEVICE_STATUS_LABELS,
  MAINTENANCE_STATUS_LABELS,
  PATIENT_STATUS_LABELS,
} from "../helpers/dashboardLabels";
import { buildOperationalAlerts } from "../helpers/operationalAlerts.helpers";
import { computeInvoiceStatuses, PAYMENT_STATUS } from "../utils/billing";
import { getSessionActualRange } from "../helpers/patientProfile.helpers";
import { buildExpenseCharts } from "../helpers/expense.helpers";
import {
  buildRevenueStats,
  computeExpensesInRange,
  computeTotalPaidExpenses,
  computeNetProfit,
  buildRevenueVsExpensesSeries,
} from "../helpers/financial.helpers";

const EMPTY_ARRAY = [];

function useResource(key, endpoint) {
  return useQuery({
    queryKey: [key],
    queryFn: () => apiRequest(endpoint),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useOwnerDashboard() {
  const patientsQuery = useResource("patients", "/patients");
  const staffQuery = useResource("staff", "/staff");
  const appointmentsQuery = useResource("appointments", "/appointments");
  const devicesQuery = useResource("devices", "/devices");
  const maintenanceQuery = useResource("maintenance", "/maintenance");
  const roomsQuery = useResource("rooms", "/rooms");
  const invoicesQuery = useResource("invoices", "/invoices");
  const paymentsQuery = useResource("payments", "/payments");
  const paymentRefundsQuery = useResource("payment_refunds", "/payment_refunds");
  const treatmentSessionsQuery = useResource("treatment_sessions", "/treatment_sessions");
  const servicesQuery = useResource("services", "/services");
  const expensesQuery = useResource("expenses", "/expenses");
  const archivedItemsQuery = useResource("archived_items", "/archived_items");

  const patients = patientsQuery.data ?? EMPTY_ARRAY;
  const staff = staffQuery.data ?? EMPTY_ARRAY;
  const appointments = appointmentsQuery.data ?? EMPTY_ARRAY;
  const devices = devicesQuery.data ?? EMPTY_ARRAY;
  const maintenance = maintenanceQuery.data ?? EMPTY_ARRAY;
  const rooms = roomsQuery.data ?? EMPTY_ARRAY;
  const invoices = invoicesQuery.data ?? EMPTY_ARRAY;
  const payments = paymentsQuery.data ?? EMPTY_ARRAY;
  const paymentRefunds = paymentRefundsQuery.data ?? EMPTY_ARRAY;
  const treatmentSessions = treatmentSessionsQuery.data ?? EMPTY_ARRAY;
  const services = servicesQuery.data ?? EMPTY_ARRAY;
  const expenses = expensesQuery.data ?? EMPTY_ARRAY;

  const archivedExpenseIds = useMemo(
    () =>
      new Set(
        (archivedItemsQuery.data ?? EMPTY_ARRAY)
          .filter((item) => item.entity_type === "expense")
          .map((item) => item.entity_id),
      ),
    [archivedItemsQuery.data],
  );

  const isLoading =
    patientsQuery.isLoading ||
    staffQuery.isLoading ||
    appointmentsQuery.isLoading ||
    devicesQuery.isLoading ||
    maintenanceQuery.isLoading ||
    roomsQuery.isLoading ||
    invoicesQuery.isLoading ||
    paymentsQuery.isLoading ||
    paymentRefundsQuery.isLoading ||
    treatmentSessionsQuery.isLoading ||
    servicesQuery.isLoading ||
    expensesQuery.isLoading ||
    archivedItemsQuery.isLoading;

  const isError =
    patientsQuery.isError ||
    staffQuery.isError ||
    appointmentsQuery.isError ||
    devicesQuery.isError ||
    maintenanceQuery.isError ||
    roomsQuery.isError ||
    invoicesQuery.isError ||
    paymentsQuery.isError ||
    paymentRefundsQuery.isError ||
    treatmentSessionsQuery.isError ||
    servicesQuery.isError ||
    expensesQuery.isError ||
    archivedItemsQuery.isError;

  const invoiceStatuses = useMemo(
    () => computeInvoiceStatuses(invoices, payments, paymentRefunds),
    [invoices, payments, paymentRefunds],
  );

  const revenueStats = useMemo(() => buildRevenueStats(payments, paymentRefunds), [payments, paymentRefunds]);

  const stats = useMemo(() => {
    const now = new Date();
    const expensesToday = computeExpensesInRange(expenses, archivedExpenseIds, (e) => isSameDay(e.date, now));
    const expensesMonth = computeExpensesInRange(expenses, archivedExpenseIds, (e) => {
      const d = new Date(e.date);
      return !isNaN(d.getTime()) && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    const totalExpenses = computeTotalPaidExpenses(expenses, archivedExpenseIds);

    return {
      totalPatients: patients.length,
      totalDoctors: countBy(staff, (s) => s.staff_type === "Doctor"),
      totalStaff: staff.length,
      totalAppointments: appointments.length,
      revenue: revenueStats.totalRevenue,
      revenueToday: revenueStats.todayRevenue,
      revenueMonth: revenueStats.monthRevenue,
      expensesToday,
      expensesMonth,
      totalExpenses,
      netProfitMonth: computeNetProfit(revenueStats.monthRevenue, expensesMonth),
      activeSessions: countBy(
        appointments,
        (a) => a.status === "InSession" || a.status === "In-Progress",
      ),
      roomsCount: rooms.length,
      pendingInvoices: countBy(invoices, (i) => invoiceStatuses.get(i.id) !== PAYMENT_STATUS.PAID),
      devicesWorking: countBy(devices, (d) => d.status === "Operational"),
      devicesTotal: devices.length,
      maintenancePending: countBy(maintenance, (m) => m.status === "Pending"),
      maintenanceTotal: maintenance.length,
      roomOccupancyRate: rooms.length
        ? Math.round((countBy(rooms, (r) => r.status === "Occupied") / rooms.length) * 100)
        : 0,
    };
  }, [
    patients,
    staff,
    appointments,
    rooms,
    invoices,
    invoiceStatuses,
    devices,
    maintenance,
    revenueStats,
    expenses,
    archivedExpenseIds,
  ]);

  const staffById = useMemo(() => new Map(staff.map((s) => [s.id, s])), [staff]);
  const servicesById = useMemo(() => new Map(services.map((s) => [s.id, s])), [services]);

  const charts = useMemo(() => {
    const activePayments = payments.filter((p) => !p.voided_at);
    const revenueTrend = groupSumByMonth(activePayments, "paid_at", "amount");
    const patientsPerMonth = groupCountByMonth(patients, "joined_date");
    const appointmentsPerMonth = groupCountByMonth(appointments, "starts_at");
    const weeklyStatistics = groupCountByWeekday(appointments, "starts_at");

    const deviceStatus = groupCountByField(devices, "status").map((item) => ({
      name: DEVICE_STATUS_LABELS[item.name] ?? item.name,
      value: item.value,
      color: colorForStatus(item.name),
    }));

    const servicesDistribution = groupCountByField(
      appointments,
      "service_id",
      (id) => servicesById.get(id)?.name ?? "خدمة أخرى",
    );

    const patientsByStatus = groupCountByField(patients, "status").map((item) => ({
      name: PATIENT_STATUS_LABELS[item.name] ?? item.name,
      value: item.value,
      color: colorForStatus(item.name),
    }));

    const appointmentsByStatus = groupCountByField(appointments, "status").map((item) => ({
      name: APPOINTMENT_STATUS_LABELS[item.name] ?? item.name,
      value: item.value,
      color: colorForStatus(item.name),
    }));

    const maintenanceStatus = groupCountByField(maintenance, "status").map((item) => ({
      name: MAINTENANCE_STATUS_LABELS[item.name] ?? item.name,
      value: item.value,
      color: colorForStatus(item.name),
    }));

    const workloadByDoctorId = new Map();
    treatmentSessions.forEach((session) => {
      const doctorId = session.doctor_id;
      if (!doctorId) return;
      const entry = workloadByDoctorId.get(doctorId) ?? { completed: 0, hours: 0 };

      if (session.status === "Completed") entry.completed += 1;

      const { start, end } = getSessionActualRange(session);
      if (start && end) {
        entry.hours += (end - start) / (1000 * 60 * 60);
      }

      workloadByDoctorId.set(doctorId, entry);
    });

    const nameCount = new Map();
    const doctorPerformance = [...workloadByDoctorId.entries()].map(([doctorId, entry]) => {
      const baseName = staffById.get(doctorId)?.full_name ?? (doctorId ? `طبيب (${String(doctorId).slice(-4)})` : "طبيب غير محدد");
      const currentCount = (nameCount.get(baseName) ?? 0) + 1;
      nameCount.set(baseName, currentCount);
      const uniqueName = currentCount > 1 ? `${baseName} (${currentCount})` : baseName;

      return {
        id: doctorId,
        name: uniqueName,
        completed: entry.completed,
        hours: Number(entry.hours.toFixed(1)),
      };
    });

    const activePaidExpenses = expenses.filter(
      (e) => !archivedExpenseIds.has(e.id) && (e.status ?? "Paid") === "Paid",
    );
    const expenseCharts = buildExpenseCharts(activePaidExpenses);
    const revenueVsExpensesSeries = buildRevenueVsExpensesSeries({
      payments,
      paymentRefunds,
      expenses,
      archivedExpenseIds,
    });

    return {
      revenueTrend,
      patientsPerMonth,
      appointmentsPerMonth,
      weeklyStatistics,
      deviceStatus,
      servicesDistribution,
      patientsByStatus,
      appointmentsByStatus,
      maintenanceStatus,
      doctorPerformance,
      monthlyStatistics: appointmentsPerMonth,
      expensesByCategory: expenseCharts.expensesByCategory,
      expensesTrendMonthly: expenseCharts.expensesTrendMonthly,
      maintenanceExpensesTrend: expenseCharts.maintenanceExpensesTrend,
      revenueVsExpenses: revenueVsExpensesSeries.monthly,
      revenueVsExpensesSeries,
    };
  }, [
    payments,
    paymentRefunds,
    patients,
    appointments,
    devices,
    maintenance,
    treatmentSessions,
    servicesById,
    staffById,
    expenses,
    archivedExpenseIds,
  ]);

  const recentActivities = useMemo(() => {
    const fromAppointments = appointments.map((a) => ({
      id: `apt-${a.id}`,
      label: `موعد ${a.status === "Completed" ? "مكتمل" : "مسجّل"} - ${a.patient_name ?? "مريض"}`,
      timestamp: a.created_at ?? a.starts_at,
    }));
    const fromMaintenance = maintenance.map((m) => ({
      id: `mnt-${m.id}`,
      label: `صيانة: ${m.reason ?? "بدون سبب محدد"}`,
      timestamp: m.completed_at,
    }));

    return [...fromAppointments, ...fromMaintenance]
      .filter((item) => item.timestamp)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 8);
  }, [appointments, maintenance]);

  const upcomingAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.status === "Scheduled" || a.status === "Waiting")
        .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
        .slice(0, 6),
    [appointments],
  );

  const systemAlerts = useMemo(
    () =>
      buildOperationalAlerts({
        devices,
        maintenance,
        unpaidInvoicesCount: stats.pendingInvoices,
      }),
    [devices, maintenance, stats.pendingInvoices],
  );

  return {
    isLoading,
    isError,
    stats,
    charts,
    recentActivities,
    upcomingAppointments,
    systemAlerts,
  };
}
