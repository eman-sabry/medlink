import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { countBy, sumBy } from "../utils/stats";
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

const EMPTY_ARRAY = [];
const LONG_WAIT_MINUTES = 30;
const DEFAULT_SESSION_MINUTES = 30;

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
  const servicesQuery = useResource("services", "/services");
  const treatmentSessionsQuery = useResource("treatment_sessions", "/treatment_sessions");

  const patients = patientsQuery.data ?? EMPTY_ARRAY;
  const staff = staffQuery.data ?? EMPTY_ARRAY;
  const appointments = appointmentsQuery.data ?? EMPTY_ARRAY;
  const devices = devicesQuery.data ?? EMPTY_ARRAY;
  const rooms = roomsQuery.data ?? EMPTY_ARRAY;
  const maintenance = maintenanceQuery.data ?? EMPTY_ARRAY;
  const invoices = invoicesQuery.data ?? EMPTY_ARRAY;
  const payments = paymentsQuery.data ?? EMPTY_ARRAY;
  const services = servicesQuery.data ?? EMPTY_ARRAY;
  const treatmentSessions = treatmentSessionsQuery.data ?? EMPTY_ARRAY;

  const isLoading =
    patientsQuery.isLoading ||
    staffQuery.isLoading ||
    appointmentsQuery.isLoading ||
    devicesQuery.isLoading ||
    roomsQuery.isLoading ||
    maintenanceQuery.isLoading ||
    invoicesQuery.isLoading ||
    paymentsQuery.isLoading ||
    servicesQuery.isLoading ||
    treatmentSessionsQuery.isLoading;

  const now = new Date();
  const yesterday = yesterdayOf(now);

  const todaysAppointments = useMemo(
    () => appointments.filter((a) => isSameDay(a.created_at, now)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appointments],
  );

  const yesterdaysAppointments = useMemo(
    () => appointments.filter((a) => isSameDay(a.created_at, yesterday)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appointments],
  );

  const staffById = useMemo(() => new Map(staff.map((s) => [s.id, s])), [staff]);
  const roomsById = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);
  const servicesById = useMemo(() => new Map(services.map((s) => [s.id, s])), [services]);

  // ---- مؤشرات الأداء الرئيسية (KPIs) ----
  const kpis = useMemo(() => {
    const patientsToday = new Set(todaysAppointments.map((a) => a.patient_id)).size;
    const patientsYesterday = new Set(yesterdaysAppointments.map((a) => a.patient_id)).size;

    const completedToday = countBy(todaysAppointments, (a) => a.status === "Completed");
    const completedYesterday = countBy(yesterdaysAppointments, (a) => a.status === "Completed");

    const cancelledToday = countBy(todaysAppointments, (a) => a.status === "Cancelled");
    const missedToday = countBy(todaysAppointments, (a) => a.status === "NoShow");

    const delayedAppointments = appointments.filter(
      (a) => (a.status === "Scheduled" || a.status === "Waiting") && new Date(a.created_at) < now,
    );

    const waitingAppointments = appointments.filter((a) => a.status === "Waiting");
    const waitingNow = waitingAppointments.length;
    const inSessionNow = countBy(appointments, (a) => a.status === "InSession");

    const revenueToday = sumBy(
      payments.filter((p) => isSameDay(p.paid_at, now)),
      (p) => p.amount,
    );
    const revenueYesterday = sumBy(
      payments.filter((p) => isSameDay(p.paid_at, yesterday)),
      (p) => p.amount,
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
        start: a.created_at,
        end: now.toISOString()
      })),
      "start",
      "end",
    );

    const longWaitCount = countBy(
      waitingAppointments,
      (a) => (now - new Date(a.created_at)) / 60000 > LONG_WAIT_MINUTES,
    );

    return {
      patientsToday,
      appointmentsToday: todaysAppointments.length,
      activeSessionsNow: inSessionNow,
      revenueToday,
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
      },
      _delayedAppointments: delayedAppointments,
      _waitingAppointments: waitingAppointments,
      _longWaitCount: longWaitCount,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todaysAppointments, yesterdaysAppointments, appointments, staff, rooms, devices, payments]);

  // ---- الحالات المتأخرة ----
  const delayedCases = useMemo(
    () =>
      kpis._delayedAppointments
        .map((a) => {
          const delayMinutes = Math.round((now - new Date(a.created_at)) / 60000);
          return {
            id: a.id,
            patientName: a.patient_name ?? "مريض غير معروف",
            doctorName: a.doctor_name ?? staffById.get(a.doctor_id)?.full_name ?? "غير محدد",
            delayMinutes,
            priority: delayMinutes > 60 ? "high" : delayMinutes > 20 ? "medium" : "low",
          };
        })
        .sort((a, b) => b.delayMinutes - a.delayMinutes),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kpis._delayedAppointments, staffById],
  );

  // ---- طابور الانتظار الحي ----
  const avgSessionMinutes = useMemo(
    () => averageDurationMinutes(treatmentSessions, "created_at", "ends_at") ?? DEFAULT_SESSION_MINUTES,
    [treatmentSessions],
  );

  const waitingQueue = useMemo(
    () =>
      [...kpis._waitingAppointments]
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map((a, index) => {
          const waitedMinutes = Math.max(0, Math.round((now - new Date(a.created_at)) / 60000));
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
    [kpis._waitingAppointments, staffById, avgSessionMinutes],
  );

  // ---- حالة الأطباء (المتاح فقط مقابل قيد الجلسة يمكن استنتاجه فعلياً من بيانات المواعيد) ----
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

  // ---- حالة الأجهزة (متاح / قيد الاستخدام فعلياً حسب إشغال الغرفة المرتبطة / صيانة / خارج الخدمة) ----
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

  // ---- تحليلات إضافية ----
  const charts = useMemo(() => {
    const appointmentsByStatusToday = groupCountByField(todaysAppointments, "status").map(
      (item) => ({ name: item.name, value: item.value, color: colorForStatus(item.name) }),
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

    return {
      appointmentsToday: groupCountByHour(todaysAppointments, "created_at", now),
      arrivalsToday: groupCountByHour(todaysAppointments, "created_at", now),
      waitingQueueToday: groupCountByHour(
        appointments.filter((a) => a.status === "Waiting"),
        "created_at",
        now,
      ),
      doctorWorkloadToday: groupCountByHour(
        todaysAppointments.filter((a) => a.status === "InSession" || a.status === "Completed"),
        "created_at",
        now,
      ),
      appointmentGrowth: groupCountByMonth(appointments, "created_at"),
      patientGrowth: groupCountByMonth(patients, "joined_date"),
      appointmentsByStatusToday,
      topServices,
      doctorWorkload,
      peakHour: findPeakHour(appointments, "created_at"),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todaysAppointments, appointments, patients, servicesById, staffById]);

  const alerts = useMemo(
    () =>
      buildOperationalAlerts({
        devices,
        maintenance,
        invoices,
        delayedAppointments: kpis._delayedAppointments,
        longWaitCount: kpis._longWaitCount,
        missedToday: kpis.missedToday,
      }),
    [devices, maintenance, invoices, kpis],
  );

  const centerStatus = useMemo(() => {
    const hasCriticalAlert = alerts.some((a) => a.level === "error");
    if (hasCriticalAlert) return { label: "يحتاج انتباه", tone: "critical" };
    if (kpis.waitingNow + kpis.activeSessionsNow > 4) return { label: "مزدحم", tone: "busy" };
    return { label: "طبيعي", tone: "normal" };
  }, [alerts, kpis.waitingNow, kpis.activeSessionsNow]);

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
    charts,
    alerts,
    centerStatus,
    dailySummary,
  };
}
