import { useMemo } from "react";
import { useAuth } from "./useAuth";
import { useDoctorSessions } from "./useDoctorSessions";
import { useTreatmentSessions } from "./useTreatmentSessions";
import { groupCountByField, groupCountByWeekday, isSameDay } from "../utils/dashboardStats";
import { isInProgressStatus } from "../helpers/appointmentStatus.helpers";
import { getSessionActualRange } from "../helpers/patientProfile.helpers";

export function useDoctorDashboard() {
  const { user } = useAuth();
  const doctorStaffId = user?.staff_id;

  const {
    allAppointments,
    handleStartSession,
    handleCompleteSession,
    startingAppointmentId,
    completingAppointmentId,
    isLoading: isSessionsLoading,
  } = useDoctorSessions();

  const { treatmentSessions, isLoading: isTreatmentLoading } = useTreatmentSessions();

  const myAppointments = useMemo(
    () => allAppointments.filter((a) => a.doctor_id === doctorStaffId),
    [allAppointments, doctorStaffId],
  );

  const myTreatmentSessions = useMemo(
    () => treatmentSessions.filter((s) => s.doctor_id === doctorStaffId),
    [treatmentSessions, doctorStaffId],
  );

  const today = new Date();

  const todaysPatients = useMemo(
    () => myAppointments.filter((a) => isSameDay(a.starts_at, today)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [myAppointments],
  );

  const currentSession = useMemo(
    () => myAppointments.find((a) => isInProgressStatus(a.status)) ?? null,
    [myAppointments],
  );

  const upcomingSessions = useMemo(
    () =>
      myAppointments
        .filter((a) => a.status === "Scheduled" || a.status === "Waiting")
        .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at)),
    [myAppointments],
  );

  const completedSessions = useMemo(
    () => myAppointments.filter((a) => a.status === "Completed"),
    [myAppointments],
  );

  const stats = useMemo(
    () => ({
      todaysCount: todaysPatients.length,
      upcomingCount: upcomingSessions.length,
      completedCount: completedSessions.length,
      hasActiveSession: Boolean(currentSession),
    }),
    [todaysPatients, upcomingSessions, completedSessions, currentSession],
  );

  const charts = useMemo(() => {
    const workingHoursByWeekday = new Array(7).fill(0);
    const weekdayLabels = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    myTreatmentSessions.forEach((session) => {
      const { start, end } = getSessionActualRange(session);
      if (!start || !end) return;
      workingHoursByWeekday[start.getDay()] += (end - start) / (1000 * 60 * 60);
    });

    const diagnosisSessions = myTreatmentSessions
      .filter((s) => s.prescription?.diagnosis)
      .map((s) => ({ diagnosis: s.prescription.diagnosis }));

    return {
      dailyPatients: groupCountByWeekday(myAppointments, "starts_at"),
      workingHours: weekdayLabels.map((day, i) => ({
        day,
        hours: Number(workingHoursByWeekday[i].toFixed(1)),
      })),
      completedSessions: groupCountByWeekday(completedSessions, "starts_at"),
      diagnosisStatistics: groupCountByField(diagnosisSessions, "diagnosis"),
    };
  }, [myAppointments, myTreatmentSessions, completedSessions]);

  return {
    isLoading: isSessionsLoading || isTreatmentLoading,
    stats,
    charts,
    todaysPatients,
    currentSession,
    upcomingSessions,
    completedSessions,
    handleStartSession,
    handleCompleteSession,
    startingAppointmentId,
    completingAppointmentId,
    myTreatmentSessions,
  };
}
