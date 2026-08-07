import {
  Package,
  DollarSign,
  Percent,
  Layers,
  Zap,
  CheckCircle2,
} from "lucide-react";

export const PACKAGE_FORM_FIELDS = [
  {
    name: "name",
    label: "اسم الباقة",
    type: "text",
    placeholder: "مثال: باقة علاجية متكاملة 1",
    icon: Package,
  },
  {
    name: "price",
    label: "السعر (ج.م)",
    type: "number",
    placeholder: "1600",
    icon: DollarSign,
  },
  {
    name: "discount_percent",
    label: "نسبة الخصم (%)",
    type: "number",
    placeholder: "10",
    icon: Percent,
  },
  {
    name: "session_count",
    label: "عدد الجلسات",
    type: "number",
    placeholder: "6",
    icon: Layers,
  },
  {
    name: "badge",
    label: "شارة التمييز (اختياري)",
    type: "text",
    placeholder: "مثال: الأكثر مبيعاً",
    icon: Zap,
  },
  {
    name: "features_text",
    label: "مميزات الباقة (كل ميزة في سطر أو تفصل بينها فاصلة)",
    type: "textarea",
    placeholder: "مرونة كاملة في المواعيد\nتقييم دوري\nحجز فوري",
    icon: CheckCircle2,
  },
  {
    name: "status",
    label: "حالة الباقة",
    type: "select",
    icon: CheckCircle2,
    options: [
      { label: "نشطة (Active)", value: "Active" },
      { label: "غير نشطة (Inactive)", value: "Inactive" },
    ],
  },
];

// تحويل بيانات الفورم (نص المميزات وأرقام السعر) إلى الشكل الجاهز للإرسال للـ API
export function buildPackagePayload(formData) {
  const formattedFeatures = formData.features_text
    ? String(formData.features_text)
        .split(/\r?\n|,/)
        .map((f) => f.trim())
        .filter(Boolean)
    : [];

  const payload = {
    ...formData,
    features: formattedFeatures,
    price: Number(formData.price),
    discount_percent: Number(formData.discount_percent || 0),
    session_count: Number(formData.session_count),
  };

  delete payload.features_text;

  return payload;
}
