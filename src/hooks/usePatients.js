import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import {
    apiRequest
} from "../api/client";
import {
    toast
} from "../utils/toast";
import { createNotification } from "../services/notificationService";
import { NOTIFICATION_TYPES, NOTIFICATION_SEVERITIES } from "../constants/notificationTypes";
import { ROLES } from "../permissions/roles";

import { useAuth } from "./useAuth";
import { logActivity } from "../helpers/activityLog.helpers";

export function usePatients() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const patientsQuery = useQuery({
        queryKey: ["patients"],
        queryFn: () => apiRequest("/patients"),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    const addMutation = useMutation({
        mutationFn: (newPatient) =>
            apiRequest("/patients", {
                method: "POST",
                body: JSON.stringify(newPatient),
            }),

        onSuccess: (created) => {
            queryClient.invalidateQueries({
                queryKey: ["patients"],
            });

            if (created) {
                createNotification({
                    type: NOTIFICATION_TYPES.PATIENT_REGISTERED,
                    title: "تسجيل مريض جديد",
                    message: `تم فتح ملف جديد للمريض ${created.full_name || "جديد"} برقم ملف ${created.file_no || "—"}`,
                    severity: NOTIFICATION_SEVERITIES.INFO,
                    entityType: "patient",
                    entityId: created.id,
                    targetRoles: [ROLES.OWNER, ROLES.SECRETARY],
                    metadata: {
                        patient_id: created.id,
                        file_no: created.file_no,
                    },
                });
            }

            toast.success("تمت إضافة المريض بنجاح");
        },
        onError: () => toast.error("فشلت إضافة المريض"),
    });

    const updateMutation = useMutation({
        mutationFn: ({
                id,
                data
            }) =>
            apiRequest(`/patients/${id}`, {
                method: "PUT",
                body: JSON.stringify(data),
            }),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["patients"],
            });
            toast.success("تم تحديث بيانات المريض بنجاح");
        },
        onError: () => toast.error("فشل تحديث بيانات المريض"),
    });

    const deleteMutation = useMutation({
        mutationFn: async (payload) => {
            const id = typeof payload === "object" && payload !== null ? payload.id : payload;
            const deleteReason = typeof payload === "object" && payload !== null ? payload.deleteReason : "طلب حذف ملف المريض";
            const patientData = typeof payload === "object" && payload !== null ? payload.patient : null;

            return await apiRequest("/archive/move", {
                method: "POST",
                body: JSON.stringify({
                    entity_type: "patient",
                    entity_id: String(id),
                    delete_reason: deleteReason || "طلب حذف ملف المريض",
                    archived_by: user?.full_name || "المسؤول",
                    archived_by_user_id: user?.id || null,
                    original_data: patientData,
                }),
            });
        },

        onSuccess: (archivedRecord, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["patients"],
            });
            queryClient.invalidateQueries({
                queryKey: ["archived_items"],
            });

            logActivity({
                action: "PATIENT_ARCHIVED",
                actorUserId: user?.id,
                entityType: "patient",
                entityId: typeof variables === "object" ? variables.id : variables,
                details: `نقل ملف المريض إلى سلة المحذوفات: ${archivedRecord?.title || ""}`,
            });

            toast.success("تم نقل ملف المريض إلى سلة المحذوفات بنجاح");
        },
        onError: () => toast.error("فشل نقل المريض إلى سلة المحذوفات"),
    });

    return {
        ...patientsQuery,
        patients: patientsQuery.data ?? [],
        addPatient: addMutation.mutateAsync,
        updatePatient: updateMutation.mutateAsync,
        deletePatient: deleteMutation.mutateAsync,
        isAdding: addMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}