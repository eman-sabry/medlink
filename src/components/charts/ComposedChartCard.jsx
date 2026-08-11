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
  height = 280,
}) {
  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      icon={icon}
      color={color}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && data.length === 0}
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
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
          />
          {series.some((s) => s.axis === "right") && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }}
              axisLine={false}
              tickLine={false}
            />
          )}
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: "var(--muted)" }} />
          <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
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
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
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
                radius={[8, 8, 0, 0]}
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
