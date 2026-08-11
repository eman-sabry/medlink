import { countBy } from "../utils/stats";

export function buildOperationalAlerts({
  devices = [],
  maintenance = [],
  delayedAppointments = [],
  longWaitCount = 0,
  missedToday = 0,
  unpaidInvoicesCount = 0,
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

  if (unpaidInvoicesCount > 0) {
    alerts.push({
      id: "invoices",
      level: "warning",
      message: `${unpaidInvoicesCount} فاتورة غير مسددة`,
    });
  }

  return alerts;
}
