import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "./ChartCard";
import { CHART_AXIS_COLOR, CHART_COLORS, CHART_GRID_COLOR, CHART_TOOLTIP_STYLE } from "./chartColors";

export function ComposedChartCard({
  title,
  subtitle,
  icon,
  color,
  data = [],
  xKey,
  series,
  isLoading = false,
  isError = false,
  emptyMessage,
  errorMessage,
  trend,
  actions,
  height = 280,
}) {
  const isAllZero = data.length > 0 && data.every((d) => (d.revenue ?? 0) === 0 && (d.expenses ?? 0) === 0 && (d.profit ?? 0) === 0);

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      icon={icon}
      color={color}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && (data.length === 0 || isAllZero)}
      emptyMessage={emptyMessage || "لا توجد بيانات مالية مسجلة لهذه الفترة"}
      errorMessage={errorMessage}
      trend={trend}
      actions={actions}
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }}
            axisLine={{ stroke: CHART_GRID_COLOR }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
          />
          {series.some((s) => s.axis === "right") && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
            />
          )}
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            cursor={{ fill: "var(--muted)", opacity: 0.15 }}
            formatter={(val, name) => [`${Number(val || 0).toLocaleString("en-US")} ج.م`, name]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, fontWeight: 700, paddingTop: 6 }}
            formatter={(value) => <span className="text-foreground text-xs font-bold">{value}</span>}
          />
          {series.map((s, i) => {
            const color = s.color ?? CHART_COLORS[i % CHART_COLORS.length];
            const yAxisId = s.axis === "right" ? "right" : "left";
            if (s.type === "line") {
              return (
                <Line
                  key={s.key}
                  yAxisId={yAxisId}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={color}
                  strokeWidth={2.5}
                  dot={{ r: 3.5, strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 6 }}
                />
              );
            }
            return (
              <Bar
                key={s.key}
                yAxisId={yAxisId}
                dataKey={s.key}
                name={s.label}
                fill={color}
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

