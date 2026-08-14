import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useAuth } from "./useAuth";
import { ROLES } from "../permissions/roles";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationApi,
} from "../services/notificationService";
import {
  playNotificationChime,
  isNotificationSoundEnabled,
  toggleNotificationSound,
  setNotificationSound,
} from "../utils/notificationSound";

const EMPTY_ARRAY = [];

export function useNotifications() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [soundEnabled, setSoundEnabledState] = useState(() => isNotificationSoundEnabled());

  const initialFetchDone = useRef(false);
  const knownNotificationIds = useRef(new Set());

  // Polling notifications every 12 seconds for responsive real-time updates
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiRequest("/notifications"),
    staleTime: 1000 * 5,
    refetchInterval: 12000,
    refetchOnWindowFocus: true,
  });

  const rawNotifications = notificationsQuery.data ?? EMPTY_ARRAY;

  // Filter notifications according to the current user's role and doctor assignment
  const userNotifications = useMemo(() => {
    if (!user) return EMPTY_ARRAY;

    const filtered = rawNotifications.filter((notif) => {
      // If notification has a specific user ID target
      if (notif.user_id && notif.user_id === user.id) return true;

      // Check role eligibility
      const targetRoles = Array.isArray(notif.target_roles)
        ? notif.target_roles
        : notif.target_roles
        ? [notif.target_roles]
        : [ROLES.OWNER, ROLES.SECRETARY, ROLES.DOCTOR];

      if (!targetRoles.includes(user.role)) return false;

      // If specific doctor staff ID is attached and user is a doctor
      if (user.role === ROLES.DOCTOR && notif.doctor_staff_id) {
        if (user.staff_id && notif.doctor_staff_id !== user.staff_id) {
          return false;
        }
      }

      return true;
    });

    // Sort newest first
    return filtered
      .map((notif) => {
        const isRead = Boolean(
          notif.is_read || (user?.id && Array.isArray(notif.read_by) && notif.read_by.includes(user.id))
        );
        return {
          ...notif,
          is_read_for_user: isRead,
        };
      })
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }, [rawNotifications, user]);

  const unreadNotifications = useMemo(
    () => userNotifications.filter((n) => !n.is_read_for_user),
    [userNotifications]
  );

  const unreadCount = unreadNotifications.length;

  // Audio chime trigger on newly incoming unread notifications
  useEffect(() => {
    if (!userNotifications || userNotifications.length === 0) return;

    if (!initialFetchDone.current) {
      // Record all existing notification IDs on initial mount without playing chime
      userNotifications.forEach((n) => knownNotificationIds.current.add(n.id));
      initialFetchDone.current = true;
      return;
    }

    // Detect new unread notifications that were not seen before
    const newUnreadItems = userNotifications.filter(
      (n) => !n.is_read_for_user && !knownNotificationIds.current.has(n.id)
    );

    if (newUnreadItems.length > 0) {
      newUnreadItems.forEach((n) => knownNotificationIds.current.add(n.id));
      const highestSeverity = newUnreadItems.some((n) => n.severity === "critical")
        ? "critical"
        : newUnreadItems.some((n) => n.severity === "warning")
        ? "warning"
        : newUnreadItems.some((n) => n.severity === "success")
        ? "success"
        : "info";

      playNotificationChime(highestSeverity);
    }
  }, [userNotifications]);

  // Mutations
  const markReadMutation = useMutation({
    mutationFn: (notification) => markNotificationAsRead(notification, user?.id),
    onMutate: async (notification) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueryData(["notifications"]);
      queryClient.setQueryData(["notifications"], (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((n) => {
          if (n.id === notification.id) {
            const readBy = Array.isArray(n.read_by) ? [...n.read_by] : [];
            if (user?.id && !readBy.includes(user.id)) readBy.push(user.id);
            return { ...n, is_read: true, read_by: readBy };
          }
          return n;
        });
      });
      return { previous };
    },
    onError: (_err, _notif, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["notifications"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(unreadNotifications, user?.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueryData(["notifications"]);
      queryClient.setQueryData(["notifications"], (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((n) => {
          const readBy = Array.isArray(n.read_by) ? [...n.read_by] : [];
          if (user?.id && !readBy.includes(user.id)) readBy.push(user.id);
          return { ...n, is_read: true, read_by: readBy };
        });
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["notifications"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => deleteNotificationApi(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueryData(["notifications"]);
      queryClient.setQueryData(["notifications"], (old) => {
        if (!Array.isArray(old)) return old;
        return old.filter((n) => n.id !== id);
      });
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["notifications"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleToggleSound = useCallback(() => {
    const next = toggleNotificationSound();
    setSoundEnabledState(next);
    if (next) {
      playNotificationChime("info");
    }
  }, []);

  const handleSetSound = useCallback((enabled) => {
    const next = setNotificationSound(enabled);
    setSoundEnabledState(next);
  }, []);

  return {
    ...notificationsQuery,
    notifications: userNotifications,
    unreadNotifications,
    unreadCount,
    markAsRead: markReadMutation.mutateAsync,
    markAllAsRead: markAllReadMutation.mutateAsync,
    deleteNotification: deleteNotificationMutation.mutateAsync,
    isMarkingRead: markReadMutation.isPending,
    isMarkingAllRead: markAllReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
    isSoundEnabled: soundEnabled,
    toggleSound: handleToggleSound,
    setSound: handleSetSound,
  };
}
