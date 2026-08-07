import { FileText, Activity, Clock, User } from "lucide-react";

export const SESSION_TABS = [
  { key: "prescription", label: "الروشتة والتعليمات", icon: FileText },
  { key: "assessment", label: "إعادة التقييم والمتابعة", icon: Activity },
  { key: "history", label: "سجل الجلسات", icon: Clock },
  { key: "patient", label: "بيانات المريض", icon: User },
];
