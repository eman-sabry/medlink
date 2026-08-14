import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { countBy } from "../utils/stats";
import {
  averageDurationMinutes,
  computeTrend,
  findPeakHour,
  groupCountByField,
  groupCountByHour,
  groupCountByMonth,
  isSameDay,
} from "../utils/dashboardStats";
import { buildOperationalAlerts } from "../helpers/operationalAlerts.helpers";
import { colorForStatus } from "../components/charts/chartColors";
import { computeNetPaid, computeInvoiceStatuses, PAYMENT_STATUS } from "../utils/billing";
import { computeExpensesInRange, computeNetProfit } from "../helpers/financial.helpers";
import { getSessionActualRange } from "../helpers/patientProfile.helpers";

const EMPTY_ARRAY = [];
const LONG_WAIT_MINUTES = 30;
const DEFAULT_SESSION_MINUTES = 30;
const HEARTBEAT_MS = 30 * 1000; 

function useResource(key, endpoint) {
  return useQuery({
    queryKey: [key],
    queryFn: () => apiRequest(endpoint),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

function yesterdayOf(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d;
}

export function useCenterPulse() {
  const patientsQuery = useResource("patients", "/patients");
  const staffQuery = useResource("staff", "/staff");
  const appointmentsQuery = useResource("appointments", "/appointments");
  const devicesQuery = useResource("devices", "/devices");
  const roomsQuery = useResource("rooms", "/rooms");
  const maintenanceQuery = useResource("maintenance", "/maintenance");
  const invoicesQuery = useResource("invoices", "/invoices");
  const paymentsQuery = useResource("payments", "/payments");
  const paymentRefundsQuery = useResource("payment_refunds", "/payment_refunds");
  const servicesQuery = useResource("services", "/services");
  const treatmentSessionsQuery = useResource("treatment_sessions", "/treatment_sessions");
  const expensesQuery = useResource("expenses", "/expenses");
  const archivedItemsQuery = useResource("archived_items", "/archived_items");

  const patients = patientsQuery.data ?? EMPTY_ARRAY;
  const staff = staffQuery.data ?? EMPTY_ARRAY;
  const appointments = appointmentsQuery.data ?? EMPTY_ARRAY;
  const devices = devicesQuery.data ?? EMPTY_ARRAY;
  const rooms = roomsQuery.data ?? EMPTY_ARRAY;
  const maintenance = maintenanceQuery.data ?? EMPTY_ARRAY;
  const invoices = invoicesQuery.data ?? EMPTY_ARRAY;
  const payments = paymentsQuery.data ?? EMPTY_ARRAY;
  const paymentRefunds = paymentRefundsQuery.data ?? EMPTY_ARRAY;
  const services = servicesQuery.data ?? EMPTY_ARRAY;
  const treatmentSessions = treatmentSessionsQuery.data ?? EMPTY_ARRAY;
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
    roomsQuery.isLoading ||
    maintenanceQuery.isLoading ||
    invoicesQuery.isLoading ||
    paymentsQuery.isLoading ||
    paymentRefundsQuery.isLoading ||
    servicesQuery.isLoading ||
    treatmentSessionsQuery.isLoading ||
    expensesQuery.isLoading ||
    archivedItemsQuery.isLoading;

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), HEARTBEAT_MS);
    return () => clearInterval(id);
  }, []);

  const now = new Date();
  const yesterday = yesterdayOf(now);

  const todaysAppointments = useMemo(
    () => appointments.filter((a) => isSameDay(a.starts_at, now)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appointments],
  );

  const yesterdaysAppointments = useMemo(
    () => appointments.filter((a) => isSameDay(a.starts_at, yesterday)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appointments],
  );

  const staffById = useMemo(() => new Map(staff.map((s) => [s.id, s])), [staff]);
  const roomsById = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);
  const servicesById = useMemo(() => new Map(services.map((s) => [s.id, s])), [services]);

  const kpis = useMemo(() => {
    const patientsToday = new Set(todaysAppointments.map((a) => a.patient_id)).size;
    const patientsYesterday = new Set(yesterdaysAppointments.map((a) => a.patient_id)).size;

    const completedToday = countBy(todaysAppointments, (a) => a.status === "Completed");
    const completedYesterday = countBy(yesterdaysAppointments, (a) => a.status === "Completed");

    const cancelledToday = countBy(todaysAppointments, (a) => a.status === "Cancelled");
    const missedToday = countBy(todaysAppointments, (a) => a.status === "NoShow");

    const delayedAppointments = appointments.filter(
      (a) => (a.status === "Scheduled" || a.status === "Waiting") && new Date(a.starts_at) < now,
    );

    const waitingAppointments = appointments.filter((a) => a.status === "Waiting");
    const waitingNow = waitingAppointments.length;
    const inSessionNow = countBy(appointments, (a) => a.status === "InSession");

    const revenueToday = computeNetPaid(
      payments.filter((p) => isSameDay(p.paid_at, now)),
      paymentRefunds,
    );
    const revenueYesterday = computeNetPaid(
      payments.filter((p) => isSameDay(p.paid_at, yesterday)),
      paymentRefunds,
    );

    const doctors = staff.filter((s) => s.staff_type === "Doctor");
    const busyDoctorIds = new Set(
      appointments.filter((a) => a.status === "InSession").map((a) => a.doctor_id),
    );
    const busyDoctors = doctors.filter((d) => busyDoctorIds.has(d.id)).length;

    const availableRooms = countBy(rooms, (r) => r.status === "Available");
    const occupiedRooms = countBy(rooms, (r) => r.status === "Occupied");
    const devicesNeedingMaintenance = countBy(devices, (d) => d.status === "Maintenance");

    const completionRateToday =
      todaysAppointments.length > 0
        ? Math.round((completedToday / todaysAppointments.length) * 100)
        : 0;

    const avgWaitingMinutes = averageDurationMinutes(
      waitingAppointments.map((a) => ({
        start: a.starts_at,
        end: now.toISOString()
      })),
      "start",
      "end",
    );

    const longWaitCount = countBy(
      waitingAppointments,
      (a) => (now - new Date(a.starts_at)) / 60000 > LONG_WAIT_MINUTES,
    );

    const expensesToday = computeExpensesInRange(expenses, archivedExpenseIds, (e) => isSameDay(e.date, now));
    const expensesYesterday = computeExpensesInRange(expenses, archivedExpenseIds, (e) => isSameDay(e.date, yesterday));
    const netProfitToday = computeNetProfit(revenueToday, expensesToday);

    return {
      patientsToday,
      appointmentsToday: todaysAppointments.length,
      activeSessionsNow: inSessionNow,
      revenueToday,
      expensesToday,
      netProfitToday,
      waitingNow,
      availableDoctors: doctors.length - busyDoctors,
      busyDoctors,
      totalDoctors: doctors.length,
      availableRooms,
      occupiedRooms,
      totalRooms: rooms.length,
      devicesNeedingMaintenance,
      completedToday,
      cancelledToday,
      missedToday,
      delayedCount: delayedAppointments.length,
      completionRateToday,
      avgWaitingMinutes: avgWaitingMinutes ? Math.round(avgWaitingMinutes) : 0,
      trends: {
        patientsToday: computeTrend(patientsToday, patientsYesterday),
        appointmentsToday: computeTrend(todaysAppointments.length, yesterdaysAppointments.length),
        completedToday: computeTrend(completedToday, completedYesterday),
        revenueToday: computeTrend(revenueToday, revenueYesterday),
        expensesToday: computeTrend(expensesToday, expensesYesterday),
      },
      _delayedAppointments: delayedAppointments,
      _waitingAppointments: waitingAppointments,
      _longWaitCount: longWaitCount,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    todaysAppointments,
    yesterdaysAppointments,
    appointments,
    staff,
    rooms,
    devices,
    payments,
    expenses,
    archivedExpenseIds,
    tick,
  ]);

  const delayedCases = useMemo(
    () =>
      kpis._delayedAppointments
        .map((a) => {
          const delayMinutes = Math.round((now - new Date(a.starts_at)) / 60000);
          return {
            id: a.id,
            patientName: a.patient_name ?? "مريض غير معروف",
            doctorName: a.doctor_name ?? staffById.get(a.doctor_id)?.full_name ?? "غير محدد",
            delayMinutes,
            priority: delayMinutes > 20 ? "critical" : delayMinutes > 10 ? "warning" : "normal",
          };
        })
        .sort((a, b) => b.delayMinutes - a.delayMinutes),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kpis._delayedAppointments, staffById, tick],
  );

  const avgSessionMinutes = useMemo(() => {
    const resolvedRanges = treatmentSessions
      .map((session) => getSessionActualRange(session))
      .filter((range) => range.start && range.end);
    return averageDurationMinutes(resolvedRanges, "start", "end") ?? DEFAULT_SESSION_MINUTES;
  }, [treatmentSessions]);

  const waitingQueue = useMemo(
    () =>
      [...kpis._waitingAppointments]
        .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
        .map((a, index) => {
          const waitedMinutes = Math.max(0, Math.round((now - new Date(a.starts_at)) / 60000));
          return {
            id: a.id,
            queueNumber: index + 1,
            patientName: a.patient_name ?? "مريض غير معروف",
            doctorName: a.doctor_name ?? staffById.get(a.doctor_id)?.full_name ?? "غير محدد",
            waitedMinutes,
            estimatedRemainingMinutes: Math.round(avgSessionMinutes * (index + 1)),
          };
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kpis._waitingAppointments, staffById, avgSessionMinutes, tick],
  );

  const doctorStatusList = useMemo(() => {
    const busyDoctorIds = new Set(
      appointments.filter((a) => a.status === "InSession").map((a) => a.doctor_id),
    );
    return staff
      .filter((s) => s.staff_type === "Doctor")
      .map((doctor) => ({
        id: doctor.id,
        name: doctor.full_name,
        specialty: doctor.specialty,
        status: busyDoctorIds.has(doctor.id) ? "InSession" : "Available",
      }));
  }, [staff, appointments]);

  const deviceStatusList = useMemo(
    () =>
      devices.map((device) => {
        const room = roomsById.get(device.room_id);
        let category = "Available";
        if (device.status === "Maintenance") category = "Maintenance";
        else if (device.status === "Out-Of-Service") category = "OutOfService";
        else if (device.status === "Operational" && room?.status === "Occupied") category = "InUse";

        return { id: device.id, name: device.name, roomName: room?.name, category };
      }),
    [devices, roomsById],
  );

const charts = useMemo(() => {
      const statusArabicNames = {
        Completed: "مكتمل",
        Cancelled: "ملغي",
        NoShow: "لم يحضر",
        Scheduled: "مجدول",
        Waiting: "انتظار",
        InSession: "قيد الجلسة",
        Arrived: "حضر",
      };

      const appointmentsByStatusToday = groupCountByField(todaysAppointments, "status").map(
        (item) => ({
          name: statusArabicNames[item.name] ?? item.name, 
          value: item.value,
          color: colorForStatus(item.name), 
        }),
      );

    const topServices = groupCountByField(appointments, "service_id", (id) =>
      servicesById.get(id)?.name ?? "خدمة أخرى",
    )
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const doctorWorkload = [...staffById.values()]
      .filter((s) => s.staff_type === "Doctor")
      .map((doctor) => ({
        name: doctor.full_name,
        sessions: countBy(appointments, (a) => a.doctor_id === doctor.id),
      }));

    const arrivedStatuses = new Set(["Arrived", "Waiting", "InSession", "Completed"]);
    const arrivedToday = todaysAppointments.filter((a) => arrivedStatuses.has(a.status));

    return {
      appointmentsToday: groupCountByHour(todaysAppointments, "starts_at", now),
      arrivalsToday: groupCountByHour(arrivedToday, "starts_at", now),
      waitingQueueToday: groupCountByHour(
        appointments.filter((a) => a.status === "Waiting"),
        "starts_at",
        now,
      ),
      doctorWorkloadToday: groupCountByHour(
        todaysAppointments.filter((a) => a.status === "InSession" || a.status === "Completed"),
        "starts_at",
        now,
      ),
      appointmentGrowth: groupCountByMonth(appointments, "starts_at"),
      patientGrowth: groupCountByMonth(patients, "joined_date"),
      appointmentsByStatusToday,
      topServices,
      doctorWorkload,
      peakHour: findPeakHour(appointments, "starts_at"),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todaysAppointments, appointments, patients, servicesById, staffById]);

  const invoiceStatuses = useMemo(
    () => computeInvoiceStatuses(invoices, payments, paymentRefunds),
    [invoices, payments, paymentRefunds],
  );
  const unpaidInvoicesCount = useMemo(
    () => countBy(invoices, (i) => invoiceStatuses.get(i.id) !== PAYMENT_STATUS.PAID),
    [invoices, invoiceStatuses],
  );

  const alerts = useMemo(
    () =>
      buildOperationalAlerts({
        devices,
        maintenance,
        unpaidInvoicesCount,
        delayedAppointments: kpis._delayedAppointments,
        longWaitCount: kpis._longWaitCount,
        missedToday: kpis.missedToday,
      }),
    [devices, maintenance, unpaidInvoicesCount, kpis],
  );

  const centerStatus = useMemo(() => {
    const hasCriticalAlert = alerts.some((a) => a.level === "error");
    if (hasCriticalAlert) return { label: "يحتاج انتباه", tone: "critical" };
    if (kpis.waitingNow + kpis.activeSessionsNow > 4) return { label: "مزدحم", tone: "busy" };
    return { label: "طبيعي", tone: "normal" };
  }, [alerts, kpis.waitingNow, kpis.activeSessionsNow]);
const missedPatientsList = useMemo(() => {
  return todaysAppointments
    .filter((a) => a.status === "NoShow")
    .map((a) => ({
      id: a.id,
      patientId: a.patient_id,
      patientName: a.patient_name ?? "مريض غير معروف",
      doctorName: a.doctor_name ?? staffById.get(a.doctor_id)?.full_name ?? "غير محدد",
      phone: a.patient_phone ?? "", 
      timeLabel: new Date(a.starts_at).toLocaleTimeString("ar-EG-u-nu-latn", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }),
    }));
}, [todaysAppointments, staffById]);
  const dailySummary = useMemo(() => {
    const parts = [
      `اليوم لديك ${kpis.appointmentsToday} موعد، منها ${kpis.completedToday} مكتمل (${kpis.completionRateToday}% نسبة الإنجاز).`,
    ];
    if (kpis.waitingNow > 0) parts.push(`يوجد حالياً ${kpis.waitingNow} مريض في الانتظار.`);
    if (kpis.delayedCount > 0) parts.push(`${kpis.delayedCount} موعد متأخر عن وقته المحدد.`);
    parts.push(`${kpis.availableDoctors} من ${kpis.totalDoctors} طبيب متاح الآن.`);
    if (kpis.devicesNeedingMaintenance > 0) {
      parts.push(`${kpis.devicesNeedingMaintenance} جهاز بحاجة صيانة.`);
    }
    return parts.join(" ");
  }, [kpis]);

  return {
    isLoading,
    kpis,
    delayedCases,
    waitingQueue,
    doctorStatusList,
    roomStatusList: rooms,
    deviceStatusList,
    missedPatientsList,
    charts,
    alerts,
    centerStatus,
    dailySummary,
  };
}
