import {
    LayoutDashboard,
    Users,
    Calendar,
    Activity,
    ShieldAlert,
    Stethoscope,
    BedDouble,
    Wrench,
    FileText,
    CheckSquare,
    CreditCard,
    Package,
    ReceiptText,
    Banknote,
    Archive
} from "lucide-react";

export const SIDEBAR_SECTIONS = [{
        title: null,
        items: [{
                label: "نبض المركز",
                to: "/pulse",
                icon: Activity,
                primary: true
            },
            {
                label: "لوحة التحكم",
                to: "/dashboard",
                icon: LayoutDashboard
            },
        ]
    },
    {
        title: "المرضى والعمليات",
        items: [{
                label: "المرضى",
                to: "/patients",
                icon: Users
            },
            {
                label: "المواعيد",
                to: "/appointments",
                icon: Calendar
            },
            {
                label: "الجلسات",
                to: "/sessions",
                icon: Activity
            },
            {
                label: "متابعة الغائبين",
                to: "/followup",
                icon: ShieldAlert
            },
        ]
    },
    {
        title: "الفريق والموارد",
        items: [{
                label: "فريق المركز",
                to: "/team",
                icon: Stethoscope
            },
            {
                label: "غرف العلاج",
                to: "/rooms",
                icon: BedDouble,
                active: true
            },
            {
                label: "الأجهزة",
                to: "/devices",
                icon: FileText
            },
            {
                label: "الصيانة",
                to: "/maintenance",
                icon: Wrench
            },
            {
                label: "تسجيل الحضور",
                to: "/attendance",
                icon: CheckSquare
            },
        ]
    },
    {
        title: "المالية",
        items: [{
                label: "الفواتير",
                to: "/invoices",
                icon: ReceiptText
            },
            {
                label: "المصروفات",
                to: "/expenses",
                icon: Banknote
            },
            {
                label: "الخدمات",
                to: "/services",
                icon: CreditCard
            },
            {
                label: "الباقات العلاجية",
                to: "/packages", 
                icon: Package
            },
        ]
    },
    {
        title: "النظام",
        items: [{
            label: "سلة المحذوفات",
            to: "/archive",
            icon: Archive,
        }]
    }
];