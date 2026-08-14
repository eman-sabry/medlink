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
import { useAuth } from "./useAuth";
import { logActivity, ACTIVITY_ACTIONS } from "../helpers/activityLog.helpers";

export function useServices() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const servicesQuery = useQuery({
        queryKey: ["services"],
        queryFn: () => apiRequest("/services"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    const addServiceMutation = useMutation({
        mutationFn: async (newService) => {
            return await apiRequest("/services", {
                method: "POST",
                body: JSON.stringify(newService),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["services"]
            });
            toast.success("تمت إضافة الخدمة بنجاح");
        },
        onError: () => toast.error("فشلت إضافة الخدمة"),
    });

    const updateServiceMutation = useMutation({
        mutationFn: async ({
            id,
            updatedData
        }) => {
            return await apiRequest(`/services/${id}`, {
                method: "PUT",
                body: JSON.stringify(updatedData),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["services"]
            });
            toast.success("تم تحديث الخدمة بنجاح");
        },
        onError: () => toast.error("فشل تحديث الخدمة"),
    });

    const deleteServiceMutation = useMutation({
        mutationFn: async (payload) => {
            const id = typeof payload === "object" && payload !== null ? payload.id : payload;
            const deleteReason = typeof payload === "object" && payload !== null ? payload.deleteReason : "طلب حذف الخدمة";
            const srvData = typeof payload === "object" && payload !== null ? payload.service : (servicesQuery.data ?? []).find((s) => s.id === id);

            return await apiRequest("/archive/move", {
                method: "POST",
                body: JSON.stringify({
                    entity_type: "service",
                    entity_id: String(id),
                    delete_reason: deleteReason || "طلب حذف الخدمة",
                    archived_by: user?.full_name || "المسؤول",
                    archived_by_user_id: user?.id || null,
                    title: srvData?.name || "خدمة علاجية",
                    subtitle: srvData?.duration_minutes ? `المدة: ${srvData.duration_minutes} دقيقة` : "خدمة",
                    secondary_info: `${Number(srvData?.price || 0).toLocaleString("en-US")} ج.م`,
                    original_data: srvData,
                }),
            });
        },
        onSuccess: (archivedRecord, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["services"]
            });
            queryClient.invalidateQueries({
                queryKey: ["archived_items"]
            });
            const id = typeof variables === "object" ? variables.id : variables;
            logActivity({
                action: ACTIVITY_ACTIONS.SERVICE_ARCHIVED || "SERVICE_ARCHIVED",
                actorUserId: user?.id,
                entityType: "service",
                entityId: id,
                details: `نقل الخدمة إلى سلة المحذوفات: ${archivedRecord?.title || id}`,
            });
            toast.success("تم نقل الخدمة إلى سلة المحذوفات بنجاح");
        },
        onError: () => toast.error("فشل نقل الخدمة إلى سلة المحذوفات"),
    });

    return {
        ...servicesQuery,
        services: servicesQuery.data ?? [],
        handleAddService: addServiceMutation.mutateAsync,
        handleUpdateService: updateServiceMutation.mutateAsync,
        handleDeleteService: deleteServiceMutation.mutateAsync,
    };
}