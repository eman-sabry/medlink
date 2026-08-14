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
import { dedupeById } from "../utils/array";

export function useMedicalDevices() {
    const queryClient = useQueryClient();

    const devicesQuery = useQuery({
        queryKey: ["devices"],
        queryFn: () => apiRequest("/devices"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

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

  const updateStatusMutation = useMutation({
      mutationFn: async ({
          id,
          status
      }) => {
          return await apiRequest(`/devices/${id}`, { 
              method: "PATCH",
              body: JSON.stringify({
                  status
              }),
          });
      },
      onSuccess: () => {
          queryClient.invalidateQueries({
              queryKey: ["devices"] 
          });
          toast.success("تم تحديث حالة الجهاز بنجاح");
      },
      onError: () => toast.error("فشل تحديث حالة الجهاز"),
  });

    const assignRoomMutation = useMutation({
        mutationFn: async ({
            id,
            roomId
        }) => {
            return await apiRequest(`/devices/${id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    room_id: roomId || null
                }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["devices"]
            });
            toast.success("تم تحديث موقع الجهاز بنجاح");
        },
        onError: () => toast.error("فشل تحديث موقع الجهاز"),
    });

    const deleteDeviceMutation = useMutation({
        mutationFn: async (payload) => {
            const id = typeof payload === "object" && payload !== null ? payload.id : payload;
            const deleteReason = typeof payload === "object" && payload !== null ? payload.deleteReason : "طلب حذف الجهاز";
            const devData = typeof payload === "object" && payload !== null ? payload.device : (devicesQuery.data ?? []).find((d) => d.id === id);

            return await apiRequest("/archive/move", {
                method: "POST",
                body: JSON.stringify({
                    entity_type: "device",
                    entity_id: String(id),
                    delete_reason: deleteReason || "طلب حذف الجهاز",
                    title: devData?.name || "جهاز طبي",
                    subtitle: devData?.model_number ? `طراز: ${devData.model_number}` : "جهاز",
                    secondary_info: devData?.status ? `الحالة: ${devData.status}` : "متاح",
                    original_data: devData,
                }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["devices"]
            });
            queryClient.invalidateQueries({
                queryKey: ["archived_items"]
            });
            toast.success("تم نقل الجهاز إلى سلة المحذوفات بنجاح");
        },
        onError: () => toast.error("فشل نقل الجهاز إلى سلة المحذوفات"),
    });

    return {
        ...devicesQuery,
        devices: dedupeById(devicesQuery.data ?? []),
        handleAddDevice: addDeviceMutation.mutateAsync,
        handleUpdateDevice: updateDeviceMutation.mutateAsync,
        handleStatusChange: (id, status) => updateStatusMutation.mutateAsync({
            id,
            status
        }),
        handleDeleteDevice: deleteDeviceMutation.mutateAsync,
        handleAssignRoom: (id, roomId) => assignRoomMutation.mutateAsync({
            id,
            roomId
        }),
        isAssigningRoom: assignRoomMutation.isPending,
        isMutating: addDeviceMutation.isPending ||
            updateDeviceMutation.isPending ||
            updateStatusMutation.isPending ||
            assignRoomMutation.isPending ||
            deleteDeviceMutation.isPending,
    };
}