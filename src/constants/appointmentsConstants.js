import {
    Calendar,
    User,
    Stethoscope,
    FileText
} from "lucide-react";

export const STATUS_OPTIONS = [{
        label: "جميع الحالات",
        value: "all"
    },
    {
        label: "في الانتظار",
        value: "Waiting"
    },
    {
        label: "وصل",
        value: "Arrived"
    },
    {
        label: "مجدول",
        value: "Scheduled"
    },
    {
        label: "ملغي",
        value: "Cancelled"
    },
    {
        label: "لم يحضر",
        value: "NoShow"
    },
];

export const APPOINTMENT_FORM_FIELDS = [{
        name: "patient_name",
        label: "اسم المريض",
        type: "text",
        placeholder: "أدخل اسم المريض ثلاثي...",
        icon: User,
    },
    {
        name: "doctor_name",
        label: "الطبيب المعالج",
        type: "select",
        icon: Stethoscope,
        options: [{
                label: "د. محمد أحمد (علاج طبيعي)",
                value: "د. محمد أحمد"
            },
            {
                label: "د. أحمد حسن (علاج طبيعي)",
                value: "د. أحمد حسن"
            },
            {
                label: "د. مريم صالح (العلاج الكهربائي)",
                value: "د. مريم صالح"
            },
        ],
    },
    {
        name: "service_name",
        label: "نوع الخدمة / الجلسة",
        type: "select",
        icon: FileText,
        options: [{
                label: "جلسة علاج طبيعي",
                value: "جلسة علاج طبيعي"
            },
            {
                label: "العلاج الكهربائي",
                value: "العلاج الكهربائي"
            },
            {
                label: "تأهيل الحالات الإصابية",
                value: "تأهيل الحالات الإصابية"
            },
        ],
    },
    {
        name: "starts_at",
        label: "تاريخ ووقت الموعد",
        type: "datetime-local",
        icon: Calendar,
    },
];
