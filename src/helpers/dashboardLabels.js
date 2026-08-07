import { STATUS_FILTER_OPTIONS } from "./appointmentStatus.helpers";

// تسميات عربية موحّدة لقيم الحالة الخام القادمة من قاعدة البيانات، تُستخدم في كل مخططات لوحات التحكم
export const APPOINTMENT_STATUS_LABELS = Object.fromEntries(
  STATUS_FILTER_OPTIONS.filter((o) => o.key !== "all").map((o) => [o.key, o.label]),
);

export const PATIENT_STATUS_LABELS = {
  Active: "نشط",
  Inactive: "غير نشط",
  Archived: "مؤرشف",
};

export const DEVICE_STATUS_LABELS = {
  Operational: "تعمل",
  Maintenance: "صيانة",
  "Out-Of-Service": "خارج الخدمة",
};

export const MAINTENANCE_STATUS_LABELS = {
  Pending: "قيد الانتظار",
  Completed: "مكتملة",
};

export const ROOM_STATUS_LABELS = {
  Available: "متاحة",
  Occupied: "مشغولة",
  Cleaning: "تحت التنظيف",
};
