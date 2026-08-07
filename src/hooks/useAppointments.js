import {
    useMemo
} from "react";
import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import {
    apiRequest
} from "../api/client";
import {
    countBy
} from "../utils/stats";
import {
    toast
} from "../utils/toast";

const EMPTY_ARRAY = [];

export function useAppointments() {
    const queryClient = useQueryClient();

    // جلب المواعيد
    const appointmentsQuery = useQuery({
        queryKey: ["appointments"],
        queryFn: () => apiRequest("/appointments"),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });

    // جلب قائمة المرضى
    const patientsQuery = useQuery({
        queryKey: ["patients"],
        queryFn: () => apiRequest("/patients"),
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    });

    // جلب قائمة الطاقم الطبي/الموظفين (Staff)
    const staffQuery = useQuery({
        queryKey: ["staff"],
        queryFn: () => apiRequest("/staff"), // أو المسار الصحيح لجلب الـ staff لديك
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    });
    const serviceQuery = useQuery({
        queryKey: ["services"],
        queryFn: () => apiRequest("/services"),
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    });

    // إضافة موعد جديد
    const addMutation = useMutation({
        mutationFn: (newAppointment) =>
            apiRequest("/appointments", {
                method: "POST",
                body: JSON.stringify(newAppointment),
            }),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["appointments"],
            });
            toast.success("تم حجز الموعد بنجاح");
        },
        onError: () => toast.error("فشل حجز الموعد"),
    });

    // تعديل موعد
    const updateMutation = useMutation({
        mutationFn: ({
                id,
                data
            }) =>
            apiRequest(`/appointments/${id}`, {
                method: "PUT",
                body: JSON.stringify(data),
            }),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["appointments"],
            });
            toast.success(
                variables.data ?.status === "Cancelled" ?
                "تم إلغاء الموعد" :
                "تم تحديث الموعد بنجاح"
            );
        },
        onError: () => toast.error("فشل تحديث الموعد"),
    });

    // حذف موعد
    const deleteMutation = useMutation({
        mutationFn: (id) =>
            apiRequest(`/appointments/${id}`, {
                method: "DELETE",
            }),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["appointments"],
            });
            toast.success("تم حذف الموعد بنجاح");
        },
        onError: () => toast.error("فشل حذف الموعد"),
    });

    // ربط المواعيد ببيانات المرضى والطبيب (full_name)
    const rawAppointments = appointmentsQuery.data ?? EMPTY_ARRAY;
    const patientsList = patientsQuery.data ?? EMPTY_ARRAY;
    const staffList = staffQuery.data ?? EMPTY_ARRAY;
    const servicesList = serviceQuery.data ?? EMPTY_ARRAY;
    const enrichedAppointments = useMemo(
        () =>
            rawAppointments.map((app) => {
                const matchedPatient = patientsList.find((p) => p.id === app.patient_id);
                const matchedDoctor = staffList.find((s) => s.id === app.doctor_id);
                const matchedService = servicesList.find((srv) => srv.id === app.service_id);

                return {
                    ...app,
                    patient_name: matchedPatient ?.full_name || "مريض غير معروف",
                    doctor_name: matchedDoctor ?.full_name || "طبيب غير محدد",
                    patient_phone: matchedPatient ?.phone || "",
                    patient_file_no: matchedPatient ?.file_no || "",
                    service_name: matchedService ?.name || "خدمة غير محددة",
                };
            }),
        [rawAppointments, patientsList, staffList, servicesList]
    );

    // حساب الإحصائيات بناءً على المواعيد الحالية
    const stats = useMemo(
        () => ({
            total: enrichedAppointments.length,
            completed: countBy(enrichedAppointments, (a) => a.status === "Completed"),
            waiting: countBy(enrichedAppointments, (a) => a.status === "Waiting"),
            inSession: countBy(enrichedAppointments, (a) => a.status === "InSession"),
            noShow: countBy(enrichedAppointments, (a) => a.status === "NoShow"),
            scheduled: countBy(enrichedAppointments, (a) => a.status === "Scheduled" || !a.status),
        }),
        [enrichedAppointments]
    );

    return {
        ...appointmentsQuery,
        appointments: enrichedAppointments,
        stats,
        patients: patientsList,
        doctors: staffList.filter((s) => s.staff_type === "Doctor"), // تصفية الأطباء فقط إن أردت
        isLoading: appointmentsQuery.isLoading || patientsQuery.isLoading || staffQuery.isLoading || serviceQuery.isLoading,
        addAppointment: addMutation.mutateAsync,
        updateAppointment: updateMutation.mutateAsync,
        deleteAppointment: deleteMutation.mutateAsync,
        isAdding: addMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}