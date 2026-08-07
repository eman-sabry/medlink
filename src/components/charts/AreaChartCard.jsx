import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "./ChartCard";
import { CHART_AXIS_COLOR, CHART_COLORS, CHART_GRID_COLOR, CHART_TOOLTIP_STYLE } from "./chartColors";

export function AreaChartCard({
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
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {series.map((s, i) => {
              const color = s.color ?? CHART_COLORS[i % CHART_COLORS.length];
              return (
                <linearGradient key={s.key} id={`chart-area-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              );
            })}
          </defs>
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
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />}
          {series.map((s, i) => {
            const color = s.color ?? CHART_COLORS[i % CHART_COLORS.length];
            return (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={color}
                strokeWidth={2.5}
                fill={`url(#chart-area-${s.key})`}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
