import {
    CalendarPlus,
    UserPlus,
    PlayCircle,
    FileText,
    Users,
    Package,
    Plus,
} from "lucide-react";

export function getFloatingActionsByRole(role = "user") {
    if (role === "Admin" || role === "owner") {
        return [
            {
                label: "حجز موعد ",
                    icon: Plus,
                    to: "/appointments",
                    color: "purple",
                
            },

            {
                label: "اضافة  مريض ",
                icon: UserPlus,
                to: "/patients",
                color: "blue",
            },
            {
                label: "بدء جلسة ",
                icon: PlayCircle,
                to: "/sessions",
                color: "amber",
            },
            {
                label: "إنشاء فاتورة",
                icon: FileText,
                to: "/invoices",
                color: "rose",
            },
               {
                   label: " تسكين المريض",
                   icon: FileText,
                   to: "/rooms",
                   color: "emerald",
               },
            {
                label: "إدارة الباقات",
                icon: Package,
                to: "/packages",
                color: "blue",
            },
            
        ];
    }

    if (role === "doctor") {
        return [{
                label: "بدء جلسة ",
                icon: PlayCircle,
                to: "/sessions",
                color: "amber",
            },
            {
                label: "سجلات المرضى",
                icon: Users,
                to: "/patients",
                color: "blue",
            },
            {
                label: "المواعيد",
                icon: CalendarPlus,
                to: "/appointments",
                color: "emerald",
            },
            
        ];
    }

    if (role === "receptionist" || role === "secretary") {
        return [{
                label: "حجز موعد ",
                icon: Plus,
                to: "/appointments",
                color: "purple",
            },
            {
                label: "اضافة  مريض ",
                icon: UserPlus,
                to: "/patients",
                color: "blue",
            },
            {
                label: "إنشاء فاتورة",
                icon: FileText,
                to: "/invoices",
                color: "rose",
            },
            {
                label: " تسكين المريض",
                icon: FileText,
                to: "/rooms",
                color: "emerald",
            },
        ];
    }

    return [{
            label: "حجز موعد",
            icon: CalendarPlus,
            to: "/appointments",
            color: "blue",
        },
        {
            label: "إضافة مريض",
            icon: UserPlus,
            to: "/patients",
            color: "emerald",
        },
        {
            label: "إنشاء فاتورة",
            icon: FileText,
            to: "/invoices",
            color: "rose",
        },
    ];
}