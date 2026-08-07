import {
    useState,
    useEffect,
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

export function useDoctorSessions() {
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [activeTab, setActiveTab] = useState("In-Progress");

    const [timers, setTimers] = useState(() => {
        const saved = sessionStorage.getItem("active_session_timers");
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        sessionStorage.setItem("active_session_timers", JSON.stringify(timers));
    }, [timers]);

    const doctorSessionsQuery = useQuery({
        queryKey: ["doctor-sessions"],
        queryFn: () => apiRequest("/appointments"),
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

    const rawAppointments = doctorSessionsQuery.data ?? [];
    const patientsList = patientsQuery.data ?? [];
    const staffList = staffQuery.data ?? [];

    // مزامنة العدادات تلقائياً للمواعيد قيد الجلسة أو المحسوبة مسبقاً
    useEffect(() => {
        if (rawAppointments.length > 0) {
            setTimers((prev) => {
                const updated = {
                    ...prev
                };
                let hasChanges = false;

                rawAppointments.forEach((app) => {
                    const status = app.status ?.trim() ?.toLowerCase() || "";
                    const isInProgress = status === "in-progress" || status === "insession" || status === "in_progress" || status === "active" || status === "ongoing" || status === "قيد الجلسة";
                    const isCompleted = status === "completed" || status === "منتهي" || status === "مكتمل" || status === "مكتملة";

                    // إذا كانت الجلسة مكتملة ولديها وقت بداية ونهاية مسجل مسبقاً، نحسب الثواني النهائية ونجمدها
                    if (isCompleted && app.starts_at && app.ends_at) {
                        if (!updated[app.id] || updated[app.id].isActive) {
                            const startMs = new Date(app.starts_at).getTime();
                            const endMs = new Date(app.ends_at).getTime();
                            const totalSeconds = Math.max(0, Math.floor((endMs - startMs) / 1000));
                            updated[app.id] = {
                                seconds: totalSeconds,
                                isActive: false,
                                startTime: app.starts_at,
                            };
                            hasChanges = true;
                        }
                    }
                    // إذا كانت قيد الجلسة، نحسب الوقت المنقضي لحظياً
                    else if (isInProgress && app.starts_at) {
                        const startTimeMs = new Date(app.starts_at).getTime();
                        const nowMs = Date.now();
                        const elapsedSeconds = Math.max(0, Math.floor((nowMs - startTimeMs) / 1000));

                        if (!updated[app.id]) {
                            updated[app.id] = {
                                seconds: elapsedSeconds,
                                isActive: true,
                                startTime: app.starts_at,
                            };
                            hasChanges = true;
                        } else if (updated[app.id].isActive) {
                            updated[app.id].seconds = elapsedSeconds;
                        }
                    }
                });

                return hasChanges ? updated : prev;
            });
        }
    }, [rawAppointments]);

    const updateAppointmentMutation = useMutation({
        mutationFn: async ({
            appointmentId,
            payload
        }) => {
            return await apiRequest(`/appointments/${appointmentId}`, {
                method: "PUT",
                body: JSON.stringify(payload),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["doctor-sessions"]
            });
        },
    });

    // تحديث العداد كل ثانية للمواعيد النشطة فقط
    useEffect(() => {
        const interval = setInterval(() => {
            setTimers((prevTimers) => {
                const updated = {
                    ...prevTimers
                };
                let hasChanges = false;
                Object.keys(updated).forEach((appId) => {
                    if (updated[appId] ?.isActive) {
                        updated[appId].seconds += 1;
                        hasChanges = true;
                    }
                });
                return hasChanges ? updated : prevTimers;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTimer = (totalSeconds = 0) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        }
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    const handleStartSession = async (app, initialNotes = "تم بدء الجلسة") => {
        const nowStr = new Date().toISOString();

        setTimers((prev) => ({
            ...prev,
            [app.id]: {
                seconds: 0,
                isActive: true,
                startTime: nowStr,
            },
        }));

        const updatedPayload = {
            ...app,
            starts_at: nowStr, // وقت بدء الجلسة الفعلي
            status: "In-Progress",
            notes: initialNotes,
        };

        try {
            await updateAppointmentMutation.mutateAsync({
                appointmentId: app.id,
                payload: updatedPayload,
            });
            toast.success("تم بدء الجلسة بنجاح");
        } catch (error) {
            console.error("خطأ أثناء بدء الجلسة:", error);
            toast.error("فشل بدء الجلسة");
        }
    };

    const handlePauseSession = (appId) => {
        setTimers((prev) => ({
            ...prev,
            [appId]: {
                ...prev[appId],
                isActive: false,
            },
        }));
    };

    const handleCompleteSession = async (sessionId, appointmentId, prescriptionData) => {
        const endTimeStr = new Date().toISOString();
        try {
            handlePauseSession(appointmentId);

            const rawData = queryClient.getQueryData(["doctor-sessions"]) || [];
            const targetApp = rawData.find((app) => app.id === appointmentId) || {};

            const updatedPayload = {
                ...targetApp,
                status: "Completed",
                ends_at: endTimeStr, // وقت نهاية الجلسة الفعلي
                prescription: prescriptionData,
            };

            await updateAppointmentMutation.mutateAsync({
                appointmentId,
                payload: updatedPayload,
            });
            toast.success("تم إنهاء الجلسة بنجاح");
        } catch (error) {
            console.error("فشل إتمام الجلسة:", error);
            toast.error("فشل إتمام الجلسة");
        }
    };

    const enrichedAppointments = useMemo(() => {
        return rawAppointments.map((app) => {
            const matchedPatient = patientsList.find((p) => p.id === app.patient_id);
            const matchedDoctor = staffList.find((s) => s.id === app.doctor_id);

            return {
                ...app,
                patient_name: matchedPatient ?.full_name || app.patient_name || "مريض غير معروف",
                doctor_name: matchedDoctor ?.full_name || app.doctor_name || "طبيب غير محدد",
                patient_phone: matchedPatient ?.phone || app.patient_phone || "",
                patient_file_no: matchedPatient ?.file_no || app.patient_file_no || "",
                room_name: app.room_name || "غرفة غير محددة",
                service_name: app.service_name || "جلسة علاجية",
            };
        });
    }, [rawAppointments, patientsList, staffList]);

    const filteredAppointments = useMemo(() => {
        return enrichedAppointments.filter((app) => {
            const status = app.status ?.trim() ?.toLowerCase() || "";

            const hasStarted =
                status === "in-progress" ||
                status === "insession" ||
                status === "in_progress" ||
                status === "active" ||
                status === "ongoing" ||
                status === "قيد الجلسة" ||
                status === "completed" ||
                status === "منتهي" ||
                status === "مكتمل" ||
                status === "مكتملة";

            if (!hasStarted) return false;

            let matchesTab = true;
            if (activeTab === "In-Progress" || activeTab === "InSession") {
                matchesTab =
                    status === "in-progress" ||
                    status === "insession" ||
                    status === "in_progress" ||
                    status === "active" ||
                    status === "ongoing" ||
                    status === "قيد الجلسة";
            } else if (activeTab === "Completed") {
                matchesTab =
                    status === "completed" ||
                    status === "منتهي" ||
                    status === "مكتمل" ||
                    status === "مكتملة";
            }

            const matchesSearch =
                app.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                String(app.patient_file_no).toLowerCase().includes(searchQuery.toLowerCase());

            const appDate = app.appointment_date || app.created_at ?.split("T")[0];
            const matchesDate = selectedDate ? appDate === selectedDate : true;

            return matchesTab && matchesSearch && matchesDate;
        });
    }, [enrichedAppointments, activeTab, searchQuery, selectedDate]);

    return {
        appointments: filteredAppointments,
        allAppointments: enrichedAppointments,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedDate,
        setSelectedDate,
        timers,
        formatTimer,
        handleStartSession,
        handlePauseSession,
        handleCompleteSession,
        isLoading: doctorSessionsQuery.isLoading,
    };
}