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

export function usePackageTemplates() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const packagesQuery = useQuery({
        queryKey: ["package-templates"],
        queryFn: () => apiRequest("/package-templates"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    const addPackageMutation = useMutation({
        mutationFn: async (newPackage) => {
            return await apiRequest("/package-templates", {
                method: "POST",
                body: JSON.stringify(newPackage),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["package-templates"]
            });
            toast.success("تمت إضافة الباقة بنجاح");
        },
        onError: () => toast.error("فشلت إضافة الباقة"),
    });

    const updatePackageMutation = useMutation({
        mutationFn: async ({
            id,
            updatedData
        }) => {
            return await apiRequest(`/package-templates/${id}`, {
                method: "PUT",
                body: JSON.stringify(updatedData),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["package-templates"]
            });
            toast.success("تم تحديث الباقة بنجاح");
        },
        onError: () => toast.error("فشل تحديث الباقة"),
    });

    const deletePackageMutation = useMutation({
        mutationFn: async (payload) => {
            const id = typeof payload === "object" && payload !== null ? payload.id : payload;
            const deleteReason = typeof payload === "object" && payload !== null ? payload.deleteReason : "طلب حذف الباقة";
            const pkgData = typeof payload === "object" && payload !== null ? payload.pkg : (packagesQuery.data ?? []).find((p) => p.id === id);

            return await apiRequest("/archive/move", {
                method: "POST",
                body: JSON.stringify({
                    entity_type: "package",
                    entity_id: String(id),
                    delete_reason: deleteReason || "طلب حذف الباقة",
                    archived_by: user?.full_name || "المسؤول",
                    archived_by_user_id: user?.id || null,
                    title: pkgData?.name || "باقة علاجية",
                    subtitle: pkgData?.session_count ? `${pkgData.session_count} جلسات` : "باقة",
                    secondary_info: `${Number(pkgData?.price || 0).toLocaleString("en-US")} ج.م`,
                    original_data: pkgData,
                }),
            });
        },
        onSuccess: (archivedRecord, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["package-templates"]
            });
            queryClient.invalidateQueries({
                queryKey: ["archived_items"]
            });
            const id = typeof variables === "object" ? variables.id : variables;
            logActivity({
                action: ACTIVITY_ACTIONS.PACKAGE_ARCHIVED || "PACKAGE_ARCHIVED",
                actorUserId: user?.id,
                entityType: "package",
                entityId: id,
                details: `نقل الباقة إلى سلة المحذوفات: ${archivedRecord?.title || id}`,
            });
            toast.success("تم نقل الباقة إلى سلة المحذوفات بنجاح");
        },
        onError: () => toast.error("فشل نقل الباقة إلى سلة المحذوفات"),
    });

    return {
        ...packagesQuery,
        packages: packagesQuery.data ?? [],
        handleAddPackage: addPackageMutation.mutateAsync,
        handleUpdatePackage: updatePackageMutation.mutateAsync,
        handleDeletePackage: deletePackageMutation.mutateAsync,
    };
}