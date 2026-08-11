export const PACKAGE_STATUS_META = {
  Active: { label: "نشطة", badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  Completed: { label: "مكتملة", badge: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  Expired: { label: "منتهية الصلاحية", badge: "bg-slate-500/10 text-slate-600 border-slate-500/20" },
  Cancelled: { label: "ملغاة", badge: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
  PaymentPending: { label: "بانتظار الدفع", badge: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
};

export const PACKAGE_PAYMENT_STATUS_LABELS = {
  Paid: "مدفوعة بالكامل",
  PartiallyPaid: "مدفوعة جزئياً",
  Unpaid: "غير مدفوعة",
};

export function computePackageStatus(pkg) {
  if (!pkg) return "Active";
  if (pkg.status === "Cancelled") return "Cancelled";
  if (pkg.payment_status && pkg.payment_status !== "Paid" && pkg.payment_status !== "PartiallyPaid") {
    return "PaymentPending";
  }
  const remaining = Math.max(0, (pkg.sessions_total ?? 0) - (pkg.sessions_used_cache ?? 0));
  if (remaining <= 0) return "Completed";
  if (pkg.end_date && new Date(pkg.end_date).getTime() < Date.now()) return "Expired";
  return "Active";
}

export function isPackageUsable(pkg) {
  return computePackageStatus(pkg) === "Active";
}

export function filterUsablePackagesForPatient(patientPackages, patientId) {
  if (!patientId) return [];
  return patientPackages.filter((pkg) => pkg.patient_id === patientId && isPackageUsable(pkg));
}

export function findActivePackageForPatient(patientPackages, patientId) {
  return filterUsablePackagesForPatient(patientPackages, patientId)[0] ?? null;
}

export function getActivePackages(enrichedPatientPackages = []) {
  return enrichedPatientPackages.filter((pkg) => pkg.computedStatus === "Active");
}
