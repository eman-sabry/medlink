// لوحة ألوان موحّدة لكل الرسوم البيانية في التطبيق حتى لا يُعاد اختراعها في كل مخطط
export const CHART_COLORS = [
  "var(--primary)",
  "#6366f1", // indigo-500
  "#f59e0b", // amber-500
  "#10b981", // emerald-500
  "#f43f5e", // rose-500
  "#06b6d4", // cyan-500
  "#8b5cf6", // violet-500
];

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "1rem",
  color: "var(--foreground)",
  fontSize: "12px",
  fontWeight: 600,
  direction: "rtl",
  boxShadow: "0 10px 30px -10px rgba(0,0,0,0.25)",
};

export const CHART_GRID_COLOR = "var(--border)";
export const CHART_AXIS_COLOR = "var(--muted-foreground)";

// ألوان دلالية ثابتة للحالات المتكررة عبر التطبيق، حتى تبقى نفس الحالة بنفس اللون في كل مخطط
export const STATUS_COLORS = {
  Completed: "#10b981",
  InSession: "#06b6d4",
  Waiting: "#f59e0b",
  Scheduled: "#6366f1",
  Arrived: "#3b82f6",
  NoShow: "#fb7185",
  Cancelled: "#e11d48",
  Active: "#10b981",
  Inactive: "#f59e0b",
  Archived: "#94a3b8",
  Operational: "#10b981",
  Maintenance: "#f59e0b",
  "Out-Of-Service": "#e11d48",
  Available: "#10b981",
  Occupied: "#e11d48",
  Cleaning: "#f59e0b",
  Pending: "#f59e0b",
};

export function colorForStatus(status, fallback = "var(--primary)") {
  return STATUS_COLORS[status] ?? fallback;
}
