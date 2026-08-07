import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { countBy, sumBy } from "../utils/stats";
import {
  groupCountByField,
  groupCountByMonth,
  groupCountByWeekday,
  groupSumByMonth,
} from "../utils/dashboardStats";
import { colorForStatus } from "../components/charts/chartColors";
import {
  APPOINTMENT_STATUS_LABELS,
  DEVICE_STATUS_LABELS,
  MAINTENANCE_STATUS_LABELS,
  PATIENT_STATUS_LABELS,
} from "../helpers/dashboardLabels";
import { buildOperationalAlerts } from "../helpers/operationalAlerts.helpers";

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
  const treatmentSessionsQuery = useResource("treatment_sessions", "/treatment_sessions");
  const servicesQuery = useResource("services", "/services");

  const patients = patientsQuery.data ?? EMPTY_ARRAY;
  const staff = staffQuery.data ?? EMPTY_ARRAY;
  const appointments = appointmentsQuery.data ?? EMPTY_ARRAY;
  const devices = devicesQuery.data ?? EMPTY_ARRAY;
  const maintenance = maintenanceQuery.data ?? EMPTY_ARRAY;
  const rooms = roomsQuery.data ?? EMPTY_ARRAY;
  const invoices = invoicesQuery.data ?? EMPTY_ARRAY;
  const payments = paymentsQuery.data ?? EMPTY_ARRAY;
  const treatmentSessions = treatmentSessionsQuery.data ?? EMPTY_ARRAY;
  const services = servicesQuery.data ?? EMPTY_ARRAY;

  const isLoading =
    patientsQuery.isLoading ||
    staffQuery.isLoading ||
    appointmentsQuery.isLoading ||
    devicesQuery.isLoading ||
    maintenanceQuery.isLoading ||
    roomsQuery.isLoading ||
    invoicesQuery.isLoading ||
    paymentsQuery.isLoading ||
    treatmentSessionsQuery.isLoading ||
    servicesQuery.isLoading;

  const stats = useMemo(
    () => ({
      totalPatients: patients.length,
      totalDoctors: countBy(staff, (s) => s.staff_type === "Doctor"),
      totalStaff: staff.length,
      totalAppointments: appointments.length,
      revenue: sumBy(payments, (p) => p.amount),
      activeSessions: countBy(
        appointments,
        (a) => a.status === "InSession" || a.status === "In-Progress",
      ),
      roomsCount: rooms.length,
      pendingInvoices: countBy(invoices, (i) => i.status !== "Paid"),
      devicesWorking: countBy(devices, (d) => d.status === "Operational"),
      devicesTotal: devices.length,
      maintenancePending: countBy(maintenance, (m) => m.status === "Pending"),
      maintenanceTotal: maintenance.length,
      roomOccupancyRate: rooms.length
        ? Math.round((countBy(rooms, (r) => r.status === "Occupied") / rooms.length) * 100)
        : 0,
    }),
    [patients, staff, appointments, payments, rooms, invoices, devices, maintenance],
  );

  const staffById = useMemo(() => new Map(staff.map((s) => [s.id, s])), [staff]);
  const servicesById = useMemo(() => new Map(services.map((s) => [s.id, s])), [services]);

  const charts = useMemo(() => {
    const revenueTrend = groupSumByMonth(payments, "paid_at", "amount");
    const patientsPerMonth = groupCountByMonth(patients, "joined_date");
    const appointmentsPerMonth = groupCountByMonth(appointments, "starts_at");
    const weeklyStatistics = groupCountByWeekday(appointments, "starts_at");

    // حالة الأجهزة كأعمدة بدل دائرة، مع لون دلالي ثابت لكل حالة
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

    // حالات المرضى (نشط / غير نشط / مؤرشف) — يوضح جودة قاعدة المرضى النشطة فعلياً
    const patientsByStatus = groupCountByField(patients, "status").map((item) => ({
      name: PATIENT_STATUS_LABELS[item.name] ?? item.name,
      value: item.value,
      color: colorForStatus(item.name),
    }));

    // توزيع حالات المواعيد (مكتمل/ملغي/منتظر...) بنفس تسميات فلتر صفحة المواعيد
    const appointmentsByStatus = groupCountByField(appointments, "status").map((item) => ({
      name: APPOINTMENT_STATUS_LABELS[item.name] ?? item.name,
      value: item.value,
      color: colorForStatus(item.name),
    }));

    // حالة طلبات الصيانة
    const maintenanceStatus = groupCountByField(maintenance, "status").map((item) => ({
      name: MAINTENANCE_STATUS_LABELS[item.name] ?? item.name,
      value: item.value,
      color: colorForStatus(item.name),
    }));

    // عبء العمل لكل طبيب: عدد الجلسات المكتملة + إجمالي ساعات العمل الفعلية (من بيانات الجلسات العلاجية)
    const workloadByDoctorId = new Map();
    treatmentSessions.forEach((session) => {
      const doctorId = session.doctor_id;
      if (!doctorId) return;
      const entry = workloadByDoctorId.get(doctorId) ?? { completed: 0, hours: 0 };

      if (session.status === "Completed") entry.completed += 1;

      if (session.starts_at && session.ends_at) {
        const start = new Date(session.starts_at);
        const end = new Date(session.ends_at);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          entry.hours += (end - start) / (1000 * 60 * 60);
        }
      }

      workloadByDoctorId.set(doctorId, entry);
    });

    const doctorPerformance = [...workloadByDoctorId.entries()].map(([doctorId, entry]) => ({
      name: staffById.get(doctorId)?.full_name ?? "طبيب غير معروف",
      completed: entry.completed,
      hours: Number(entry.hours.toFixed(1)),
    }));

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
    };
  }, [
    payments,
    patients,
    appointments,
    devices,
    maintenance,
    treatmentSessions,
    servicesById,
    staffById,
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
    () => buildOperationalAlerts({ devices, maintenance, invoices }),
    [devices, maintenance, invoices],
  );

  return {
    isLoading,
    stats,
    charts,
    recentActivities,
    upcomingAppointments,
    systemAlerts,
  };
}
