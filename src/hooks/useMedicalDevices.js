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

export function useMedicalDevices() {
    const queryClient = useQueryClient();

    // جلب قائمة الأجهزة
    const devicesQuery = useQuery({
        queryKey: ["devices"],
        queryFn: () => apiRequest("/devices"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    // إضافة جهاز جديد
    const addDeviceMutation = useMutation({
        mutationFn: async (newDevice) => {
            return await apiRequest("/devices", {
                method: "POST",
                body: JSON.stringify(newDevice),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["devices"]
            });
            toast.success("تمت إضافة الجهاز بنجاح");
        },
        onError: () => toast.error("فشلت إضافة الجهاز"),
    });

    // تعديل بيانات جهاز بالكامل
    const updateDeviceMutation = useMutation({
        mutationFn: async ({
            id,
            updatedData
        }) => {
            return await apiRequest(`/devices/${id}`, {
                method: "PUT",
                body: JSON.stringify(updatedData),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["devices"]
            });
            toast.success("تم تحديث بيانات الجهاز بنجاح");
        },
        onError: () => toast.error("فشل تحديث بيانات الجهاز"),
    });

    // تغيير حالة الجهاز فقط (سريع من الجدول)
  const updateStatusMutation = useMutation({
      mutationFn: async ({
          id,
          status
      }) => {
          return await apiRequest(`/devices/${id}`, { // تم تصحيح المسار ليكون متطابقاً
              method: "PATCH",
              body: JSON.stringify({
                  status
              }),
          });
      },
      onSuccess: () => {
          queryClient.invalidateQueries({
              queryKey: ["devices"] // تم توحيد المفتاح ليعمل الـ Refresh بشكل صحيح
          });
          toast.success("تم تحديث حالة الجهاز بنجاح");
      },
      onError: () => toast.error("فشل تحديث حالة الجهاز"),
  });

    // حذف جهاز
    const deleteDeviceMutation = useMutation({
        mutationFn: async (id) => {
            return await apiRequest(`/devices/${id}`, {
                method: "DELETE",
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["devices"]
            });
            toast.success("تم حذف الجهاز بنجاح");
        },
        onError: () => toast.error("فشل حذف الجهاز"),
    });

    return {
        ...devicesQuery,
        devices: devicesQuery.data ?? [],
        handleAddDevice: addDeviceMutation.mutateAsync,
        handleUpdateDevice: updateDeviceMutation.mutateAsync,
        handleStatusChange: (id, status) => updateStatusMutation.mutateAsync({
            id,
            status
        }),
        handleDeleteDevice: deleteDeviceMutation.mutateAsync,
        isMutating: addDeviceMutation.isPending ||
            updateDeviceMutation.isPending ||
            updateStatusMutation.isPending ||
            deleteDeviceMutation.isPending,
    };
}