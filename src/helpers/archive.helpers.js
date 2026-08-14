import { ARCHIVE_RETENTION_DAYS, ARCHIVE_ENTITY_CONFIG } from "../constants/archiveConstants";

/**
 * Calculates remaining days until auto-permanent deletion.
 * @param {string} archivedAt
 * @param {string|null} customExpiresAt
 * @returns {number} Days remaining (positive, 0, or negative)
 */
export function getDaysUntilExpiration(archivedAt, customExpiresAt = null) {
  if (customExpiresAt) {
    const expTime = new Date(customExpiresAt).getTime();
    const now = Date.now();
    return Math.ceil((expTime - now) / (1000 * 60 * 60 * 24));
  }

  const archiveDate = new Date(archivedAt || Date.now());
  const expirationDate = new Date(archiveDate.getTime() + ARCHIVE_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const now = new Date();
  
  const diffTime = expirationDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Returns humanized Arabic text for remaining expiration duration.
 * @param {number} daysLeft
 * @returns {{ text: string, status: 'expired' | 'critical' | 'warning' | 'normal' }}
 */
export function formatExpirationStatus(daysLeft) {
  if (daysLeft <= 0) {
    return {
      text: "انتهت مدة الأرشفة (مؤهل للحذف)",
      status: "expired",
      badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    };
  }
  if (daysLeft === 1) {
    return {
      text: "يحذف اليوم أو غداً",
      status: "critical",
      badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse",
    };
  }
  if (daysLeft === 2) {
    return {
      text: "يحذف بعد يومين",
      status: "critical",
      badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    };
  }
  if (daysLeft <= 5) {
    return {
      text: `يحذف بعد ${daysLeft} أيام`,
      status: "warning",
      badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    };
  }
  if (daysLeft <= 10) {
    return {
      text: `يحذف بعد ${daysLeft} أيام`,
      status: "normal",
      badgeClass: "bg-muted text-muted-foreground border-border",
    };
  }
  return {
    text: `يحذف بعد ${daysLeft} يوماً`,
    status: "normal",
    badgeClass: "bg-muted text-muted-foreground border-border",
  };
}

/**
 * Formats full Arabic date & time.
 * @param {string} dateString
 * @returns {string}
 */
export function formatArchiveDate(dateString) {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "—";
    
    return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return dateString;
  }
}

/**
 * Filter and sort archived items.
 */
export function filterAndSortArchivedItems(items = [], { category = "all", searchQuery = "", sortOrder = "newest", userFilter = "all" }) {
  let result = [...items];

  // 1. Filter by category
  if (category !== "all") {
    result = result.filter((item) => item.entity_type === category);
  }

  // 2. Filter by archived_by user
  if (userFilter !== "all") {
    result = result.filter(
      (item) => item.archived_by_user_id === userFilter || item.archived_by === userFilter
    );
  }

  // 3. Search query across title, subtitle, secondary_info, reason, entity_id
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    result = result.filter((item) => {
      const title = (item.title || "").toLowerCase();
      const subtitle = (item.subtitle || "").toLowerCase();
      const secondary = (item.secondary_info || "").toLowerCase();
      const reason = (item.delete_reason || "").toLowerCase();
      const archivedBy = (item.archived_by || "").toLowerCase();
      const entityId = String(item.entity_id || "").toLowerCase();

      // Also check in original_data fields
      const orig = item.original_data || {};
      const name = (orig.full_name || orig.name || orig.description || orig.invoice_no || orig.title || "").toLowerCase();
      const phone = (orig.phone || "").toLowerCase();
      const fileNo = (orig.file_no || "").toLowerCase();

      return (
        title.includes(q) ||
        subtitle.includes(q) ||
        secondary.includes(q) ||
        reason.includes(q) ||
        archivedBy.includes(q) ||
        entityId.includes(q) ||
        name.includes(q) ||
        phone.includes(q) ||
        fileNo.includes(q)
      );
    });
  }

  // 4. Sort
  result.sort((a, b) => {
    const timeA = new Date(a.archived_at || a.created_at || 0).getTime();
    const timeB = new Date(b.archived_at || b.created_at || 0).getTime();

    if (sortOrder === "oldest") {
      return timeA - timeB;
    }
    if (sortOrder === "expiring_soon") {
      const daysA = getDaysUntilExpiration(a.archived_at, a.expires_at);
      const daysB = getDaysUntilExpiration(b.archived_at, b.expires_at);
      return daysA - daysB;
    }
    // Default newest
    return timeB - timeA;
  });

  return result;
}

/**
 * Counts items by entity type.
 */
export function calculateCategoryCounts(items = []) {
  const counts = {
    all: items.length,
  };

  Object.keys(ARCHIVE_ENTITY_CONFIG).forEach((k) => {
    if (k !== "all") {
      counts[k] = 0;
    }
  });

  items.forEach((item) => {
    const type = item.entity_type;
    if (counts[type] !== undefined) {
      counts[type] += 1;
    } else {
      counts[type] = 1;
    }
  });

  return counts;
}

/**
 * Generates descriptive title & subtitle for any entity before archiving.
 */
export function extractEntityDisplayInfo(entityType, entity) {
  if (!entity) return { title: "عنصر غير محدد", subtitle: "—", secondaryInfo: "" };

  switch (entityType) {
    case "patient":
      return {
        title: entity.full_name || "مريض بدون اسم",
        subtitle: entity.file_no ? `ملف: ${entity.file_no}` : `ID: ${entity.id}`,
        secondaryInfo: entity.phone ? `هاتف: ${entity.phone}` : "",
      };
    case "appointment":
      return {
        title: entity.patient_name ? `موعد للمريض: ${entity.patient_name}` : "موعد عيادة",
        subtitle: `${entity.date || entity.appointment_date || "—"} | ${entity.time || entity.appointment_time || "—"}`,
        secondaryInfo: entity.doctor_name ? `الطبيب: ${entity.doctor_name}` : "",
      };
    case "invoice":
      return {
        title: entity.patient_name ? `فاتورة مريض: ${entity.patient_name}` : `فاتورة ${entity.invoice_no || ""}`,
        subtitle: entity.invoice_no ? `رقم: ${entity.invoice_no}` : `فاتورة ID: ${entity.id}`,
        secondaryInfo: `${Number(entity.total_amount || entity.amount || 0).toLocaleString("en-US")} ج.م`,
      };
    case "package":
      return {
        title: entity.name || entity.title || "باقة علاجية",
        subtitle: `${entity.session_count || entity.sessions_count || 0} جلسات`,
        secondaryInfo: `${Number(entity.price || 0).toLocaleString("en-US")} ج.م`,
      };
    case "expense":
      return {
        title: entity.description || entity.title || "مصروف إداري / عيادي",
        subtitle: entity.category ? `تصنيف: ${entity.category}` : "مصروف",
        secondaryInfo: `${Number(entity.amount || 0).toLocaleString("en-US")} ج.م`,
      };
    case "device":
      return {
        title: entity.name || entity.device_name || "جهاز طبي",
        subtitle: entity.model ? `موديل: ${entity.model}` : (entity.serial_number ? `سيريال: ${entity.serial_number}` : "جهاز عيادة"),
        secondaryInfo: entity.status ? `الحالة السابقة: ${entity.status}` : "",
      };
    case "service":
      return {
        title: entity.name || "خدمة علاجية",
        subtitle: entity.duration_minutes ? `المدة: ${entity.duration_minutes} دقيقة` : "خدمة",
        secondaryInfo: `${Number(entity.price || 0).toLocaleString("en-US")} ج.م`,
      };
    case "room":
      return {
        title: entity.name || `غرفة ${entity.room_number || ""}`,
        subtitle: entity.type ? `النوع: ${entity.type}` : "غرفة علاج",
        secondaryInfo: entity.capacity ? `السعة: ${entity.capacity} أسرة` : "",
      };
    case "maintenance":
      return {
        title: entity.reason || entity.description || "طلب صيانة",
        subtitle: entity.device_name ? `الجهاز: ${entity.device_name}` : "صيانة دورية",
        secondaryInfo: entity.cost ? `${Number(entity.cost).toLocaleString("en-US")} ج.م` : "",
      };
    case "followup":
      return {
        title: entity.patient_name ? `متابعة: ${entity.patient_name}` : "متابعة غائب",
        subtitle: entity.reason ? `السبب: ${entity.reason}` : "متابعة هاتفية",
        secondaryInfo: entity.last_contact_date ? `آخر اتصال: ${entity.last_contact_date}` : "",
      };
    case "note":
      return {
        title: entity.title || "ملاحظة سريرية",
        subtitle: entity.patient_name ? `المريض: ${entity.patient_name}` : "توثيق داخلي",
        secondaryInfo: entity.category || "",
      };
    default:
      return {
        title: entity.name || entity.title || `عنصر (${entityType})`,
        subtitle: `ID: ${entity.id}`,
        secondaryInfo: "",
      };
  }
}
