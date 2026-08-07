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

// تجميع عدد العناصر حسب الشهر الفعلي الموجود في البيانات (لا يفترض نطاق زمني ثابت)
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

// تجميع مجموع قيمة حقل معين حسب الشهر (مثل إجمالي الإيرادات شهرياً)
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

// تجميع عدد العناصر حسب قيمة حقل (مثل الحالة أو معرف الخدمة)، مع إمكانية تحويل المفتاح لتسمية مقروءة
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

// تجميع عدد العناصر حسب يوم الأسبوع (الأحد إلى السبت)
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

// تجميع عدد العناصر حسب ساعة اليوم (لعناصر يوم واحد فقط، مثل اتجاهات "اليوم" في نبض المركز)
// hourRange بصيغة [من, إلى] شاملة، تُستخدم كنافذة عرض افتراضية لساعات عمل المركز حتى لا يظهر مخطط بـ24 عموداً فارغاً
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

// يوجد الساعة الأكثر ازدحاماً عبر كل البيانات (وليس يوماً واحداً فقط)، لتحديد "ساعات الذروة"
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

// اتجاه آخر نقطتين في سلسلة شهرية (مثل الناتجة عن groupCountByMonth/groupSumByMonth)،
// يُستخدم لعرض "% مقارنة بالشهر الماضي" في بطاقات المؤشرات دون حساب يدوي متكرر في كل هوك
export function trendFromMonthlySeries(series, valueKey = "count") {
  if (!series || series.length < 2) return null;
  const current = series[series.length - 1][valueKey];
  const previous = series[series.length - 2][valueKey];
  return computeTrend(current, previous);
}

// نسبة التغير بين قيمتين (اليوم مقابل الأمس مثلاً)؛ يُعيد null عندما لا تتوفر مقارنة منطقية
export function computeTrend(current, previous) {
  if (previous === 0) {
    if (current === 0) return null;
    return { direction: "up", percent: 100 };
  }
  const percent = Math.round(((current - previous) / previous) * 100);
  if (percent === 0) return null;
  return { direction: percent > 0 ? "up" : "down", percent: Math.abs(percent) };
}

// متوسط المدة بالدقائق بين حقلي بداية ونهاية عبر مجموعة عناصر (يتجاهل القيم غير الصالحة أو السالبة)
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
