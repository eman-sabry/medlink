import {
  Calendar,
  CalendarCheck,
  CalendarX,
  User,
  UserCheck,
  Activity,
  Receipt,
  CreditCard,
  Wallet,
  Cpu,
  Wrench,
  DoorOpen,
  BedDouble,
  Package,
  AlertTriangle,
  Info,
  ShieldAlert,
} from "lucide-react";

export const NOTIFICATION_TYPES = {
  // Appointments
  APPOINTMENT_CREATED: "appointment_created",
  APPOINTMENT_UPDATED: "appointment_updated",
  APPOINTMENT_CANCELLED: "appointment_cancelled",
  APPOINTMENT_STATUS_CHANGED: "appointment_status_changed",
  APPOINTMENT_UPCOMING: "appointment_upcoming",
  
  // Patients
  PATIENT_REGISTERED: "patient_registered",
  PATIENT_ARRIVED: "patient_arrived",
  PATIENT_ABSENT: "patient_absent",
  
  // Sessions
  SESSION_STARTED: "session_started",
  SESSION_COMPLETED: "session_completed",
  SESSION_CANCELLED: "session_cancelled",
  
  // Invoices & Billing
  INVOICE_CREATED: "invoice_created",
  INVOICE_PAID: "invoice_paid",
  INVOICE_UPDATED: "invoice_updated",
  PAYMENT_RECEIVED: "payment_received",
  
  // Expenses
  EXPENSE_CREATED: "expense_created",
  EXPENSE_UPDATED: "expense_updated",
  EXPENSE_HIGH_ALERT: "expense_high_alert",
  
  // Devices & Maintenance
  DEVICE_ADDED: "device_added",
  DEVICE_STATUS_CHANGED: "device_status_changed",
  DEVICE_MAINTENANCE: "device_maintenance",
  MAINTENANCE_COMPLETED: "maintenance_completed",
  
  // Rooms & Beds
  ROOM_STATUS_CHANGED: "room_status_changed",
  BED_STATUS_CHANGED: "bed_status_changed",
  
  // Packages
  PACKAGE_ASSIGNED: "package_assigned",
  PACKAGE_SESSION_USED: "package_session_used",
  PACKAGE_EXPIRING: "package_expiring",
  
  // General / System
  SYSTEM_ALERT: "system_alert",
};

export const NOTIFICATION_SEVERITIES = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  CRITICAL: "critical",
};

export const SEVERITY_CONFIG = {
  info: {
    label: "معلومات",
    bgClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    badgeClass: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300",
    dotClass: "bg-sky-500",
    borderClass: "border-sky-500/30",
  },
  success: {
    label: "نجاح",
    bgClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    dotClass: "bg-emerald-500",
    borderClass: "border-emerald-500/30",
  },
  warning: {
    label: "تنبيه",
    bgClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    dotClass: "bg-amber-500",
    borderClass: "border-amber-500/30",
  },
  critical: {
    label: "عاجل",
    bgClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
    dotClass: "bg-rose-500",
    borderClass: "border-rose-500/30",
  },
};

export function getNotificationIcon(type, entityType) {
  switch (type) {
    case NOTIFICATION_TYPES.APPOINTMENT_CREATED:
    case NOTIFICATION_TYPES.APPOINTMENT_UPCOMING:
      return Calendar;
    case NOTIFICATION_TYPES.APPOINTMENT_UPDATED:
    case NOTIFICATION_TYPES.APPOINTMENT_STATUS_CHANGED:
      return CalendarCheck;
    case NOTIFICATION_TYPES.APPOINTMENT_CANCELLED:
      return CalendarX;
      
    case NOTIFICATION_TYPES.PATIENT_REGISTERED:
      return User;
    case NOTIFICATION_TYPES.PATIENT_ARRIVED:
      return UserCheck;
    case NOTIFICATION_TYPES.PATIENT_ABSENT:
      return ShieldAlert;
      
    case NOTIFICATION_TYPES.SESSION_STARTED:
    case NOTIFICATION_TYPES.SESSION_COMPLETED:
    case NOTIFICATION_TYPES.SESSION_CANCELLED:
      return Activity;
      
    case NOTIFICATION_TYPES.INVOICE_CREATED:
    case NOTIFICATION_TYPES.INVOICE_UPDATED:
      return Receipt;
    case NOTIFICATION_TYPES.INVOICE_PAID:
    case NOTIFICATION_TYPES.PAYMENT_RECEIVED:
      return CreditCard;
      
    case NOTIFICATION_TYPES.EXPENSE_CREATED:
    case NOTIFICATION_TYPES.EXPENSE_UPDATED:
    case NOTIFICATION_TYPES.EXPENSE_HIGH_ALERT:
      return Wallet;
      
    case NOTIFICATION_TYPES.DEVICE_ADDED:
    case NOTIFICATION_TYPES.DEVICE_STATUS_CHANGED:
      return Cpu;
    case NOTIFICATION_TYPES.DEVICE_MAINTENANCE:
    case NOTIFICATION_TYPES.MAINTENANCE_COMPLETED:
      return Wrench;
      
    case NOTIFICATION_TYPES.ROOM_STATUS_CHANGED:
      return DoorOpen;
    case NOTIFICATION_TYPES.BED_STATUS_CHANGED:
      return BedDouble;
      
    case NOTIFICATION_TYPES.PACKAGE_ASSIGNED:
    case NOTIFICATION_TYPES.PACKAGE_SESSION_USED:
    case NOTIFICATION_TYPES.PACKAGE_EXPIRING:
      return Package;
      
    case NOTIFICATION_TYPES.SYSTEM_ALERT:
      return AlertTriangle;
      
    default:
      switch (entityType) {
        case "appointment":
          return Calendar;
        case "patient":
          return User;
        case "session":
          return Activity;
        case "invoice":
          return Receipt;
        case "payment":
          return CreditCard;
        case "expense":
          return Wallet;
        case "device":
          return Cpu;
        case "maintenance":
          return Wrench;
        case "room":
          return DoorOpen;
        case "bed":
          return BedDouble;
        case "package":
          return Package;
        default:
          return Info;
      }
  }
}

export function getNotificationRoute(notification) {
  if (!notification) return "/dashboard";
  const { entity_type, entity_id, metadata } = notification;

  switch (entity_type) {
    case "appointment":
      return metadata?.appointment_id ? `/appointments` : `/appointments`;
    case "patient":
      return entity_id ? `/patients/${entity_id}` : `/patients`;
    case "session":
      if (metadata?.appointment_id) {
        return `/sessions/${metadata.appointment_id}`;
      }
      return entity_id ? `/sessions/${entity_id}` : `/sessions`;
    case "invoice":
      return `/invoices`;
    case "payment":
      return `/invoices`;
    case "expense":
      return `/expenses`;
    case "device":
      return `/devices`;
    case "maintenance":
      return `/maintenance`;
    case "room":
    case "bed":
      return `/rooms`;
    case "package":
      return metadata?.patient_id ? `/patients/${metadata.patient_id}` : `/packages`;
    case "follow_up":
      return `/followup`;
    default:
      return "/dashboard";
  }
}

export function formatNotificationTime(isoString) {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 45) return "الآن";
    if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays === 1) return "أمس";
    if (diffDays < 7) return `منذ ${diffDays} أيام`;

    return date.toLocaleDateString("ar-EG-u-nu-latn", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
