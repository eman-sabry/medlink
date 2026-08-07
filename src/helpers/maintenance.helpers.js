import { Wrench, DollarSign, CheckCircle2, Calendar, Cpu } from "lucide-react";

export const MAINTENANCE_FORM_FIELDS = [
  {
    name: "device_id",
    label: "معرف الجهاز (Device ID)",
    type: "text",
    placeholder: "مثال: dev10000-0000-0000-0000-000000000001",
    icon: Cpu,
  },
  {
    name: "reason",
    label: "سبب الصيانة",
    type: "text",
    placeholder: "مثال: صيانة دورية للجهاز رقم 1",
    icon: Wrench,
  },
  {
    name: "cost",
    label: "التكلفة (ج.م)",
    type: "number",
    placeholder: "150",
    icon: DollarSign,
  },
  {
    name: "status",
    label: "حالة الصيانة",
    type: "select",
    icon: CheckCircle2,
    options: [
      { label: "مكتملة (Completed)", value: "Completed" },
      { label: "قيد الانتظار (Pending)", value: "Pending" },
    ],
  },
  {
    name: "completed_at",
    label: "تاريخ الانتهاء",
    type: "date",
    icon: Calendar,
  },
];
