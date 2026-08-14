import {
    useState,
    useMemo
} from "react";
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

export function usePatientFollowUp() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    const followUpsQuery = useQuery({
        queryKey: ["follow_ups"],
        queryFn: () => apiRequest("/follow_ups"),
        refetchOnWindowFocus: false,
    });

    const patientsQuery = useQuery({
        queryKey: ["patients"],
        queryFn: () => apiRequest("/patients"),
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    });

    const staffQuery = useQuery({
        queryKey: ["staff"],
        queryFn: () => apiRequest("/staff"),
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({
            followUpId,
            status,
            followUpStatus,
            notes
        }) => {
            const payload = {};
            const targetStatus = followUpStatus || status;
            if (targetStatus !== undefined) {
                payload.status = targetStatus;
                payload.follow_up_status = targetStatus;
            }
            if (notes !== undefined) {
                payload.notes = notes;
            }
            payload.updated_at = new Date().toISOString();

            return await apiRequest(`/follow_ups/${followUpId}`, {
                method: "PATCH",
                body: JSON.stringify(payload),
            });
        },
        onMutate: async ({
            followUpId,
            followUpStatus,
            status,
            notes
        }) => {
            await queryClient.cancelQueries({
                queryKey: ["follow_ups"]
            });
            const previousData = queryClient.getQueryData(["follow_ups"]);

            queryClient.setQueryData(["follow_ups"], (oldData) => {
                if (!oldData) return oldData;

                const list = Array.isArray(oldData) ? oldData : oldData.follow_ups || [];

                const updatedList = list.map((item) => {
                    if (String(item.id) === String(followUpId)) {
                        const newSt = followUpStatus || status || item.follow_up_status || item.status;
                        return {
                            ...item,
                            status: newSt,
                            follow_up_status: newSt,
                            notes: notes !== undefined ? notes : item.notes,
                            updated_at: new Date().toISOString(),
                        };
                    }
                    return item;
                });

                return Array.isArray(oldData) ? updatedList : {
                    ...oldData,
                    follow_ups: updatedList
                };
            });

            return {
                previousData
            };
        },
        onError: (err, variables, context) => {
            if (context ?.previousData) {
                queryClient.setQueryData(["follow_ups"], context.previousData);
            }
            toast.error("فشل تحديث حالة المتابعة");
        },
        onSuccess: () => {
            toast.success("تم تحديث حالة المتابعة بنجاح");
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["follow_ups"]
            });
        },
    });

    const missedPatients = useMemo(() => {
        const rawFollowUps = Array.isArray(followUpsQuery.data) ?
            followUpsQuery.data :
            followUpsQuery.data?.follow_ups || [];
        const patientsList = Array.isArray(patientsQuery.data) ? patientsQuery.data : [];
        const staffList = Array.isArray(staffQuery.data) ? staffQuery.data : [];

        return rawFollowUps.map((item) => {
            const matchedPatient = patientsList.find((p) => p.id === item.patient_id);
            const matchedDoctor = staffList.find((s) => s.id === item.doctor_id);
            const matchedAssignee = staffList.find((s) => s.id === item.assignee_staff_id);

            const itemDateStr = item.updated_at || item.created_at || new Date().toISOString();
            const itemDate = new Date(itemDateStr);

            const currentStatus = item.follow_up_status || item.status || "بحاجة اتصال";

            return {
                id: item.id,
                patientId: item.patient_id,
                doctorId: item.doctor_id,
                patientName: matchedPatient?.full_name || item.patient_name || "مريض غير معروف",
                patientPhone: matchedPatient?.phone || item.patient_phone || "01000000000",
                doctorName: matchedDoctor?.full_name || "د. غير محدد",
                followUpStaff: matchedAssignee?.full_name || "مسؤول المتابعة",
                lastUpdate: !isNaN(itemDate.getTime()) ? itemDate.toISOString().split("T")[0] : "—",
                notes: item.notes && item.notes.trim() !== "" ? item.notes : "—",
                status: currentStatus,
                followUpStatus: currentStatus,
                updatedAt: item.updated_at || "—",
            };
        });
    }, [followUpsQuery.data, patientsQuery.data, staffQuery.data]);

    const stats = useMemo(() => {
        const counts = {
            needsCall: 0,
            contacted: 0,
            rebooked: 0,
            wontReturn: 0
        };
        missedPatients.forEach((p) => {
            const st = p.followUpStatus;
            if (st === "بحاجة اتصال") counts.needsCall++;
            else if (st === "تم الاتصال" || st === "تم الاتصال — بانتظار") counts.contacted++;
            else if (st === "أعاد الحجز" || st === "أعادوا الحجز") counts.rebooked++;
            else if (st === "لن يعود" || st === "لن يعودوا") counts.wontReturn++;
        });
        return counts;
    }, [missedPatients]);

    const filteredPatients = useMemo(() => {
        return missedPatients.filter((p) => {
            const matchesSearch =
                p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                String(p.patientPhone).includes(searchQuery);

            if (!matchesSearch) return false;

            if (activeTab === "needsCall") return p.followUpStatus === "بحاجة اتصال";
            if (activeTab === "contacted")
                return p.followUpStatus === "تم الاتصال" || p.followUpStatus === "تم الاتصال — بانتظار";
            if (activeTab === "rebooked")
                return p.followUpStatus === "أعاد الحجز" || p.followUpStatus === "أعادوا الحجز";
            if (activeTab === "wontReturn")
                return p.followUpStatus === "لن يعود" || p.followUpStatus === "لن يعودوا";

            return true;
        });
    }, [missedPatients, searchQuery, activeTab]);

    return {
        patients: filteredPatients,
        allPatientsCount: missedPatients.length,
        stats,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        updateStatus: updateStatusMutation.mutateAsync,
        isLoading: followUpsQuery.isLoading || patientsQuery.isLoading || staffQuery.isLoading,
    };
}