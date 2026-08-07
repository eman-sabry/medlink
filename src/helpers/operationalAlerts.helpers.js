import { countBy } from "../utils/stats";

// تنبيهات تشغيلية مشتركة (تُستخدم في لوحة المالك ونبض المركز) لتفادي تكرار نفس المنطق.
// المعاملات الإضافية (delayedAppointments/longWaitCount/missedToday) اختيارية حتى لا تتأثر
// لوحة المالك التي لا تمرّرها.
export function buildOperationalAlerts({
  devices = [],
  maintenance = [],
  invoices = [],
  delayedAppointments = [],
  longWaitCount = 0,
  missedToday = 0,
}) {
  const alerts = [];

  if (delayedAppointments.length > 0) {
    alerts.push({
      id: "delayed",
      level: "error",
      message: `${delayedAppointments.length} موعد متأخر عن وقته`,
    });
  }

  const outOfService = countBy(devices, (d) => d.status === "Out-Of-Service");
  if (outOfService > 0) {
    alerts.push({ id: "devices", level: "error", message: `${outOfService} جهاز خارج الخدمة` });
  }

  if (longWaitCount > 0) {
    alerts.push({
      id: "long-wait",
      level: "warning",
      message: `${longWaitCount} مريض ينتظر منذ أكثر من 30 دقيقة`,
    });
  }

  const pendingMaintenance = countBy(maintenance, (m) => m.status === "Pending");
  if (pendingMaintenance > 0) {
    alerts.push({
      id: "maintenance",
      level: "warning",
      message: `${pendingMaintenance} طلب صيانة قيد الانتظار`,
    });
  }

  if (missedToday > 0) {
    alerts.push({
      id: "missed",
      level: "warning",
      message: `${missedToday} موعد لم يحضر صاحبه اليوم`,
    });
  }

  const overdueInvoices = countBy(invoices, (i) => i.status !== "Paid");
  if (overdueInvoices > 0) {
    alerts.push({
      id: "invoices",
      level: "warning",
      message: `${overdueInvoices} فاتورة غير مسددة`,
    });
  }

  return alerts;
}
