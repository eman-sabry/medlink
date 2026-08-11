import {
    useState,
    useMemo
} from "react";
import {
    useQuery,
    useMutation,
    useQueryClient
} from "@tanstack/react-query";
import {
    apiRequest
} from "../api/client";
import {
    toast
} from "../utils/toast";
import {
    useInvoices
} from "./useInvoices";
import { useAuth } from "./useAuth";
import {
    ensureTreatmentSessionForAppointment,
    startTreatmentSession,
    completeTreatmentSession,
    invalidateOccupancyQueries,
} from "./useRooms";
import { resolvePackageCoverage } from "./usePatientPackages";
import { logActivity, ACTIVITY_ACTIONS } from "../helpers/activityLog.helpers";
import { sessionDurationMinutes, sessionDurationSeconds } from "../helpers/patientProfile.helpers";
import { computeNetPaid, computePaymentStatus } from "../utils/billing";
import { countBy } from "../utils/stats";
import { IN_PROGRESS_STATUSES, COMPLETED_STATUSES, WAITING_STATUSES, normalizeStatus } from "../helpers/appointmentStatus.helpers";

const EMPTY_ARRAY = [];

export function useDoctorSessions() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { invoices } = useInvoices();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [activeTab, setActiveTab] = useState("In-Progress");

    const doctorSessionsQuery = useQuery({
        queryKey: ["doctor-sessions"],
        queryFn: () => apiRequest("/appointments"),
        refetchOnWindowFocus: false,
    });

    const patientsQuery = useQuery({
        queryKey: ["patients"],
        queryFn: () => apiRequest("/patients"),
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    });

    const staffQuery = useQuery({
        queryKey: ["staff"],
        queryFn: () => apiRequest("/staff"),
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    });

    const roomsQuery = useQuery({
        queryKey: ["rooms"],
        queryFn: () => apiRequest("/rooms"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
    const bedsQuery = useQuery({
        queryKey: ["treatment_beds"],
        queryFn: () => apiRequest("/treatment_beds"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
    const treatmentSessionsQuery = useQuery({
        queryKey: ["treatment_sessions"],
        queryFn: () => apiRequest("/treatment_sessions"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    const packageSessionUsagesQuery = useQuery({
        queryKey: ["package_session_usages"],
        queryFn: () => apiRequest("/package_session_usages"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
    const patientPackagesQuery = useQuery({
        queryKey: ["patient_packages"],
        queryFn: () => apiRequest("/patient_packages"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
    const packageTemplatesQuery = useQuery({
        queryKey: ["package-templates"],
        queryFn: () => apiRequest("/package-templates"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
    const paymentsQuery = useQuery({
        queryKey: ["payments"],
        queryFn: () => apiRequest("/payments"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
    const paymentRefundsQuery = useQuery({
        queryKey: ["payment_refunds"],
        queryFn: () => apiRequest("/payment_refunds"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    const rawAppointments = doctorSessionsQuery.data ?? [];
    const patientsList = patientsQuery.data ?? [];
    const staffList = staffQuery.data ?? [];
    const roomsList = roomsQuery.data ?? [];
    const bedsList = bedsQuery.data ?? [];
    const treatmentSessionsList = treatmentSessionsQuery.data ?? [];
    const packageSessionUsagesList = packageSessionUsagesQuery.data ?? EMPTY_ARRAY;
    const patientPackagesList = patientPackagesQuery.data ?? EMPTY_ARRAY;
    const packageTemplatesList = packageTemplatesQuery.data ?? EMPTY_ARRAY;
    const paymentsList = paymentsQuery.data ?? EMPTY_ARRAY;
    const paymentRefundsList = paymentRefundsQuery.data ?? EMPTY_ARRAY;

    const startSessionMutation = useMutation({
        mutationFn: async ({ app, initialNotes }) => {
            const treatmentSession = await ensureTreatmentSessionForAppointment(app);
            if (treatmentSession.status === "InSession") {
                const error = new Error("هذه الجلسة قيد التنفيذ بالفعل");
                error.code = "ALREADY_IN_SESSION";
                throw error;
            }
            await startTreatmentSession(queryClient, {
                treatmentSession,
                appointment: { ...app, notes: initialNotes },
            });
            return treatmentSession;
        },
        onSuccess: (treatmentSession, { app }) => {
            invalidateOccupancyQueries(queryClient);
            logActivity({
                action: ACTIVITY_ACTIONS.SESSION_STARTED,
                actorUserId: user?.id,
                patientId: app.patient_id,
                entityType: "session",
                entityId: treatmentSession.id,
                details: "بدء الجلسة من صفحة الجلسات",
            });
            toast.success("تم بدء الجلسة بنجاح");
        },
        onError: (error) => {
            console.error("خطأ أثناء بدء الجلسة:", error);
            toast.error(error.message || "فشل بدء الجلسة");
        },
    });

    const handleStartSession = (app, initialNotes = "تم بدء الجلسة") => {
        if (startSessionMutation.isPending) return;
        startSessionMutation.mutate({ app, initialNotes });
    };

    const completeSessionMutation = useMutation({
        mutationFn: async ({ appointmentId, prescriptionData }) => {
            const rawData = queryClient.getQueryData(["doctor-sessions"]) || [];
            const targetApp = rawData.find((app) => app.id === appointmentId);
            if (!targetApp) throw new Error("لم يتم العثور على بيانات الموعد");
            if (targetApp.status === "Completed") {
                const error = new Error("هذه الجلسة مكتملة بالفعل");
                error.code = "ALREADY_COMPLETED";
                throw error;
            }

            const treatmentSession = await ensureTreatmentSessionForAppointment(targetApp);
            const appointmentWithPrescription = { ...targetApp, prescription: prescriptionData };
            await completeTreatmentSession(queryClient, {
                treatmentSession,
                appointment: appointmentWithPrescription,
            });
            return { treatmentSession, appointment: appointmentWithPrescription };
        },
        onSuccess: ({ treatmentSession, appointment }) => {
            invalidateOccupancyQueries(queryClient);
            logActivity({
                action: ACTIVITY_ACTIONS.SESSION_ENDED,
                actorUserId: user?.id,
                patientId: appointment.patient_id,
                entityType: "session",
                entityId: treatmentSession.id,
                details: "إنهاء الجلسة من صفحة الجلسات",
            });
            toast.success("تم إنهاء الجلسة بنجاح");
            resolvePackageCoverage(queryClient, {
                appointment,
                treatmentSession,
                actorUserId: user?.id,
            }).catch((error) => {
                console.error("فشل التحقق من اشتراك الباقة لهذه الجلسة:", error);
                toast.error("تعذّر التحقق من اشتراك الباقة لهذا المريض — راجع الفوترة يدوياً قبل إنشاء أي فاتورة");
            });
        },
        onError: (error) => {
            if (error.code !== "ALREADY_COMPLETED") console.error("فشل إتمام الجلسة:", error);
            toast.error(error.message || "فشل إتمام الجلسة");
        },
    });

    const handleCompleteSession = (sessionId, appointmentId, prescriptionData) => {
        if (completeSessionMutation.isPending) return;
        completeSessionMutation.mutate({ appointmentId, prescriptionData });
    };

    const enrichedAppointments = useMemo(() => {
        function computeSessionBilling(app, matchedSession) {
            const usage = matchedSession
                ? packageSessionUsagesList.find((u) => u.treatment_session_id === matchedSession.id && !u.reversed_at)
                : null;
            if (usage) {
                const pkg = patientPackagesList.find((p) => p.id === usage.patient_package_id);
                const template = pkg ? packageTemplatesList.find((t) => t.id === pkg.package_template_id) : null;
                return { type: "Package", packageName: template?.name ?? "باقة غير معروفة" };
            }

            const relatedInvoice = invoices.find((i) => i.appointment_id === app.id);
            if (relatedInvoice) {
                const netPaid = computeNetPaid(paymentsList.filter((p) => p.invoice_id === relatedInvoice.id), paymentRefundsList);
                const paymentStatus = computePaymentStatus({ total: relatedInvoice.total_amount ?? 0, netPaid });
                return { type: "Individual", invoiceNo: relatedInvoice.invoice_no, paymentStatus };
            }

            if (app.billing_type === "Package") {
                const pkg = patientPackagesList.find((p) => p.id === app.package_subscription_id);
                return { type: "Package", packageName: pkg ? packageTemplatesList.find((t) => t.id === pkg.package_template_id)?.name ?? "باقة" : "باقة" };
            }
            if (app.billing_type === "Individual") {
                return { type: "Individual", invoiceNo: null, paymentStatus: null };
            }

            if (normalizeStatus(app.status) !== "Completed") return null;
            return { type: "Individual", invoiceNo: null, paymentStatus: null };
        }

        return rawAppointments.map((app) => {
            const matchedPatient = patientsList.find((p) => p.id === app.patient_id);
            const matchedDoctor = staffList.find((s) => s.id === app.doctor_id);
            const matchedSession = treatmentSessionsList.find((s) => s.appointment_id === app.id);
            const matchedRoom = matchedSession?.room_id ? roomsList.find((r) => r.id === matchedSession.room_id) : null;
            const matchedBed = matchedSession?.bed_id ? bedsList.find((b) => b.id === matchedSession.bed_id) : null;

            return {
                ...app,
                patient_name: matchedPatient ?.full_name || app.patient_name || "مريض غير معروف",
                doctor_name: matchedDoctor ?.full_name || app.doctor_name || "طبيب غير محدد",
                patient_phone: matchedPatient ?.phone || app.patient_phone || "",
                patient_file_no: matchedPatient ?.file_no || app.patient_file_no || "",
                room_name: matchedRoom?.name || app.room_name || "غرفة غير محددة",
                bed_name: matchedBed?.label || null,
                service_name: app.service_name || "جلسة علاجية",
                durationMinutes: matchedSession ? sessionDurationMinutes(matchedSession) : null,
                durationSeconds: matchedSession ? sessionDurationSeconds(matchedSession) : null,
                actual_started_at: matchedSession?.actual_started_at || app.actual_started_at || null,
                actual_ended_at: matchedSession?.actual_ended_at || app.actual_ended_at || null,
                billing: computeSessionBilling(app, matchedSession),
            };
        });
    }, [
        rawAppointments,
        patientsList,
        staffList,
        treatmentSessionsList,
        roomsList,
        bedsList,
        packageSessionUsagesList,
        patientPackagesList,
        packageTemplatesList,
        invoices,
        paymentsList,
        paymentRefundsList,
    ]);

    const filteredAppointments = useMemo(() => {
        return enrichedAppointments.filter((app) => {
            const status = normalizeStatus(app.status);
            const isRelevant =
                IN_PROGRESS_STATUSES.includes(status) || COMPLETED_STATUSES.includes(status) || WAITING_STATUSES.includes(status);
            if (!isRelevant) return false;

            let matchesTab = true;
            if (activeTab === "Waiting") {
                matchesTab = WAITING_STATUSES.includes(status);
            } else if (activeTab === "In-Progress" || activeTab === "InSession") {
                matchesTab = IN_PROGRESS_STATUSES.includes(status);
            } else if (activeTab === "Completed") {
                matchesTab = COMPLETED_STATUSES.includes(status);
            }

            const matchesSearch =
                app.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                String(app.patient_file_no).toLowerCase().includes(searchQuery.toLowerCase()) ||
                String(app.patient_phone).includes(searchQuery);

            const appDate = app.appointment_date || app.starts_at ?.split("T")[0];
            const matchesDate = selectedDate ? appDate === selectedDate : true;

            return matchesTab && matchesSearch && matchesDate;
        });
    }, [enrichedAppointments, activeTab, searchQuery, selectedDate]);

    const stats = useMemo(() => {
        const started = enrichedAppointments.filter((app) => {
            const status = normalizeStatus(app.status);
            return IN_PROGRESS_STATUSES.includes(status) || COMPLETED_STATUSES.includes(status) || WAITING_STATUSES.includes(status);
        });
        return {
            waiting: countBy(started, (app) => WAITING_STATUSES.includes(normalizeStatus(app.status))),
            inProgress: countBy(started, (app) => IN_PROGRESS_STATUSES.includes(normalizeStatus(app.status))),
            completed: countBy(started, (app) => COMPLETED_STATUSES.includes(normalizeStatus(app.status))),
            total: started.length,
        };
    }, [enrichedAppointments]);

    return {
        appointments: filteredAppointments,
        allAppointments: enrichedAppointments,
        stats,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedDate,
        setSelectedDate,
        handleStartSession,
        handleCompleteSession,
        startingAppointmentId: startSessionMutation.isPending ? startSessionMutation.variables?.app?.id : null,
        completingAppointmentId: completeSessionMutation.isPending
            ? completeSessionMutation.variables?.appointmentId
            : null,
        isLoading:
            doctorSessionsQuery.isLoading ||
            roomsQuery.isLoading ||
            bedsQuery.isLoading ||
            treatmentSessionsQuery.isLoading,
        isError: doctorSessionsQuery.isError,
        refetch: doctorSessionsQuery.refetch,
    };
}
