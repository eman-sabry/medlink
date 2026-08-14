import { apiRequest } from "../api/client";
import { ALL_ROLES } from "../permissions/roles";
import { NOTIFICATION_TYPES, NOTIFICATION_SEVERITIES } from "../constants/notificationTypes";

const RECENT_KEYS_CACHE = new Set();

/**
 * Service for managing clinic notifications
 */
export async function createNotification({
  type = NOTIFICATION_TYPES.SYSTEM_ALERT,
  title,
  message,
  severity = NOTIFICATION_SEVERITIES.INFO,
  entityType = "system",
  entityId = null,
  targetRoles = ALL_ROLES,
  doctorStaffId = null,
  recipientUserId = null,
  metadata = {},
  idempotencyKey = null,
}) {
  try {
    if (!title || !message) return null;

    // In-memory quick deduplication check
    const dedupKey = idempotencyKey || `${type}_${entityId}_${doctorStaffId || "all"}_${Math.floor(Date.now() / 15000)}`;
    if (RECENT_KEYS_CACHE.has(dedupKey)) {
      return null;
    }
    RECENT_KEYS_CACHE.add(dedupKey);
    // Keep memory clean
    if (RECENT_KEYS_CACHE.size > 200) {
      const it = RECENT_KEYS_CACHE.values();
      for (let i = 0; i < 50; i++) {
        RECENT_KEYS_CACHE.delete(it.next().value);
      }
    }

    const payload = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      title,
      message,
      severity,
      entity_type: entityType,
      entity_id: entityId,
      target_roles: Array.isArray(targetRoles) ? targetRoles : [targetRoles],
      doctor_staff_id: doctorStaffId || null,
      user_id: recipientUserId || null,
      read_by: [],
      is_read: false,
      created_at: new Date().toISOString(),
      metadata: {
        ...metadata,
        idempotency_key: dedupKey,
      },
    };

    return await apiRequest("/notifications", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.warn("Failed to create notification:", error);
    return null;
  }
}

/**
 * Mark a single notification as read by a user
 */
export async function markNotificationAsRead(notification, userId) {
  if (!notification || !notification.id) return;
  try {
    const existingReadBy = Array.isArray(notification.read_by) ? notification.read_by : [];
    const updatedReadBy = userId && !existingReadBy.includes(userId)
      ? [...existingReadBy, userId]
      : existingReadBy;

    return await apiRequest(`/notifications/${notification.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        is_read: true,
        read_by: updatedReadBy,
      }),
    });
  } catch (error) {
    console.warn("Failed to mark notification as read:", error);
  }
}

/**
 * Mark multiple / all notifications as read for current user
 */
export async function markAllNotificationsAsRead(notifications, userId) {
  if (!Array.isArray(notifications) || notifications.length === 0) return;
  try {
    const promises = notifications.map((notif) => {
      const readBy = Array.isArray(notif.read_by) ? notif.read_by : [];
      const updatedReadBy = userId && !readBy.includes(userId) ? [...readBy, userId] : readBy;
      return apiRequest(`/notifications/${notif.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          is_read: true,
          read_by: updatedReadBy,
        }),
      });
    });
    await Promise.all(promises);
  } catch (error) {
    console.warn("Failed to mark all notifications as read:", error);
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId) {
  if (!notificationId) return;
  try {
    return await apiRequest(`/notifications/${notificationId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.warn("Failed to delete notification:", error);
  }
}
