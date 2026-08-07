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

export function usePatients() {
    const queryClient = useQueryClient();

    // جلب المرضى
    const patientsQuery = useQuery({
        queryKey: ["patients"],
        queryFn: () => apiRequest("/patients"),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });

    // إضافة مريض
    const addMutation = useMutation({
        mutationFn: (newPatient) =>
            apiRequest("/patients", {
                method: "POST",
                body: JSON.stringify(newPatient),
            }),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["patients"],
            });
            toast.success("تمت إضافة المريض بنجاح");
        },
        onError: () => toast.error("فشلت إضافة المريض"),
    });

    // تعديل مريض
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

    // حذف مريض
    const deleteMutation = useMutation({
        mutationFn: (id) =>
            apiRequest(`/patients/${id}`, {
                method: "DELETE",
            }),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["patients"],
            });
            toast.success("تم حذف المريض بنجاح");
        },
        onError: () => toast.error("فشل حذف المريض"),
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