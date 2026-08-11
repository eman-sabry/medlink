import { useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { toast } from "../utils/toast";
import { useAuth } from "./useAuth";
import { useInvoices } from "./useInvoices";
import { useTreatmentSessions } from "./useTreatmentSessions";
import {
  ensureTreatmentSessionForAppointment,
  startTreatmentSession,
  completeTreatmentSession,
  assertBedAvailable,
  occupyBedAndRoom,
  releaseBedAndRoom,
  invalidateOccupancyQueries,
} from "./useRooms";
import { resolvePackageCoverage } from "./usePatientPackages";
import { logActivity, ACTIVITY_ACTIONS } from "../helpers/activityLog.helpers";
import { enrichPackages, enrichSessions, sessionDurationMinutes, sessionDurationSeconds } from "../helpers/patientProfile.helpers";
import { ROLES } from "../permissions/roles";

const EMPTY_ARRAY = [];

function useResource(key, endpoint) {
  return useQuery({
    queryKey: [key],
    queryFn: () => apiRequest(endpoint),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useSessionDetails(appointmentId) {
  const queryClient = useQueryClient();
  const { user, role } = useAuth();
  const ensuredRef = useRef(false);

  const appointmentsQuery = useResource("appointments", "/appointments");
  const treatmentSessionsQuery = useResource("treatment_sessions", "/treatment_sessions");
  const patientsQuery = useResource("patients", "/patients");
  const staffQuery = useResource("staff", "/staff");
  const servicesQuery = useResource("services", "/services");
  const roomsQuery = useResource("rooms", "/rooms");
  const bedsQuery = useResource("treatment_beds", "/treatment_beds");
  const patientPackagesQuery = useResource("patient_packages", "/patient_packages");
  const packageTemplatesQuery = useResource("package-templates", "/package-templates");
  const packageSessionUsagesQuery = useResource("package_session_usages", "/package_session_usages");
  const usersQuery = useResource("users", "/users");
  const auditLogsQuery = useResource("audit_logs", "/audit_logs");
  const medicalHistoryQuery = useResource("patient_medical_history", "/patient_medical_history");
  const paymentsQuery = useResource("payments", "/payments");
  const paymentRefundsQuery = useResource("payment_refunds", "/payment_refunds");

  const { invoices } = useInvoices();
  const { addPrescription: savePrescriptionMutation } = useTreatmentSessions();

  const appointments = appointmentsQuery.data ?? EMPTY_ARRAY;
  const treatmentSessions = treatmentSessionsQuery.data ?? EMPTY_ARRAY;
  const patients = patientsQuery.data ?? EMPTY_ARRAY;
  const staff = staffQuery.data ?? EMPTY_ARRAY;
  const services = servicesQuery.data ?? EMPTY_ARRAY;
  const rooms = roomsQuery.data ?? EMPTY_ARRAY;
  const beds = bedsQuery.data ?? EMPTY_ARRAY;
  const patientPackagesAll = patientPackagesQuery.data ?? EMPTY_ARRAY;
  const packageTemplates = packageTemplatesQuery.data ?? EMPTY_ARRAY;
  const packageSessionUsages = packageSessionUsagesQuery.data ?? EMPTY_ARRAY;
  const users = usersQuery.data ?? EMPTY_ARRAY;
  const auditLogs = auditLogsQuery.data ?? EMPTY_ARRAY;
  const medicalHistoryAll = medicalHistoryQuery.data ?? EMPTY_ARRAY;
  const payments = paymentsQuery.data ?? EMPTY_ARRAY;
  const paymentRefunds = paymentRefundsQuery.data ?? EMPTY_ARRAY;

  const appointment = useMemo(
    () => appointments.find((a) => a.id === appointmentId) ?? null,
    [appointments, appointmentId],
  );
  const treatmentSession = useMemo(
    () => treatmentSessions.find((s) => s.appointment_id === appointmentId) ?? null,
    [treatmentSessions, appointmentId],
  );

  const patient = useMemo(() => patients.find((p) => p.id === appointment?.patient_id) ?? null, [patients, appointment]);
  const doctor = useMemo(() => staff.find((s) => s.id === appointment?.doctor_id) ?? null, [staff, appointment]);
  const service = useMemo(() => services.find((s) => s.id === appointment?.service_id) ?? null, [services, appointment]);
  const room = useMemo(() => rooms.find((r) => r.id === treatmentSession?.room_id) ?? null, [rooms, treatmentSession]);
  const bed = useMemo(() => beds.find((b) => b.id === treatmentSession?.bed_id) ?? null, [beds, treatmentSession]);

  const durationMinutes = useMemo(
    () => (treatmentSession ? sessionDurationMinutes(treatmentSession) : null),
    [treatmentSession],
  );
  const durationSeconds = useMemo(
    () => (treatmentSession ? sessionDurationSeconds(treatmentSession) : null),
    [treatmentSession],
  );

  const isOwnSession = role !== ROLES.DOCTOR || !appointment || appointment.doctor_id === user?.staff_id;

  const ensureTreatmentSessionMutation = useMutation({
    mutationFn: (app) => ensureTreatmentSessionForAppointment(app),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["treatment_sessions"] }),
    onError: () => {
      ensuredRef.current = false;
    },
  });

  useEffect(() => {
    if (!appointment || treatmentSession || ensuredRef.current) return;
    if (treatmentSessionsQuery.isLoading || ensureTreatmentSessionMutation.isPending) return;
    ensuredRef.current = true;
    ensureTreatmentSessionMutation.mutate(appointment);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointment, treatmentSession, treatmentSessionsQuery.isLoading]);

  const enrichedPackagesForPatient = useMemo(() => {
    if (!appointment) return EMPTY_ARRAY;
    return enrichPackages(
      patientPackagesAll.filter((p) => p.patient_id === appointment.patient_id),
      packageTemplates,
      packageSessionUsages,
      invoices,
      payments,
      paymentRefunds,
    );
  }, [patientPackagesAll, appointment, packageTemplates, packageSessionUsages, invoices, payments, paymentRefunds]);

  const patientPackages = useMemo(
    () => enrichedPackagesForPatient.filter((pkg) => pkg.computedStatus === "Active"),
    [enrichedPackagesForPatient],
  );

  const existingUsageForSession = useMemo(
    () =>
      treatmentSession
        ? packageSessionUsages.find((u) => u.treatment_session_id === treatmentSession.id && !u.reversed_at) ?? null
        : null,
    [packageSessionUsages, treatmentSession],
  );

  const coveringPackageForSession = useMemo(
    () =>
      existingUsageForSession
        ? enrichedPackagesForPatient.find((pkg) => pkg.id === existingUsageForSession.patient_package_id) ?? null
        : null,
    [existingUsageForSession, enrichedPackagesForPatient],
  );

  const invoice = useMemo(() => invoices.find((i) => i.appointment_id === appointmentId) ?? null, [invoices, appointmentId]);

  const medicalHistory = useMemo(
    () => (appointment ? medicalHistoryAll.filter((m) => m.patient_id === appointment.patient_id) : EMPTY_ARRAY),
    [medicalHistoryAll, appointment],
  );

  const previousSessions = useMemo(
    () =>
      appointment
        ? enrichSessions(
            treatmentSessions.filter((s) => s.patient_id === appointment.patient_id && s.id !== treatmentSession?.id),
            staff,
            services,
            rooms,
          ).sort((a, b) => new Date(b.starts_at ?? 0) - new Date(a.starts_at ?? 0))
        : EMPTY_ARRAY,
    [treatmentSessions, appointment, treatmentSession, staff, services, rooms],
  );

  const sessionActivity = useMemo(() => {
    if (!treatmentSession && !appointmentId) return EMPTY_ARRAY;
    const usersById = new Map(users.map((u) => [u.id, u]));
    return auditLogs
      .filter((l) => l.entity_type === "session" && (l.entity_id === treatmentSession?.id || l.entity_id === appointmentId))
      .map((l) => ({ ...l, actorName: usersById.get(l.actor_user_id)?.full_name ?? "—" }))
      .sort((a, b) => new Date(b.created_at ?? 0) - new Date(a.created_at ?? 0));
  }, [auditLogs, treatmentSession, appointmentId, users]);

  const startSessionMutation = useMutation({
    mutationFn: async () => {
      if (!appointment || !treatmentSession) throw new Error("الجلسة غير جاهزة بعد، حاول مجدداً خلال لحظات");
      if (appointment.status === "Completed") throw new Error("لا يمكن بدء جلسة مكتملة بالفعل");
      if (treatmentSession.bed_id) await assertBedAvailable(treatmentSession.bed_id, { exceptSessionId: treatmentSession.id });

      await startTreatmentSession(queryClient, { treatmentSession, appointment });

      logActivity({
        action: ACTIVITY_ACTIONS.SESSION_STARTED,
        actorUserId: user?.id,
        patientId: appointment.patient_id,
        entityType: "session",
        entityId: treatmentSession.id,
        details: `بدء الجلسة الساعة ${new Date().toISOString()}`,
      });
    },
    onSuccess: () => {
      invalidateOccupancyQueries(queryClient);
      toast.success("تم بدء الجلسة بنجاح");
    },
    onError: (error) => toast.error(error.message || "فشل بدء الجلسة"),
  });

  const endSessionMutation = useMutation({
    mutationFn: async () => {
      if (!appointment || !treatmentSession) throw new Error("الجلسة غير جاهزة بعد، حاول مجدداً خلال لحظات");
      if (appointment.status === "Completed") throw new Error("هذه الجلسة مكتملة بالفعل");

      await completeTreatmentSession(queryClient, { treatmentSession, appointment });

      logActivity({
        action: ACTIVITY_ACTIONS.SESSION_ENDED,
        actorUserId: user?.id,
        patientId: appointment.patient_id,
        entityType: "session",
        entityId: treatmentSession.id,
        details: `انتهاء الجلسة الساعة ${new Date().toISOString()}`,
      });
    },
    onSuccess: async () => {
      invalidateOccupancyQueries(queryClient);
      toast.success("تم إنهاء الجلسة بنجاح");
      try {
        await resolvePackageCoverage(queryClient, { appointment, treatmentSession, actorUserId: user?.id });
      } catch (error) {
        console.error("فشل التحقق من اشتراك الباقة لهذه الجلسة:", error);
        toast.error("تعذّر التحقق من اشتراك الباقة لهذا المريض — راجع الفوترة يدوياً قبل إنشاء أي فاتورة");
      }
    },
    onError: (error) => toast.error(error.message || "فشل إنهاء الجلسة"),
  });

  const saveClinicalNotesMutation = useMutation({
    mutationFn: async (clinicalNotes) => {
      if (!treatmentSession) throw new Error("الجلسة غير جاهزة بعد");
      return apiRequest(`/treatment_sessions/${treatmentSession.id}`, {
        method: "PATCH",
        body: JSON.stringify({ clinical_notes: clinicalNotes, updated_at: new Date().toISOString() }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment_sessions"] });
      toast.success("تم حفظ المعلومات السريرية بنجاح");
      logActivity({
        action: ACTIVITY_ACTIONS.CLINICAL_NOTES_UPDATED,
        actorUserId: user?.id,
        patientId: appointment?.patient_id,
        entityType: "session",
        entityId: treatmentSession?.id,
      });
    },
    onError: () => toast.error("فشل حفظ المعلومات السريرية"),
  });

  const savePrescriptionInternal = useMutation({
    mutationFn: async (prescription) => {
      if (!treatmentSession) throw new Error("الجلسة غير جاهزة بعد");
      return savePrescriptionMutation({ id: treatmentSession.id, prescription });
    },
    onSuccess: (_, prescription) => {
      logActivity({
        action: ACTIVITY_ACTIONS.PRESCRIPTION_SAVED,
        actorUserId: user?.id,
        patientId: appointment?.patient_id,
        entityType: "session",
        entityId: treatmentSession?.id,
        details: prescription?.diagnosis,
      });
    },
  });

  const assignRoomMutation = useMutation({
    mutationFn: async (roomId) => {
      if (!treatmentSession) throw new Error("الجلسة غير جاهزة بعد");
      if (roomId === treatmentSession.room_id) return;

      const previousBedId = treatmentSession.bed_id;
      const previousRoomId = treatmentSession.room_id;

      await apiRequest(`/treatment_sessions/${treatmentSession.id}`, {
        method: "PATCH",
        body: JSON.stringify({ room_id: roomId, bed_id: null, updated_at: new Date().toISOString() }),
      });

      if (previousBedId) {
        await releaseBedAndRoom(queryClient, { roomId: previousRoomId, bedId: previousBedId });
      }

      logActivity({
        action: ACTIVITY_ACTIONS.ROOM_ASSIGNED,
        actorUserId: user?.id,
        patientId: appointment?.patient_id,
        entityType: "session",
        entityId: treatmentSession.id,
      });
    },
    onSuccess: () => {
      invalidateOccupancyQueries(queryClient);
      toast.success("تم تحديث الغرفة بنجاح");
    },
    onError: (error) => toast.error(error.message || "فشل تحديث الغرفة"),
  });

  const assignBedMutation = useMutation({
    mutationFn: async (bedId) => {
      if (!treatmentSession) throw new Error("الجلسة غير جاهزة بعد");
      if (bedId === treatmentSession.bed_id) return;

      const bed = await apiRequest(`/treatment_beds/${bedId}`);
      if (!bed) throw new Error("لم يتم العثور على هذا السرير");
      await assertBedAvailable(bedId, { exceptSessionId: treatmentSession.id });

      const previousBedId = treatmentSession.bed_id;
      const previousRoomId = treatmentSession.room_id;

      await apiRequest(`/treatment_sessions/${treatmentSession.id}`, {
        method: "PATCH",
        body: JSON.stringify({ room_id: bed.room_id, bed_id: bedId, updated_at: new Date().toISOString() }),
      });

      if (previousBedId && previousBedId !== bedId) {
        await releaseBedAndRoom(queryClient, { roomId: previousRoomId, bedId: previousBedId });
      }
      await occupyBedAndRoom(queryClient, { roomId: bed.room_id, bedId });

      logActivity({
        action: ACTIVITY_ACTIONS.BED_ASSIGNED,
        actorUserId: user?.id,
        patientId: appointment?.patient_id,
        entityType: "session",
        entityId: treatmentSession.id,
        details: "تعيين سرير من تفاصيل الجلسة",
      });
    },
    onSuccess: () => {
      invalidateOccupancyQueries(queryClient);
      toast.success("تم تحديث السرير بنجاح");
    },
    onError: (error) => toast.error(error.message || "فشل تحديث السرير"),
  });

  const isLoading =
    appointmentsQuery.isLoading ||
    treatmentSessionsQuery.isLoading ||
    patientsQuery.isLoading ||
    staffQuery.isLoading ||
    servicesQuery.isLoading ||
    roomsQuery.isLoading ||
    bedsQuery.isLoading ||
    patientPackagesQuery.isLoading ||
    packageTemplatesQuery.isLoading ||
    packageSessionUsagesQuery.isLoading ||
    usersQuery.isLoading ||
    auditLogsQuery.isLoading ||
    medicalHistoryQuery.isLoading ||
    paymentsQuery.isLoading ||
    paymentRefundsQuery.isLoading;

  return {
    isLoading,
    appointment,
    treatmentSession,
    patient,
    doctor,
    service,
    room,
    bed,
    rooms,
    beds,
    durationMinutes,
    durationSeconds,
    isOwnSession,
    patientPackages,
    coveringPackageForSession,
    medicalHistory,
    existingUsageForSession,
    invoice,
    previousSessions,
    sessionActivity,
    startSession: startSessionMutation.mutateAsync,
    isStarting: startSessionMutation.isPending,
    endSession: endSessionMutation.mutateAsync,
    isEnding: endSessionMutation.isPending,
    saveClinicalNotes: saveClinicalNotesMutation.mutateAsync,
    isSavingClinicalNotes: saveClinicalNotesMutation.isPending,
    savePrescription: savePrescriptionInternal.mutateAsync,
    isSavingPrescription: savePrescriptionInternal.isPending,
    assignRoom: assignRoomMutation.mutateAsync,
    assignBed: assignBedMutation.mutateAsync,
  };
}
