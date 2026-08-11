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
import { releaseBedAndRoom } from "./useRooms";
import { logActivity, ACTIVITY_ACTIONS } from "../helpers/activityLog.helpers";
import { isStaffAvailableForAssignment } from "../helpers/team.helpers";
import { useAuth } from "./useAuth";

const EMPTY_ARRAY = [];

export function useAppointments() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const appointmentsQuery = useQuery({
        queryKey: ["appointments"],
        queryFn: () => apiRequest("/appointments"),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
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
    const serviceQuery = useQuery({
        queryKey: ["services"],
        queryFn: () => apiRequest("/services"),
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    });

    const usersQuery = useQuery({
        queryKey: ["users"],
        queryFn: () => apiRequest("/users"),
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    });

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

    const updateMutation = useMutation({
        mutationFn: async ({
            id,
            data
        }) => {
            const result = await apiRequest(`/appointments/${id}`, {
                method: "PUT",
                body: JSON.stringify(data),
            });

            if (data?.status === "Cancelled") {
                const sessions = await apiRequest(`/treatment_sessions?appointment_id=${id}`);
                const session = sessions[0];
                if (session && session.status !== "Completed" && session.status !== "Cancelled") {
                    const now = new Date().toISOString();
                    await apiRequest(`/treatment_sessions/${session.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ status: "Cancelled", updated_at: now }),
                    });
                    if (session.room_id || session.bed_id) {
                        await releaseBedAndRoom(queryClient, { roomId: session.room_id, bedId: session.bed_id });
                    }
                    logActivity({
                        action: ACTIVITY_ACTIONS.SESSION_CANCELLED,
                        actorUserId: user?.id,
                        patientId: session.patient_id,
                        entityType: "session",
                        entityId: session.id,
                        details: "إلغاء الموعد المرتبط بالجلسة",
                    });
                }
            }

            return result;
        },

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["appointments"],
            });
            if (variables.data ?.status === "Cancelled") {
                queryClient.invalidateQueries({ queryKey: ["treatment_sessions"] });
                queryClient.invalidateQueries({ queryKey: ["rooms"] });
                queryClient.invalidateQueries({ queryKey: ["treatment_beds"] });
            }
            toast.success(
                variables.data ?.status === "Cancelled" ?
                "تم إلغاء الموعد" :
                "تم تحديث الموعد بنجاح"
            );
        },
        onError: () => toast.error("فشل تحديث الموعد"),
    });

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
        doctors: staffList.filter(
            (s) => s.staff_type === "Doctor" && isStaffAvailableForAssignment(s.id, usersQuery.data ?? EMPTY_ARRAY),
        ),
        isLoading:
            appointmentsQuery.isLoading ||
            patientsQuery.isLoading ||
            staffQuery.isLoading ||
            serviceQuery.isLoading ||
            usersQuery.isLoading,
        addAppointment: addMutation.mutateAsync,
        updateAppointment: updateMutation.mutateAsync,
        deleteAppointment: deleteMutation.mutateAsync,
        isAdding: addMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}