import { Area, AreaChart, ResponsiveContainer } from "recharts";

// مخطط صغير جداً بلا محاور أو تلميحات، يُستخدم داخل بطاقات المؤشرات لإظهار الاتجاه بسرعة
export function Sparkline({ data = [], dataKey = "count", color = "var(--primary)", height = 36 }) {
  if (!data || data.length < 2) return null;

  const gradientId = `spark-${dataKey}-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div style={{ height, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
