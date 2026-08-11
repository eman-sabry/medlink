import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { toast } from "../utils/toast";
import { useAuth } from "./useAuth";
import { usePatients } from "./usePatients";
import { useAppointments } from "./useAppointments";
import { useTreatmentSessions } from "./useTreatmentSessions";
import {
  calculateAge,
  enrichSessions,
  buildPrescriptions,
  enrichFollowUps,
  enrichInternalNotes,
  enrichReassessments,
  enrichPackages,
  enrichInvoices,
  buildPatientStats,
  buildActivityTimeline,
  getDistinctServiceNames,
} from "../helpers/patientProfile.helpers";
import { getPatientCurrentOccupancy } from "../helpers/rooms.helpers";

const EMPTY_ARRAY = [];

function useResource(key, endpoint) {
  return useQuery({
    queryKey: [key],
    queryFn: () => apiRequest(endpoint),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function usePatientProfile(patientId) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    patients,
    updatePatient,
    isUpdating,
    isLoading: patientsLoading,
    isError: patientsError,
    refetch: refetchPatients,
  } = usePatients();

  const {
    appointments: allAppointments,
    doctors,
    addAppointment,
    updateAppointment,
    isLoading: appointmentsLoading,
    isError: appointmentsError,
    refetch: refetchAppointments,
  } = useAppointments();

  const {
    treatmentSessions,
    addNote,
    addPrescription,
    isLoading: sessionsLoading,
    isError: sessionsError,
    refetch: refetchSessions,
  } = useTreatmentSessions();

  const staffQuery = useResource("staff", "/staff");
  const servicesQuery = useResource("services", "/services");
  const roomsQuery = useResource("rooms", "/rooms");
  const bedsQuery = useResource("treatment_beds", "/treatment_beds");
  const medicalHistoryQuery = useResource("patient_medical_history", "/patient_medical_history");
  const followUpsQuery = useResource("follow_ups", "/follow_ups");
  const internalNotesQuery = useResource("internal_notes", "/internal_notes");
  const reassessmentsQuery = useResource("reassessments", "/reassessments");
  const patientPackagesQuery = useResource("patient_packages", "/patient_packages");
  const packageTemplatesQuery = useResource("package-templates", "/package-templates");
  const packageSessionUsagesQuery = useResource("package_session_usages", "/package_session_usages");
  const invoicesQuery = useResource("invoices", "/invoices");
  const paymentsQuery = useResource("payments", "/payments");
  const paymentRefundsQuery = useResource("payment_refunds", "/payment_refunds");

  const addInternalNoteMutation = useMutation({
    mutationFn: ({ content, severity }) =>
      apiRequest("/internal_notes", {
        method: "POST",
        body: JSON.stringify({
          patient_id: patientId,
          author_staff_id: user?.staff_id ?? null,
          severity: severity || "Normal",
          content,
          created_at: new Date().toISOString(),
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internal_notes"] });
      toast.success("تمت إضافة الملاحظة بنجاح");
    },
    onError: () => toast.error("فشلت إضافة الملاحظة"),
  });

  const staffList = staffQuery.data ?? EMPTY_ARRAY;
  const servicesList = servicesQuery.data ?? EMPTY_ARRAY;
  const roomsList = roomsQuery.data ?? EMPTY_ARRAY;
  const bedsList = bedsQuery.data ?? EMPTY_ARRAY;
  const medicalHistoryAll = medicalHistoryQuery.data ?? EMPTY_ARRAY;
  const followUpsAll = followUpsQuery.data ?? EMPTY_ARRAY;
  const internalNotesAll = internalNotesQuery.data ?? EMPTY_ARRAY;
  const reassessmentsAll = reassessmentsQuery.data ?? EMPTY_ARRAY;
  const patientPackagesAll = patientPackagesQuery.data ?? EMPTY_ARRAY;
  const packageTemplates = packageTemplatesQuery.data ?? EMPTY_ARRAY;
  const packageSessionUsages = packageSessionUsagesQuery.data ?? EMPTY_ARRAY;
  const invoicesAll = invoicesQuery.data ?? EMPTY_ARRAY;
  const paymentsAll = paymentsQuery.data ?? EMPTY_ARRAY;
  const paymentRefundsAll = paymentRefundsQuery.data ?? EMPTY_ARRAY;

  const patient = useMemo(
    () => patients.find((p) => p.id === patientId) ?? null,
    [patients, patientId],
  );

  const appointments = useMemo(
    () =>
      allAppointments
        .filter((a) => a.patient_id === patientId)
        .sort((a, b) => new Date(b.starts_at) - new Date(a.starts_at)),
    [allAppointments, patientId],
  );

  const rawSessions = useMemo(
    () => treatmentSessions.filter((s) => s.patient_id === patientId),
    [treatmentSessions, patientId],
  );

  const currentOccupancy = useMemo(
    () => getPatientCurrentOccupancy(patientId, treatmentSessions, roomsList, bedsList),
    [patientId, treatmentSessions, roomsList, bedsList],
  );

  const sessions = useMemo(
    () =>
      enrichSessions(rawSessions, staffList, servicesList, roomsList).sort(
        (a, b) => new Date(b.starts_at) - new Date(a.starts_at),
      ),
    [rawSessions, staffList, servicesList, roomsList],
  );

  const prescriptions = useMemo(
    () => buildPrescriptions(sessions, appointments),
    [sessions, appointments],
  );

  const medicalHistory = useMemo(
    () => medicalHistoryAll.filter((m) => m.patient_id === patientId),
    [medicalHistoryAll, patientId],
  );

  const followUps = useMemo(
    () => enrichFollowUps(followUpsAll.filter((f) => f.patient_id === patientId), staffList),
    [followUpsAll, patientId, staffList],
  );

  const internalNotes = useMemo(
    () => enrichInternalNotes(internalNotesAll.filter((n) => n.patient_id === patientId), staffList),
    [internalNotesAll, patientId, staffList],
  );

  const reassessments = useMemo(
    () => enrichReassessments(reassessmentsAll.filter((r) => r.patient_id === patientId), staffList),
    [reassessmentsAll, patientId, staffList],
  );

  const packages = useMemo(
    () =>
      enrichPackages(
        patientPackagesAll.filter((p) => p.patient_id === patientId),
        packageTemplates,
        packageSessionUsages,
        invoicesAll,
        paymentsAll,
        paymentRefundsAll,
      ),
    [patientPackagesAll, patientId, packageTemplates, packageSessionUsages, invoicesAll, paymentsAll, paymentRefundsAll],
  );

  const invoices = useMemo(() => {
    const patientInvoices = invoicesAll.filter((i) => i.patient_id === patientId);
    return enrichInvoices(patientInvoices, paymentsAll, paymentRefundsAll).sort(
      (a, b) => new Date(b.issued_at ?? 0) - new Date(a.issued_at ?? 0),
    );
  }, [invoicesAll, patientId, paymentsAll, paymentRefundsAll]);

  const stats = useMemo(
    () =>
      patient
        ? buildPatientStats({ patient, appointments, enrichedSessions: sessions, prescriptions, enrichedInvoices: invoices })
        : null,
    [patient, appointments, sessions, prescriptions, invoices],
  );

  const activityTimeline = useMemo(
    () =>
      patient
        ? buildActivityTimeline({ patient, appointments, enrichedSessions: sessions, enrichedInvoices: invoices, followUps })
        : EMPTY_ARRAY,
    [patient, appointments, sessions, invoices, followUps],
  );

  const age = useMemo(() => (patient ? calculateAge(patient.date_of_birth) : null), [patient]);

  const services = useMemo(
    () => getDistinctServiceNames(appointments, sessions),
    [appointments, sessions],
  );

  const isLoading =
    patientsLoading ||
    appointmentsLoading ||
    sessionsLoading ||
    staffQuery.isLoading ||
    servicesQuery.isLoading ||
    roomsQuery.isLoading ||
    bedsQuery.isLoading ||
    medicalHistoryQuery.isLoading ||
    followUpsQuery.isLoading ||
    internalNotesQuery.isLoading ||
    reassessmentsQuery.isLoading ||
    patientPackagesQuery.isLoading ||
    packageTemplatesQuery.isLoading ||
    packageSessionUsagesQuery.isLoading ||
    invoicesQuery.isLoading ||
    paymentsQuery.isLoading ||
    paymentRefundsQuery.isLoading;

  const isError = patientsError || appointmentsError || sessionsError;

  const refetch = () => {
    refetchPatients();
    refetchAppointments();
    refetchSessions();
    staffQuery.refetch();
    servicesQuery.refetch();
    roomsQuery.refetch();
    bedsQuery.refetch();
    medicalHistoryQuery.refetch();
    followUpsQuery.refetch();
    internalNotesQuery.refetch();
    reassessmentsQuery.refetch();
    patientPackagesQuery.refetch();
    packageTemplatesQuery.refetch();
    packageSessionUsagesQuery.refetch();
    invoicesQuery.refetch();
    paymentsQuery.refetch();
    paymentRefundsQuery.refetch();
  };

  return {
    isLoading,
    isError,
    refetch,
    patient,
    age,
    doctors,
    staffList,
    appointments,
    sessions,
    currentOccupancy,
    medicalHistory,
    followUps,
    internalNotes,
    reassessments,
    packages,
    invoices,
    services,
    prescriptions,
    stats,
    activityTimeline,
    updatePatient,
    isUpdating,
    addAppointment,
    updateAppointment,
    addNote,
    addPrescription,
    addInternalNote: addInternalNoteMutation.mutateAsync,
    isAddingNote: addInternalNoteMutation.isPending,
  };
}
