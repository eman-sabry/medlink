import { Building2, CheckCircle2 } from "lucide-react";

export const ROOM_FORM_FIELDS = [
  {
    name: "name",
    label: "اسم الغرفة",
    type: "text",
    placeholder: "مثال: غرفة رقم 11",
    icon: Building2,
  },
  {
    name: "type",
    label: "نوع الغرفة",
    type: "select",
    icon: Building2,
    options: [
      { label: "استشارة طبية (Consultation)", value: "Consultation" },
      { label: "قاعة تأهيل (Rehab)", value: "Rehab" },
      { label: "غرفة علاج (Treatment)", value: "Treatment" },
    ],
  },
  {
    name: "status",
    label: "الحالة الأولية",
    type: "select",
    icon: CheckCircle2,
    options: [
      { label: "متاحة (Available)", value: "Available" },
      { label: "مشغولة (Occupied)", value: "Occupied" },
      { label: "تحت التنظيف (Cleaning)", value: "Cleaning" },
    ],
  },
];

// تجميع الأسرة/الأجهزة/المعدات حسب معرف الغرفة (بدلاً من فلترة كل المصفوفة لكل غرفة أثناء العرض)
export function groupByRoomId(items) {
  const map = new Map();
  for (const item of items) {
    const list = map.get(item.room_id) ?? [];
    list.push(item);
    map.set(item.room_id, list);
  }
  return map;
}
