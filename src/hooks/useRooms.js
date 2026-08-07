import {
    useQuery,
    useMutation,
    useQueryClient
} from "@tanstack/react-query";
import {
    apiRequest
} from "../api/client"; // أو مسار ملف الـ api لديك
import {
    toast
} from "../utils/toast";

export function useRooms() {
    const queryClient = useQueryClient();

    // 1. جلب بيانات الغرف
    const roomsQuery = useQuery({
        queryKey: ["rooms"],
        queryFn: () => apiRequest("/rooms"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    // 2. جلب بيانات الأسرة (Treatment Beds)
    const bedsQuery = useQuery({
        queryKey: ["treatment_beds"],
        queryFn: () => apiRequest("/treatment_beds"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    // 3. جلب بيانات الأجهزة الطبية (Devices)
    const devicesQuery = useQuery({
        queryKey: ["devices"],
        queryFn: () => apiRequest("/devices"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    // 4. جلب معدات الغرف (Room Equipment)
    const equipmentQuery = useQuery({
        queryKey: ["room_equipment"],
        queryFn: () => apiRequest("/room_equipment"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    // --- Mutations (إضافة، تعديل، حذف الغرف) ---

    const addRoomMutation = useMutation({
        mutationFn: async (newRoom) => {
            return await apiRequest("/rooms", {
                method: "POST",
                body: JSON.stringify(newRoom),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["rooms"]
            });
            toast.success("تمت إضافة الغرفة بنجاح");
        },
        onError: () => toast.error("فشلت إضافة الغرفة"),
    });

    const updateRoomMutation = useMutation({
        mutationFn: async ({
            id,
            updatedData
        }) => {
            return await apiRequest(`/rooms/${id}`, {
                method: "PUT",
                body: JSON.stringify(updatedData),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["rooms"]
            });
            toast.success("تم تحديث بيانات الغرفة بنجاح");
        },
        onError: () => toast.error("فشل تحديث بيانات الغرفة"),
    });

    const deleteRoomMutation = useMutation({
        mutationFn: async (id) => {
            return await apiRequest(`/rooms/${id}`, {
                method: "DELETE",
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["rooms"]
            });
            queryClient.invalidateQueries({
                queryKey: ["treatment_beds"]
            });
            queryClient.invalidateQueries({
                queryKey: ["devices"]
            });
            toast.success("تم حذف الغرفة بنجاح");
        },
        onError: () => toast.error("فشل حذف الغرفة"),
    });

    return {
        // البيانات
        rooms: roomsQuery.data ?? [],
        beds: bedsQuery.data ?? [],
        devices: devicesQuery.data ?? [],
        equipment: equipmentQuery.data ?? [],

        // حالات التحميل
        isLoading: roomsQuery.isLoading || bedsQuery.isLoading || devicesQuery.isLoading || equipmentQuery.isLoading,
        isError: roomsQuery.isError || bedsQuery.isError,

        // العمليات (Mutations)
        handleAddRoom: addRoomMutation.mutateAsync,
        handleUpdateRoom: updateRoomMutation.mutateAsync,
        handleDeleteRoom: deleteRoomMutation.mutateAsync,
    };
}