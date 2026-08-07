import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartCard } from "./ChartCard";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "./chartColors";

export function PieChartCard({
  title,
  subtitle,
  icon,
  color,
  data = [],
  nameKey = "name",
  valueKey = "value",
  isLoading = false,
  isError = false,
  height = 280,
  donut = true,
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
        <PieChart>
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey={nameKey}
            innerRadius={donut ? "55%" : 0}
            outerRadius="80%"
            paddingAngle={2}
            strokeWidth={2}
            stroke="var(--card)"
          >
            {data.map((entry, i) => (
              <Cell
                key={entry[nameKey] ?? i}
                fill={entry.color ?? CHART_COLORS[i % CHART_COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
