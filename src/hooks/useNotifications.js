import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useAuth } from "./useAuth";

const EMPTY_ARRAY = [];

// جلب إشعارات المستخدم الحالي فقط عبر ربط notifications بجدول الربط notification_recipients
export function useNotifications() {
  const { user } = useAuth();

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiRequest("/notifications"),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const recipientsQuery = useQuery({
    queryKey: ["notification_recipients"],
    queryFn: () => apiRequest("/notification_recipients"),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const notifications = notificationsQuery.data ?? EMPTY_ARRAY;
  const recipients = recipientsQuery.data ?? EMPTY_ARRAY;

  const myNotifications = useMemo(() => {
    if (!user) return EMPTY_ARRAY;

    const notificationsById = new Map(notifications.map((n) => [n.id, n]));

    return recipients
      .filter((r) => r.user_id === user.id)
      .map((r) => {
        const notification = notificationsById.get(r.notification_id);
        return notification
          ? { ...notification, recipientId: r.id, readAt: r.read_at ?? null }
          : null;
      })
      .filter(Boolean);
  }, [notifications, recipients, user]);

  const unreadCount = useMemo(
    () => myNotifications.filter((n) => !n.readAt).length,
    [myNotifications],
  );

  return {
    isLoading: notificationsQuery.isLoading || recipientsQuery.isLoading,
    notifications: myNotifications,
    unreadCount,
  };
}
