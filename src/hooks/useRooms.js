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
import { MANUAL_ROOM_STATUSES, isActiveSessionStatus } from "../helpers/rooms.helpers";
import { logActivity, ACTIVITY_ACTIONS } from "../helpers/activityLog.helpers";
import { dedupeById } from "../utils/array";

// Shared room/bed occupancy engine, reused by session details, rooms page, and appointments
export async function ensureTreatmentSessionForAppointment(appointment) {
    const existing = await apiRequest(`/treatment_sessions?appointment_id=${appointment.id}`);
    if (existing.length > 0) return existing[0];

    const now = new Date().toISOString();
    return apiRequest("/treatment_sessions", {
        method: "POST",
        body: JSON.stringify({
            appointment_id: appointment.id,
            patient_id: appointment.patient_id,
            doctor_id: appointment.doctor_id,
            service_id: appointment.service_id,
            billing_type: appointment.billing_type ?? null,
            package_subscription_id: appointment.package_subscription_id ?? null,
            room_id: null,
            bed_id: null,
            starts_at: appointment.starts_at ?? "",
            ends_at: appointment.ends_at ?? "",
            status: appointment.status ?? "Scheduled",
            actual_started_at:
                appointment.actual_started_at ??
                (appointment.status === "InSession" || appointment.status === "Completed" ? now : ""),
            actual_ended_at: appointment.actual_ended_at ?? (appointment.status === "Completed" ? now : ""),
            completed_at: appointment.status === "Completed" ? (appointment.actual_ended_at ?? now) : "",
            prescription: null,
            clinical_notes: null,
            created_at: now,
            updated_at: now,
        }),
    });
}

export async function setRoomStatus(queryClient, roomId, status) {
    if (!roomId) return;
    await apiRequest(`/rooms/${roomId}`, { method: "PATCH", body: JSON.stringify({ status }) });
    queryClient.invalidateQueries({ queryKey: ["rooms"] });
}

export async function setBedStatus(queryClient, bedId, status) {
    if (!bedId) return;
    await apiRequest(`/treatment_beds/${bedId}`, { method: "PATCH", body: JSON.stringify({ status }) });
    queryClient.invalidateQueries({ queryKey: ["treatment_beds"] });
}

export async function recomputeRoomStatus(queryClient, roomId) {
    if (!roomId) return;
    const [room, bedsInRoom] = await Promise.all([
        apiRequest(`/rooms/${roomId}`),
        apiRequest(`/treatment_beds?room_id=${roomId}`),
    ]);
    if (!room || MANUAL_ROOM_STATUSES.includes(room.status)) return;
    const nextStatus = bedsInRoom.some((b) => b.status === "Occupied") ? "Occupied" : "Available";
    if (nextStatus !== room.status) await setRoomStatus(queryClient, roomId, nextStatus);
}

export async function occupyBedAndRoom(queryClient, { roomId, bedId }) {
    await setBedStatus(queryClient, bedId, "Occupied");
    await setRoomStatus(queryClient, roomId, "Occupied");
}

export async function releaseBedAndRoom(queryClient, { roomId, bedId }) {
    await setBedStatus(queryClient, bedId, "Available");
    await recomputeRoomStatus(queryClient, roomId);
}

export async function findActiveOccupantSession(bedId) {
    if (!bedId) return null;
    const sessions = await apiRequest(`/treatment_sessions?bed_id=${bedId}`);
    return sessions.find((s) => isActiveSessionStatus(s.status)) ?? null;
}

export async function assertBedAvailable(bedId, { exceptSessionId } = {}) {
    if (!bedId) return;
    const bed = await apiRequest(`/treatment_beds/${bedId}`);
    if (bed?.status !== "Occupied") return;
    if (exceptSessionId) {
        const occupant = await findActiveOccupantSession(bedId);
        if (!occupant || occupant.id === exceptSessionId) return;
    }
    const error = new Error("هذا السرير مشغول حالياً");
    error.code = "BED_OCCUPIED";
    throw error;
}

export async function startTreatmentSession(queryClient, { treatmentSession, appointment }) {
    const currentSession = await apiRequest(`/treatment_sessions/${treatmentSession.id}`);
    if (currentSession?.status === "InSession" && currentSession?.actual_started_at) {
        return;
    }

    const now = new Date().toISOString();
    await apiRequest(`/appointments/${appointment.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...appointment, status: "InSession", actual_started_at: now }),
    });
    await apiRequest(`/treatment_sessions/${treatmentSession.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "InSession", actual_started_at: now, updated_at: now }),
    });
    await occupyBedAndRoom(queryClient, { roomId: treatmentSession.room_id, bedId: treatmentSession.bed_id });
}

export async function completeTreatmentSession(queryClient, { treatmentSession, appointment }) {
    const now = new Date().toISOString();
    const actualStartedAt = appointment.actual_started_at || treatmentSession.actual_started_at || now;
    await apiRequest(`/appointments/${appointment.id}`, {
        method: "PUT",
        body: JSON.stringify({
            ...appointment,
            status: "Completed",
            actual_started_at: actualStartedAt,
            actual_ended_at: now,
        }),
    });
    await apiRequest(`/treatment_sessions/${treatmentSession.id}`, {
        method: "PATCH",
        body: JSON.stringify({
            status: "Completed",
            actual_started_at: treatmentSession.actual_started_at || actualStartedAt,
            actual_ended_at: now,
            completed_at: now,
            updated_at: now,
        }),
    });
    await releaseBedAndRoom(queryClient, { roomId: treatmentSession.room_id, bedId: treatmentSession.bed_id });
}

export function invalidateOccupancyQueries(queryClient) {
    queryClient.invalidateQueries({ queryKey: ["rooms"] });
    queryClient.invalidateQueries({ queryKey: ["treatment_beds"] });
    queryClient.invalidateQueries({ queryKey: ["treatment_sessions"] });
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
    queryClient.invalidateQueries({ queryKey: ["doctor-sessions"] });
    queryClient.invalidateQueries({ queryKey: ["audit_logs"] });
}

export function useRooms() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const roomsQuery = useQuery({
        queryKey: ["rooms"],
        queryFn: () => apiRequest("/rooms"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    const bedsQuery = useQuery({
        queryKey: ["treatment_beds"],
        queryFn: () => apiRequest("/treatment_beds"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    const devicesQuery = useQuery({
        queryKey: ["devices"],
        queryFn: () => apiRequest("/devices"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    const equipmentQuery = useQuery({
        queryKey: ["room_equipment"],
        queryFn: () => apiRequest("/room_equipment"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    const treatmentSessionsQuery = useQuery({
        queryKey: ["treatment_sessions"],
        queryFn: () => apiRequest("/treatment_sessions"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    const patientsQuery = useQuery({
        queryKey: ["patients"],
        queryFn: () => apiRequest("/patients"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    const appointmentsQuery = useQuery({
        queryKey: ["appointments"],
        queryFn: () => apiRequest("/appointments"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

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

    const updateRoomStatusMutation = useMutation({
        mutationFn: async ({
            id,
            status
        }) => {
            return await apiRequest(`/rooms/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["rooms"]
            });
            toast.success("تم تحديث حالة الغرفة بنجاح");
        },
        onError: () => toast.error("فشل تحديث حالة الغرفة"),
    });

    const updateBedStatusMutation = useMutation({
        mutationFn: async ({
            id,
            status
        }) => {
            if (status === "Occupied") {
                throw new Error("لا يمكن تعيين السرير كمشغول يدوياً — استخدم تعيين مريض للسرير");
            }
            return await apiRequest(`/treatment_beds/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["treatment_beds"]
            });
            toast.success("تم تحديث حالة السرير بنجاح");
        },
        onError: (error) => toast.error(error.message || "فشل تحديث حالة السرير"),
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

    const addBedMutation = useMutation({
        mutationFn: async ({ roomId, label, status = "Available" }) => {
            if (status === "Occupied") {
                throw new Error("لا يمكن إضافة سرير بحالة مشغول مباشرة — استخدم تعيين مريض للسرير");
            }
            const existingBeds = await apiRequest(`/treatment_beds?room_id=${roomId}`);
            const trimmedLabel = label.trim();
            const isDuplicate = existingBeds.some(
                (b) => b.label.trim().toLowerCase() === trimmedLabel.toLowerCase(),
            );
            if (isDuplicate) {
                throw new Error("يوجد بالفعل سرير بنفس الاسم في هذه الغرفة");
            }
            return apiRequest("/treatment_beds", {
                method: "POST",
                body: JSON.stringify({ room_id: roomId, label: trimmedLabel, status }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["treatment_beds"] });
            toast.success("تمت إضافة السرير بنجاح");
        },
        onError: (error) => toast.error(error.message || "فشلت إضافة السرير"),
    });

    const deleteBedMutation = useMutation({
        mutationFn: async (bedId) => {
            const bed = await apiRequest(`/treatment_beds/${bedId}`);
            if (bed?.status === "Occupied") {
                throw new Error("لا يمكن حذف سرير مشغول — يجب تحرير السرير أولاً");
            }
            return apiRequest(`/treatment_beds/${bedId}`, { method: "DELETE" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["treatment_beds"] });
            toast.success("تم حذف السرير بنجاح");
        },
        onError: (error) => toast.error(error.message || "فشل حذف السرير"),
    });

    const assignPatientToBedMutation = useMutation({
        mutationFn: async ({ patientId, roomId, bedId }) => {
            await assertBedAvailable(bedId);

            const patientSessions = await apiRequest(`/treatment_sessions?patient_id=${patientId}`);
            const activeSessionForPatient = patientSessions.find(
                (s) => s.bed_id && isActiveSessionStatus(s.status),
            );
            if (activeSessionForPatient) {
                const error = new Error("هذا المريض لديه سرير معيَّن بالفعل — حرّره أولاً قبل تعيين سرير جديد");
                error.code = "ALREADY_IN_SESSION";
                throw error;
            }

            const patientAppointments = await apiRequest(`/appointments?patient_id=${patientId}`);
            const candidate = patientAppointments
                .filter((a) => a.status === "Waiting" || a.status === "Arrived")
                .sort((a, b) => new Date(a.starts_at ?? 0) - new Date(b.starts_at ?? 0))[0];

            if (!candidate) {
                const error = new Error("لا يوجد موعد بانتظار الطبيب أو وصل لهذا المريض حالياً");
                error.code = "NO_ACTIVE_APPOINTMENT";
                throw error;
            }

            const treatmentSession = await ensureTreatmentSessionForAppointment(candidate);
            if (treatmentSession.status === "InSession" || treatmentSession.bed_id) {
                const error = new Error("هذا المريض لديه جلسة نشطة أو سرير معيَّن بالفعل");
                error.code = "ALREADY_IN_SESSION";
                throw error;
            }

            await apiRequest(`/treatment_sessions/${treatmentSession.id}`, {
                method: "PATCH",
                body: JSON.stringify({ room_id: roomId, bed_id: bedId, updated_at: new Date().toISOString() }),
            });

            await startTreatmentSession(queryClient, {
                treatmentSession: { ...treatmentSession, room_id: roomId, bed_id: bedId },
                appointment: candidate,
            });

            logActivity({
                action: ACTIVITY_ACTIONS.BED_ASSIGNED,
                actorUserId: user?.id,
                patientId,
                entityType: "session",
                entityId: treatmentSession.id,
                details: "تعيين مريض للسرير من صفحة الغرف",
            });
        },
        onSuccess: () => {
            invalidateOccupancyQueries(queryClient);
            toast.success("تم تعيين المريض للسرير بنجاح");
        },
        onError: (error) => toast.error(error.message || "فشل تعيين المريض للسرير"),
    });

    const releaseBedMutation = useMutation({
        mutationFn: async ({ bedId }) => {
            const treatmentSession = await findActiveOccupantSession(bedId);
            if (!treatmentSession) {
                const error = new Error("لا توجد جلسة نشطة على هذا السرير");
                error.code = "NO_ACTIVE_SESSION";
                throw error;
            }
            const appointment = await apiRequest(`/appointments/${treatmentSession.appointment_id}`);
            await completeTreatmentSession(queryClient, { treatmentSession, appointment });

            logActivity({
                action: ACTIVITY_ACTIONS.SESSION_ENDED,
                actorUserId: user?.id,
                patientId: treatmentSession.patient_id,
                entityType: "session",
                entityId: treatmentSession.id,
                details: "تحرير السرير من صفحة الغرف",
            });
        },
        onSuccess: () => {
            invalidateOccupancyQueries(queryClient);
            toast.success("تم تحرير السرير بنجاح");
        },
        onError: (error) => toast.error(error.message || "فشل تحرير السرير"),
    });

    return {
        rooms: dedupeById(roomsQuery.data ?? []),
        beds: dedupeById(bedsQuery.data ?? []),
        devices: dedupeById(devicesQuery.data ?? []),
        equipment: dedupeById(equipmentQuery.data ?? []),
        treatmentSessions: treatmentSessionsQuery.data ?? [],
        patients: patientsQuery.data ?? [],
        appointments: appointmentsQuery.data ?? [],

        isLoading:
            roomsQuery.isLoading ||
            bedsQuery.isLoading ||
            devicesQuery.isLoading ||
            equipmentQuery.isLoading ||
            treatmentSessionsQuery.isLoading ||
            patientsQuery.isLoading ||
            appointmentsQuery.isLoading,
        isError: roomsQuery.isError || bedsQuery.isError,

        handleAddRoom: addRoomMutation.mutateAsync,
        handleUpdateRoom: updateRoomMutation.mutateAsync,
        handleUpdateRoomStatus: updateRoomStatusMutation.mutateAsync,
        handleUpdateBedStatus: updateBedStatusMutation.mutateAsync,
        handleDeleteRoom: deleteRoomMutation.mutateAsync,
        handleAddBed: addBedMutation.mutateAsync,
        isAddingBed: addBedMutation.isPending,
        handleDeleteBed: deleteBedMutation.mutateAsync,
        assignPatientToBed: assignPatientToBedMutation.mutateAsync,
        isAssigningPatient: assignPatientToBedMutation.isPending,
        releaseBed: releaseBedMutation.mutateAsync,
        isReleasingBed: releaseBedMutation.isPending,
    };
}
