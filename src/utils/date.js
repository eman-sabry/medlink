export function parseDate(isoString) {
  if (!isoString) return null;
  const cleaned = String(isoString).replace(/(\d{4}-\d{2}-)0(\d{2}T)/, "$1$2");
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? null : d;
}

export function formatTime(isoString, fallback = "09:00 ص") {
  const date = parseDate(isoString);
  if (!date) return isoString || fallback;
  return date.toLocaleTimeString("ar-EG-u-nu-latn", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(isoString, fallback = "4 أغسطس 2026") {
  const date = parseDate(isoString);
  if (!date) return isoString || fallback;
  try {
    return date.toLocaleDateString("ar-EG-u-nu-latn", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return date.toLocaleDateString() || fallback;
  }
}

export function formatDurationSeconds(totalSeconds = 0) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function toDateInputValue(isoString) {
  const date = parseDate(isoString);
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
