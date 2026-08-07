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

export function usePackageTemplates() {
    const queryClient = useQueryClient();

    const packagesQuery = useQuery({
        queryKey: ["package_templates"],
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
                queryKey: ["package_templates"]
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
                queryKey: ["package_templates"]
            });
            toast.success("تم تحديث الباقة بنجاح");
        },
        onError: () => toast.error("فشل تحديث الباقة"),
    });

    const deletePackageMutation = useMutation({
        mutationFn: async (id) => {
            return await apiRequest(`/package-templates/${id}`, {
                method: "DELETE",
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["package_templates"]
            });
            toast.success("تم حذف الباقة بنجاح");
        },
        onError: () => toast.error("فشل حذف الباقة"),
    });

    return {
        ...packagesQuery,
        packages: packagesQuery.data ?? [],
        handleAddPackage: addPackageMutation.mutateAsync,
        handleUpdatePackage: updatePackageMutation.mutateAsync,
        handleDeletePackage: deletePackageMutation.mutateAsync,
    };
}