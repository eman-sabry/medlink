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

export function useMaintenance() {
    const queryClient = useQueryClient();

    // جلب قائمة سجلات الصيانة
    const maintenanceQuery = useQuery({
        queryKey: ["maintenance"],
        queryFn: () => apiRequest("/maintenance"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    // إضافة سجل صيانة جديد
    const addMaintenanceMutation = useMutation({
        mutationFn: async (newEntry) => {
            return await apiRequest("/maintenance", {
                method: "POST",
                body: JSON.stringify(newEntry),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["maintenance"]
            });
            toast.success("تم إنشاء سجل الصيانة بنجاح");
        },
        onError: () => toast.error("فشل إنشاء سجل الصيانة"),
    });

    // تعديل بيانات سجل الصيانة بالكامل
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
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["maintenance"]
            });
            toast.success("تم تحديث سجل الصيانة بنجاح");
        },
        onError: () => toast.error("فشل تحديث سجل الصيانة"),
    });

    // تغيير حالة الصيانة فقط (سريع من الجدول)
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
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["maintenance"]
            });
            toast.success(
                variables.status === "Completed" ?
                "تم إنجاز الصيانة بنجاح" :
                "تم تحديث حالة الصيانة بنجاح"
            );
        },
        onError: () => toast.error("فشل تحديث حالة الصيانة"),
    });

    // حذف سجل صيانة
    const deleteMaintenanceMutation = useMutation({
        mutationFn: async (id) => {
            return await apiRequest(`/maintenance/${id}`, {
                method: "DELETE",
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["maintenance"]
            });
            toast.success("تم حذف سجل الصيانة بنجاح");
        },
        onError: () => toast.error("فشل حذف سجل الصيانة"),
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