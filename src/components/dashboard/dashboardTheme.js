// لوحة ألوان موحّدة لكل عناصر لوحات التحكم (بطاقات المؤشرات، رؤوس الأقسام، أيقونات المخططات)
// حتى يبقى نفس اللون يعني نفس الشيء في كل مكان، ولا تتكرر تعريفات التدرجات في كل ملف
export const DASHBOARD_THEMES = {
  blue: {
    icon: "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/30",
    glow: "from-blue-500/10 via-blue-500/5",
    ring: "ring-blue-500/15",
    spark: "#3b82f6",
  },
  purple: {
    icon: "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-purple-500/30",
    glow: "from-purple-500/10 via-purple-500/5",
    ring: "ring-purple-500/15",
    spark: "#a855f7",
  },
  cyan: {
    icon: "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-cyan-500/30",
    glow: "from-cyan-500/10 via-cyan-500/5",
    ring: "ring-cyan-500/15",
    spark: "#06b6d4",
  },
  emerald: {
    icon: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/30",
    glow: "from-emerald-500/10 via-emerald-500/5",
    ring: "ring-emerald-500/15",
    spark: "#10b981",
  },
  amber: {
    icon: "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-amber-500/30",
    glow: "from-amber-500/10 via-amber-500/5",
    ring: "ring-amber-500/15",
    spark: "#f59e0b",
  },
  rose: {
    icon: "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-rose-500/30",
    glow: "from-rose-500/10 via-rose-500/5",
    ring: "ring-rose-500/15",
    spark: "#f43f5e",
  },
  indigo: {
    icon: "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-indigo-500/30",
    glow: "from-indigo-500/10 via-indigo-500/5",
    ring: "ring-indigo-500/15",
    spark: "#6366f1",
  },
  teal: {
    icon: "bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-teal-500/30",
    glow: "from-teal-500/10 via-teal-500/5",
    ring: "ring-teal-500/15",
    spark: "#14b8a6",
  },
  pink: {
    icon: "bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-pink-500/30",
    glow: "from-pink-500/10 via-pink-500/5",
    ring: "ring-pink-500/15",
    spark: "#ec4899",
  },
  orange: {
    icon: "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-orange-500/30",
    glow: "from-orange-500/10 via-orange-500/5",
    ring: "ring-orange-500/15",
    spark: "#f97316",
  },
  red: {
    icon: "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-500/30",
    glow: "from-red-500/10 via-red-500/5",
    ring: "ring-red-500/15",
    spark: "#ef4444",
  },
  green: {
    icon: "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-green-500/30",
    glow: "from-green-500/10 via-green-500/5",
    ring: "ring-green-500/15",
    spark: "#22c55e",
  },
};

export function getDashboardTheme(color = "blue") {
  return DASHBOARD_THEMES[color] ?? DASHBOARD_THEMES.blue;
}
