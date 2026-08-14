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
import { useExpenses } from "./useExpenses";
import { useAuth } from "./useAuth";
import { createNotification } from "../services/notificationService";
import { NOTIFICATION_TYPES, NOTIFICATION_SEVERITIES } from "../constants/notificationTypes";
import { ROLES } from "../permissions/roles";

export function useMaintenance() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { ensureExpenseForMaintenance } = useExpenses();

    const maintenanceQuery = useQuery({
        queryKey: ["maintenance"],
        queryFn: () => apiRequest("/maintenance"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    const addMaintenanceMutation = useMutation({
        mutationFn: async (newEntry) => {
            return await apiRequest("/maintenance", {
                method: "POST",
                body: JSON.stringify(newEntry),
            });
        },
        onSuccess: (created) => {
            queryClient.invalidateQueries({
                queryKey: ["maintenance"]
            });
            if (created) {
                createNotification({
                    type: NOTIFICATION_TYPES.DEVICE_MAINTENANCE,
                    title: "تسجيل طلب صيانة",
                    message: `تم تسجيل طلب صيانة: ${created.reason || "صيانة دورية"}`,
                    severity: NOTIFICATION_SEVERITIES.WARNING,
                    entityType: "maintenance",
                    entityId: created.id,
                    targetRoles: [ROLES.OWNER],
                });
            }
            toast.success("تم إنشاء سجل الصيانة بنجاح");
            ensureExpenseForMaintenance({ maintenance: created, actorUserId: user?.id });
        },
        onError: () => toast.error("فشل إنشاء سجل الصيانة"),
    });

    const updateMaintenanceMutation = useMutation({
        mutationFn: async ({
            id,
            updatedData
        }) => {
            return await apiRequest(`/maintenance/${id}`, {
                method: "PUT",
                body: JSON.stringify(updatedData),
            });
        },
        onSuccess: (updated) => {
            queryClient.invalidateQueries({
                queryKey: ["maintenance"]
            });
            toast.success("تم تحديث سجل الصيانة بنجاح");
            ensureExpenseForMaintenance({ maintenance: updated, actorUserId: user?.id });
        },
        onError: () => toast.error("فشل تحديث سجل الصيانة"),
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({
            id,
            status
        }) => {
            return await apiRequest(`/maintenance/${id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    status
                }),
            });
        },
        onSuccess: (updated, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["maintenance"]
            });

            if (variables.status === "Completed") {
                createNotification({
                    type: NOTIFICATION_TYPES.MAINTENANCE_COMPLETED,
                    title: "اكتمال أعمال الصيانة",
                    message: "تم إنجاز أعمال الصيانة للجهاز بنجاح وإعادته للخدمة",
                    severity: NOTIFICATION_SEVERITIES.SUCCESS,
                    entityType: "maintenance",
                    entityId: variables.id,
                    targetRoles: [ROLES.OWNER],
                });
            }

            toast.success(
                variables.status === "Completed" ?
                "تم إنجاز الصيانة بنجاح" :
                "تم تحديث حالة الصيانة بنجاح"
            );
            const cachedEntry = (maintenanceQuery.data ?? []).find((m) => m.id === variables.id);
            ensureExpenseForMaintenance({
                maintenance: { ...cachedEntry, ...updated, status: variables.status },
                actorUserId: user?.id,
            });
        },
        onError: () => toast.error("فشل تحديث حالة الصيانة"),
    });

    const deleteMaintenanceMutation = useMutation({
        mutationFn: async (payload) => {
            const id = typeof payload === "object" && payload !== null ? payload.id : payload;
            const deleteReason = typeof payload === "object" && payload !== null ? payload.deleteReason : "طلب حذف سجل الصيانة";
            const mainData = typeof payload === "object" && payload !== null ? payload.maintenance : (maintenanceQuery.data ?? []).find((m) => m.id === id);

            return await apiRequest("/archive/move", {
                method: "POST",
                body: JSON.stringify({
                    entity_type: "maintenance",
                    entity_id: String(id),
                    delete_reason: deleteReason || "طلب حذف سجل الصيانة",
                    title: mainData?.reason || "سجل صيانة",
                    subtitle: mainData?.device_name ? `الجهاز: ${mainData.device_name}` : "صيانة",
                    secondary_info: `${Number(mainData?.cost || 0).toLocaleString("en-US")} ج.م`,
                    original_data: mainData,
                }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["maintenance"]
            });
            queryClient.invalidateQueries({
                queryKey: ["archived_items"]
            });
            toast.success("تم نقل سجل الصيانة إلى سلة المحذوفات بنجاح");
        },
        onError: () => toast.error("فشل نقل سجل الصيانة إلى سلة المحذوفات"),
    });

    return {
        ...maintenanceQuery,
        maintenanceEntries: maintenanceQuery.data ?? [],
        handleAddMaintenance: addMaintenanceMutation.mutateAsync,
        handleUpdateMaintenance: updateMaintenanceMutation.mutateAsync,
        handleStatusChange: (id, status) => updateStatusMutation.mutateAsync({
            id,
            status
        }),
        handleDeleteMaintenance: deleteMaintenanceMutation.mutateAsync,
        isMutating: addMaintenanceMutation.isPending ||
            updateMaintenanceMutation.isPending ||
            updateStatusMutation.isPending ||
            deleteMaintenanceMutation.isPending,
    };
}