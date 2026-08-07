export function parseDate(isoString) {
  if (!isoString) return null;
  const cleaned = String(isoString).replace(/(\d{4}-\d{2}-)0(\d{2}T)/, "$1$2");
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? null : d;
}

export function formatTime(isoString, fallback = "09:00 ص") {
  const date = parseDate(isoString);
  if (!date) return isoString || fallback;
  return date.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(isoString, fallback = "4 أغسطس 2026") {
  const date = parseDate(isoString);
  if (!date) return isoString || fallback;
  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function toDateInputValue(isoString) {
  const date = parseDate(isoString);
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
