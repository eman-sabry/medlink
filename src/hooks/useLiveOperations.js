import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { isSameDay } from "../utils/dashboardStats";
import {
  isInProgressStatus,
  isWaitingStatus,
} from "../helpers/appointmentStatus.helpers";
import {
  playLiveChime,
  isLiveSoundEnabled,
  toggleLiveSound,
  setLiveSound,
} from "../utils/liveAudioEngine";

const EMPTY_ARRAY = [];
const ACKNOWLEDGED_STORAGE_KEY = "medlink_live_acknowledged_events";

function formatSeconds(totalSeconds) {
  if (totalSeconds == null || isNaN(totalSeconds)) return "00:00";
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs.toString().padStart(2, "0")}:${remMins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function useLiveOperations() {
  const [secondsTick, setSecondsTick] = useState(() => Date.now());
  const [soundEnabled, setSoundEnabledState] = useState(() => isLiveSoundEnabled());
  const [acknowledgedIds, setAcknowledgedIds] = useState(() => {
    try {
      const saved = sessionStorage.getItem(ACKNOWLEDGED_STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const soundedEventIdsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);

  // 1-second live clock ticker for timers without refetching network
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsTick(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live clinic operational resources with 8s polling
  const appointmentsQuery = useQuery({
    queryKey: ["appointments"],
    queryFn: () => apiRequest("/appointments"),
    staleTime: 1000 * 5,
    refetchInterval: 8000,
    refetchOnWindowFocus: true,
  });

  const treatmentSessionsQuery = useQuery({
    queryKey: ["treatment_sessions"],
    queryFn: () => apiRequest("/treatment_sessions"),
    staleTime: 1000 * 5,
    refetchInterval: 8000,
    refetchOnWindowFocus: true,
  });

  const patientsQuery = useQuery({
    queryKey: ["patients"],
    queryFn: () => apiRequest("/patients"),
    staleTime: 1000 * 60 * 5,
  });

  const staffQuery = useQuery({
    queryKey: ["staff"],
    queryFn: () => apiRequest("/staff"),
    staleTime: 1000 * 60 * 5,
  });

  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: () => apiRequest("/rooms"),
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });

  const bedsQuery = useQuery({
    queryKey: ["treatment_beds"],
    queryFn: () => apiRequest("/treatment_beds"),
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });

  const appointments = appointmentsQuery.data ?? EMPTY_ARRAY;
  const treatmentSessions = treatmentSessionsQuery.data ?? EMPTY_ARRAY;
  const patients = patientsQuery.data ?? EMPTY_ARRAY;
  const staff = staffQuery.data ?? EMPTY_ARRAY;
  const rooms = roomsQuery.data ?? EMPTY_ARRAY;
  const beds = bedsQuery.data ?? EMPTY_ARRAY;

  // Lookup maps
  const patientsById = useMemo(
    () => new Map(patients.map((p) => [p.id, p])),
    [patients]
  );
  const staffById = useMemo(
    () => new Map(staff.map((s) => [s.id, s])),
    [staff]
  );
  const roomsById = useMemo(
    () => new Map(rooms.map((r) => [r.id, r])),
    [rooms]
  );
  const bedsById = useMemo(
    () => new Map(beds.map((b) => [b.id, b])),
    [beds]
  );

  const now = useMemo(() => new Date(secondsTick), [secondsTick]);

  // Filter today's appointments
  const todaysAppointments = useMemo(
    () => appointments.filter((a) => a.starts_at && isSameDay(a.starts_at, now)),
    [appointments, now]
  );

  // Active in-progress treatment sessions & appointments
  const activeSessions = useMemo(() => {
    return appointments
      .filter((app) => isInProgressStatus(app.status))
      .map((app) => {
        const session = treatmentSessions.find(
          (s) => s.appointment_id === app.id || s.id === app.treatment_session_id
        );
        const startTimeStr = session?.started_at || app.starts_at || app.started_at;
        const startTime = startTimeStr ? new Date(startTimeStr).getTime() : secondsTick;
        const elapsedSec = Math.max(0, Math.floor((secondsTick - startTime) / 1000));

        const patient = patientsById.get(app.patient_id);
        const doctor = staffById.get(app.doctor_id);
        const room = roomsById.get(app.room_id);
        const bed = bedsById.get(app.bed_id);

        return {
          id: `active-session-${app.id}`,
          rawId: app.id,
          sessionId: session?.id,
          appointmentId: app.id,
          type: "SESSION_ACTIVE",
          category: "session",
          priority: "important",
          title: "جلسة علاج نشطة",
          patientName: patient?.full_name || app.patient_name || "مريض",
          patientId: app.patient_id,
          patientPhone: patient?.phone || app.patient_phone || "",
          doctorName: doctor?.full_name || app.doctor_name || "طبيب المركز",
          doctorId: app.doctor_id,
          roomName: room?.name || (app.room_id ? `غرفة ${app.room_id}` : "غرفة الكشف"),
          bedName: bed?.name || "",
          startedAt: startTimeStr,
          elapsedSeconds: elapsedSec,
          timerDisplay: formatSeconds(elapsedSec),
          status: "InSession",
          timestamp: startTime,
        };
      });
  }, [appointments, treatmentSessions, patientsById, staffById, roomsById, bedsById, secondsTick]);

  // Waiting patients
  const waitingPatients = useMemo(() => {
    return todaysAppointments
      .filter((app) => isWaitingStatus(app.status))
      .map((app) => {
        const startTimeStr = app.arrived_at || app.starts_at;
        const startTime = startTimeStr ? new Date(startTimeStr).getTime() : secondsTick;
        const waitedMinutes = Math.max(0, Math.floor((secondsTick - startTime) / 60000));
        const patient = patientsById.get(app.patient_id);
        const doctor = staffById.get(app.doctor_id);
        const room = roomsById.get(app.room_id);

        const isLongWait = waitedMinutes >= 20;

        return {
          id: `waiting-${app.id}`,
          rawId: app.id,
          appointmentId: app.id,
          type: "PATIENT_WAITING",
          category: "waiting",
          priority: isLongWait ? "critical" : "important",
          title: "مريض في الانتظار",
          patientName: patient?.full_name || app.patient_name || "مريض",
          patientId: app.patient_id,
          patientPhone: patient?.phone || app.patient_phone || "",
          doctorName: doctor?.full_name || app.doctor_name || "غير محدد",
          doctorId: app.doctor_id,
          roomName: room?.name || "",
          scheduledTime: app.starts_at
            ? new Date(app.starts_at).toLocaleTimeString("ar-EG-u-nu-latn", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "",
          waitedMinutes,
          isLongWait,
          timerDisplay: `${waitedMinutes} دقيقة`,
          timestamp: startTime,
        };
      })
      .sort((a, b) => b.waitedMinutes - a.waitedMinutes);
  }, [todaysAppointments, patientsById, staffById, roomsById, secondsTick]);

  // Appointments NOW (around current time: -15 min to +30 min, scheduled)
  const appointmentsNow = useMemo(() => {
    return todaysAppointments
      .filter((app) => {
        if (app.status !== "Scheduled" && app.status !== "Confirmed") return false;
        if (!app.starts_at) return false;
        const appTime = new Date(app.starts_at).getTime();
        const diffMinutes = (appTime - secondsTick) / 60000;
        return diffMinutes >= -15 && diffMinutes <= 35;
      })
      .map((app) => {
        const patient = patientsById.get(app.patient_id);
        const doctor = staffById.get(app.doctor_id);
        const room = roomsById.get(app.room_id);

        const appTime = new Date(app.starts_at);
        const diffMinutes = Math.round((appTime.getTime() - secondsTick) / 60000);

        return {
          id: `app-now-${app.id}`,
          rawId: app.id,
          appointmentId: app.id,
          type: "APPOINTMENT_NOW",
          category: "now",
          priority: "important",
          title: "موعد الآن",
          patientName: patient?.full_name || app.patient_name || "مريض",
          patientId: app.patient_id,
          patientPhone: patient?.phone || app.patient_phone || "",
          doctorName: doctor?.full_name || app.doctor_name || "غير محدد",
          doctorId: app.doctor_id,
          roomName: room?.name || (app.room_id ? `غرفة ${app.room_id}` : ""),
          scheduledTime: appTime.toLocaleTimeString("ar-EG-u-nu-latn", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          diffMinutes,
          timeLabel:
            diffMinutes === 0
              ? "الآن"
              : diffMinutes > 0
              ? `بعد ${diffMinutes} دقيقة`
              : `منذ ${Math.abs(diffMinutes)} دقيقة`,
          timestamp: appTime.getTime(),
        };
      });
  }, [todaysAppointments, patientsById, staffById, roomsById, secondsTick]);

  // Delayed Appointments (scheduled time passed by >10 min, patient not arrived / not in session)
  const delayedAppointments = useMemo(() => {
    return todaysAppointments
      .filter((app) => {
        if (app.status !== "Scheduled" && app.status !== "Confirmed") return false;
        if (!app.starts_at) return false;
        const appTime = new Date(app.starts_at).getTime();
        const delayMins = (secondsTick - appTime) / 60000;
        return delayMins > 10;
      })
      .map((app) => {
        const patient = patientsById.get(app.patient_id);
        const doctor = staffById.get(app.doctor_id);
        const appTime = new Date(app.starts_at);
        const delayMinutes = Math.round((secondsTick - appTime.getTime()) / 60000);

        return {
          id: `delayed-${app.id}`,
          rawId: app.id,
          appointmentId: app.id,
          type: "DELAYED",
          category: "delayed",
          priority: "critical",
          title: "موعد متأخر",
          patientName: patient?.full_name || app.patient_name || "مريض",
          patientId: app.patient_id,
          patientPhone: patient?.phone || app.patient_phone || "",
          doctorName: doctor?.full_name || app.doctor_name || "غير محدد",
          doctorId: app.doctor_id,
          scheduledTime: appTime.toLocaleTimeString("ar-EG-u-nu-latn", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          delayMinutes,
          timerDisplay: `متأخر ${delayMinutes} دقيقة`,
          timestamp: appTime.getTime(),
        };
      })
      .sort((a, b) => b.delayMinutes - a.delayMinutes);
  }, [todaysAppointments, patientsById, staffById, secondsTick]);

  // Completed sessions today (recent ones)
  const completedSessions = useMemo(() => {
    return treatmentSessions
      .filter((session) => {
        if (!session.ended_at) return false;
        return isSameDay(session.ended_at, now);
      })
      .map((session) => {
        const patient = patientsById.get(session.patient_id);
        const doctor = staffById.get(session.doctor_id);
        const room = roomsById.get(session.room_id);
        const endTime = new Date(session.ended_at).getTime();

        return {
          id: `completed-session-${session.id}`,
          rawId: session.id,
          sessionId: session.id,
          appointmentId: session.appointment_id,
          type: "SESSION_COMPLETED",
          category: "completed",
          priority: "normal",
          title: "اكتمال جلسة العلاج",
          patientName: patient?.full_name || "مريض",
          patientId: session.patient_id,
          doctorName: doctor?.full_name || "طبيب المركز",
          doctorId: session.doctor_id,
          roomName: room?.name || "",
          durationMinutes: session.duration_minutes || 30,
          completedTime: new Date(session.ended_at).toLocaleTimeString("ar-EG-u-nu-latn", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          timestamp: endTime,
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  }, [treatmentSessions, patientsById, staffById, roomsById, now]);

  // Available Doctors Status
  const doctorStatuses = useMemo(() => {
    const busyDoctorIds = new Set(activeSessions.map((s) => s.doctorId));
    const doctors = staff.filter((s) => s.staff_type === "Doctor" || s.role === "Doctor");

    return doctors.map((doc) => {
      const isBusy = busyDoctorIds.has(doc.id);
      return {
        id: `doctor-${doc.id}`,
        rawId: doc.id,
        doctorId: doc.id,
        type: isBusy ? "DOCTOR_BUSY" : "DOCTOR_AVAILABLE",
        category: "doctor",
        priority: "normal",
        title: isBusy ? "طبيب في جلسة" : "طبيب متاح",
        doctorName: doc.full_name,
        specialty: doc.specialty || "علاج طبيعي",
        isAvailable: !isBusy,
        timestamp: secondsTick,
      };
    });
  }, [staff, activeSessions, secondsTick]);

  // Room Statuses
  const roomStatuses = useMemo(() => {
    const occupiedRoomMap = new Map();
    activeSessions.forEach((s) => {
      if (s.roomName) {
        occupiedRoomMap.set(s.roomName, s);
      }
    });

    return rooms.map((room) => {
      const activeSessionInRoom = occupiedRoomMap.get(room.name) || activeSessions.find(s => s.roomName === room.name);
      const isOccupied = room.status === "Occupied" || Boolean(activeSessionInRoom);

      return {
        id: `room-${room.id}`,
        rawId: room.id,
        roomId: room.id,
        type: "ROOM_STATUS",
        category: "room",
        priority: "normal",
        title: `غرفة ${room.name}`,
        roomName: room.name,
        status: isOccupied ? "Occupied" : room.status || "Available",
        isOccupied,
        activeDoctorName: activeSessionInRoom?.doctorName || "",
        activePatientName: activeSessionInRoom?.patientName || "",
        timestamp: secondsTick,
      };
    });
  }, [rooms, activeSessions, secondsTick]);

  // Synthesize unified list of all live operational events
  const allEvents = useMemo(() => {
    // Priority order: Delayed (Critical) -> Active Sessions -> Waiting -> Now -> Completed -> Available Doctors
    const list = [
      ...delayedAppointments,
      ...activeSessions,
      ...waitingPatients,
      ...appointmentsNow,
      ...completedSessions,
    ];

    return list
      .map((ev) => ({
        ...ev,
        isNew: !acknowledgedIds.has(ev.id),
      }))
      .slice(0, 25);
  }, [delayedAppointments, activeSessions, waitingPatients, appointmentsNow, completedSessions, acknowledgedIds]);

  // Unacknowledged (New) count
  const newEventsCount = useMemo(() => {
    return allEvents.filter((e) => e.isNew).length;
  }, [allEvents]);

  // Critical attention flag for launcher pulsing
  const hasCriticalAttention = useMemo(() => {
    return delayedAppointments.some((e) => !acknowledgedIds.has(e.id)) ||
      waitingPatients.some((e) => e.isLongWait && !acknowledgedIds.has(e.id));
  }, [delayedAppointments, waitingPatients, acknowledgedIds]);

  // Audio trigger on newly discovered events
  useEffect(() => {
    if (allEvents.length === 0) return;

    if (isInitialLoadRef.current) {
      // First load: register existing IDs without spamming sound
      allEvents.forEach((ev) => soundedEventIdsRef.current.add(ev.id));
      isInitialLoadRef.current = false;
      return;
    }

    // Check for any newly arrived event ID
    let highestPriority = null;
    let hasNewSound = false;

    allEvents.forEach((ev) => {
      if (!soundedEventIdsRef.current.has(ev.id)) {
        soundedEventIdsRef.current.add(ev.id);
        hasNewSound = true;

        if (ev.priority === "critical") {
          highestPriority = "critical";
        } else if (ev.priority === "important" && highestPriority !== "critical") {
          highestPriority = "important";
        } else if (!highestPriority) {
          highestPriority = "normal";
        }
      }
    });

    if (hasNewSound && highestPriority) {
      playLiveChime(highestPriority);
    }
  }, [allEvents]);

  // Acknowledge single event
  const acknowledgeEvent = useCallback((eventId) => {
    setAcknowledgedIds((prev) => {
      const next = new Set(prev);
      next.add(eventId);
      try {
        sessionStorage.setItem(ACKNOWLEDGED_STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Acknowledge all current events
  const acknowledgeAll = useCallback(() => {
    setAcknowledgedIds((prev) => {
      const next = new Set(prev);
      allEvents.forEach((e) => next.add(e.id));
      try {
        sessionStorage.setItem(ACKNOWLEDGED_STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  }, [allEvents]);

  const handleToggleSound = useCallback(() => {
    const nextState = toggleLiveSound();
    setSoundEnabledState(nextState);
    return nextState;
  }, []);

  const handleSetSound = useCallback((enabled) => {
    const nextState = setLiveSound(enabled);
    setSoundEnabledState(nextState);
    return nextState;
  }, []);

  return {
    isLoading: appointmentsQuery.isLoading || treatmentSessionsQuery.isLoading,
    activeSessions,
    waitingPatients,
    appointmentsNow,
    delayedAppointments,
    completedSessions,
    doctorStatuses,
    roomStatuses,
    allEvents,
    newEventsCount,
    hasCriticalAttention,
    soundEnabled,
    toggleSound: handleToggleSound,
    setSound: handleSetSound,
    acknowledgeEvent,
    acknowledgeAll,
    refetch: () => {
      appointmentsQuery.refetch();
      treatmentSessionsQuery.refetch();
    },
  };
}
