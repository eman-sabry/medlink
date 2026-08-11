const ARABIC_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

const ARABIC_WEEKDAYS = [
  "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت",
];

function toValidDate(raw) {
  if (!raw) return null;
  const date = new Date(raw);
  return isNaN(date.getTime()) ? null : date;
}

export function groupCountByMonth(items, dateField) {
  const buckets = new Map();
  for (const item of items) {
    const date = toValidDate(item[dateField]);
    if (!date) continue;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => {
      const [year, month] = key.split("-").map(Number);
      return { month: `${ARABIC_MONTHS[month - 1]} ${year}`, count };
    });
}

export function groupSumByMonth(items, dateField, valueField) {
  const buckets = new Map();
  for (const item of items) {
    const date = toValidDate(item[dateField]);
    if (!date) continue;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const value = Number(item[valueField]) || 0;
    buckets.set(key, (buckets.get(key) ?? 0) + value);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, total]) => {
      const [year, month] = key.split("-").map(Number);
      return { month: `${ARABIC_MONTHS[month - 1]} ${year}`, total };
    });
}

export function groupSumByDay(items, dateField, valueField, days = 14, referenceDate = new Date()) {
  const buckets = new Map();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    buckets.set(key, 0);
  }
  for (const item of items) {
    const date = toValidDate(item[dateField]);
    if (!date) continue;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    if (!buckets.has(key)) continue;
    const value = Number(item[valueField]) || 0;
    buckets.set(key, buckets.get(key) + value);
  }
  return [...buckets.entries()].map(([key, total]) => {
    const [, month, day] = key.split("-").map(Number);
    return { day: `${day} ${ARABIC_MONTHS[month - 1]}`, total };
  });
}

export function groupSumByField(items, field, valueField, resolveLabel) {
  const buckets = new Map();
  for (const item of items) {
    const key = item[field];
    if (key === undefined || key === null || key === "") continue;
    const value = Number(item[valueField]) || 0;
    buckets.set(key, (buckets.get(key) ?? 0) + value);
  }
  return [...buckets.entries()].map(([key, value]) => ({
    name: resolveLabel ? resolveLabel(key) : String(key),
    value,
  }));
}

export function groupCountByField(items, field, resolveLabel) {
  const buckets = new Map();
  for (const item of items) {
    const key = item[field];
    if (key === undefined || key === null || key === "") continue;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return [...buckets.entries()].map(([key, count]) => ({
    name: resolveLabel ? resolveLabel(key) : String(key),
    value: count,
  }));
}

export function groupCountByWeekday(items, dateField) {
  const counts = new Array(7).fill(0);
  for (const item of items) {
    const date = toValidDate(item[dateField]);
    if (!date) continue;
    counts[date.getDay()] += 1;
  }
  return ARABIC_WEEKDAYS.map((day, i) => ({ day, count: counts[i] }));
}

export function isSameDay(isoString, referenceDate) {
  const date = toValidDate(isoString);
  if (!date) return false;
  return (
    date.getFullYear() === referenceDate.getFullYear() &&
    date.getMonth() === referenceDate.getMonth() &&
    date.getDate() === referenceDate.getDate()
  );
}

export function groupCountByHour(items, dateField, referenceDate, hourRange = [7, 19]) {
  const [startHour, endHour] = hourRange;
  const hours = [];
  for (let h = startHour; h <= endHour; h++) hours.push(h);

  const counts = new Map(hours.map((h) => [h, 0]));
  for (const item of items) {
    const date = toValidDate(item[dateField]);
    if (!date || !isSameDay(item[dateField], referenceDate)) continue;
    const hour = date.getHours();
    if (counts.has(hour)) counts.set(hour, counts.get(hour) + 1);
  }

  return hours.map((h) => ({
    hour: `${String(h).padStart(2, "0")}:00`,
    count: counts.get(h),
  }));
}

export function findPeakHour(items, dateField) {
  const counts = new Map();
  for (const item of items) {
    const date = toValidDate(item[dateField]);
    if (!date) continue;
    const hour = date.getHours();
    counts.set(hour, (counts.get(hour) ?? 0) + 1);
  }
  if (counts.size === 0) return null;

  const [peakHour, peakCount] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return { hour: `${String(peakHour).padStart(2, "0")}:00`, count: peakCount };
}

export function trendFromMonthlySeries(series, valueKey = "count") {
  if (!series || series.length < 2) return null;
  const current = series[series.length - 1][valueKey];
  const previous = series[series.length - 2][valueKey];
  return computeTrend(current, previous);
}

export function computeTrend(current, previous) {
  if (previous === 0) {
    if (current === 0) return null;
    return { direction: "up", percent: 100 };
  }
  const percent = Math.round(((current - previous) / previous) * 100);
  if (percent === 0) return null;
  return { direction: percent > 0 ? "up" : "down", percent: Math.abs(percent) };
}

function monthSortKey(label) {
  const [name, year] = label.split(" ");
  const index = ARABIC_MONTHS.indexOf(name);
  return `${year}-${String(index + 1).padStart(2, "0")}`;
}

export function mergeMonthlySeries(seriesA, keyA, seriesB, keyB, valueField = "count") {
  const merged = new Map();
  for (const item of seriesA) {
    merged.set(item.month, { month: item.month, [keyA]: item[valueField] ?? 0 });
  }
  for (const item of seriesB) {
    const existing = merged.get(item.month) ?? { month: item.month };
    existing[keyB] = item[valueField] ?? 0;
    merged.set(item.month, existing);
  }
  return [...merged.values()].sort((a, b) => monthSortKey(a.month).localeCompare(monthSortKey(b.month)));
}

export function mergeDailySeries(seriesA, keyA, seriesB, keyB, valueField = "total") {
  const merged = new Map();
  for (const item of seriesA) {
    merged.set(item.day, { day: item.day, [keyA]: item[valueField] ?? 0 });
  }
  for (const item of seriesB) {
    const existing = merged.get(item.day) ?? { day: item.day };
    existing[keyB] = item[valueField] ?? 0;
    merged.set(item.day, existing);
  }
  return [...merged.values()];
}

export function averageDurationMinutes(items, startField, endField) {
  const durations = [];
  for (const item of items) {
    const start = toValidDate(item[startField]);
    const end = toValidDate(item[endField]);
    if (!start || !end) continue;
    const minutes = (end - start) / (1000 * 60);
    if (minutes > 0) durations.push(minutes);
  }
  if (durations.length === 0) return null;
  return durations.reduce((sum, m) => sum + m, 0) / durations.length;
}
