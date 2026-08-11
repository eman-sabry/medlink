import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "./ChartCard";
import { CHART_AXIS_COLOR, CHART_COLORS, CHART_GRID_COLOR, CHART_TOOLTIP_STYLE } from "./chartColors";

export function BarChartCard({
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
  stacked = false,
  colorByCategory = false,
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
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }}
            axisLine={{ stroke: CHART_GRID_COLOR }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: "var(--muted)" }} />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />}
          {series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={s.color ?? CHART_COLORS[i % CHART_COLORS.length]}
              radius={[8, 8, 0, 0]}
              stackId={stacked ? "stack" : undefined}
            >
              {colorByCategory &&
                series.length === 1 &&
                data.map((entry, idx) => (
                  <Cell
                    key={entry[xKey] ?? idx}
                    fill={entry.color ?? CHART_COLORS[idx % CHART_COLORS.length]}
                  />
                ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
