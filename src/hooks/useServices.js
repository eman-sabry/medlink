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

export function useServices() {
    const queryClient = useQueryClient();

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
        mutationFn: async (id) => {
            return await apiRequest(`/services/${id}`, {
                method: "DELETE",
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["services"]
            });
            toast.success("تم حذف الخدمة بنجاح");
        },
        onError: () => toast.error("فشل حذف الخدمة"),
    });

    return {
        ...servicesQuery,
        services: servicesQuery.data ?? [],
        handleAddService: addServiceMutation.mutateAsync,
        handleUpdateService: updateServiceMutation.mutateAsync,
        handleDeleteService: deleteServiceMutation.mutateAsync,
    };
}