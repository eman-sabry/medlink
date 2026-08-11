import { useMemo } from "react";
import { useAppointments } from "./useAppointments";
import { usePatients } from "./usePatients";
import { countBy } from "../utils/stats";
import {
  groupCountByField,
  groupCountByMonth,
  groupCountByWeekday,
  isSameDay,
} from "../utils/dashboardStats";
import { colorForStatus } from "../components/charts/chartColors";
import { APPOINTMENT_STATUS_LABELS, PATIENT_STATUS_LABELS } from "../helpers/dashboardLabels";

export function useSecretaryDashboard() {
  const {
    appointments,
    doctors,
    isLoading: isAppointmentsLoading,
    addAppointment,
    updateAppointment,
  } = useAppointments();
  const { patients, isLoading: isPatientsLoading } = usePatients();

  const today = new Date();

  const todaysAppointments = useMemo(
    () => appointments.filter((a) => isSameDay(a.starts_at, today)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appointments],
  );

  const waitingPatients = useMemo(
    () => appointments.filter((a) => a.status === "Waiting"),
    [appointments],
  );

  const newPatients = useMemo(
    () =>
      [...patients]
        .sort((a, b) => new Date(b.joined_date ?? 0) - new Date(a.joined_date ?? 0))
        .slice(0, 6),
    [patients],
  );

  const recentBookings = useMemo(
    () =>
      [...appointments]
        .sort((a, b) => new Date(b.created_at ?? 0) - new Date(a.created_at ?? 0))
        .slice(0, 6),
    [appointments],
  );

  const doctorSchedule = useMemo(
    () =>
      doctors.map((doctor) => ({
        ...doctor,
        todaysAppointmentsCount: countBy(
          todaysAppointments,
          (a) => a.doctor_id === doctor.id,
        ),
      })),
    [doctors, todaysAppointments],
  );

  const stats = useMemo(
    () => ({
      todaysCount: todaysAppointments.length,
      waitingCount: waitingPatients.length,
      totalPatients: patients.length,
      totalDoctors: doctors.length,
    }),
    [todaysAppointments, waitingPatients, patients, doctors],
  );

  const charts = useMemo(
    () => ({
      dailyAppointments: groupCountByWeekday(appointments, "starts_at"),
      weeklyPatients: groupCountByWeekday(patients, "joined_date"),
      waitingTime: groupCountByWeekday(waitingPatients, "starts_at"),
      appointmentStatus: groupCountByField(appointments, "status").map((item) => ({
        name: APPOINTMENT_STATUS_LABELS[item.name] ?? item.name,
        value: item.value,
        color: colorForStatus(item.name),
      })),
      patientStatus: groupCountByField(patients, "status").map((item) => ({
        name: PATIENT_STATUS_LABELS[item.name] ?? item.name,
        value: item.value,
        color: colorForStatus(item.name),
      })),
      newPatientsTrend: groupCountByMonth(patients, "joined_date"),
    }),
    [appointments, patients, waitingPatients],
  );

  return {
    isLoading: isAppointmentsLoading || isPatientsLoading,
    stats,
    charts,
    todaysAppointments,
    waitingPatients,
    newPatients,
    recentBookings,
    doctorSchedule,
    patients,
    doctors,
    addAppointment,
    updateAppointment,
  };
}
