import { LineChartCard } from "./LineChartCard";
import { BarChartCard } from "./BarChartCard";
import { AreaChartCard } from "./AreaChartCard";
import { PieChartCard } from "./PieChartCard";

const CHART_BY_TYPE = {
  line: LineChartCard,
  bar: BarChartCard,
  area: AreaChartCard,
  pie: PieChartCard,
};

// غلاف عام يختار نوع المخطط المناسب (line/bar/area/pie) بناءً على إعداد بيانات،
// مفيد عند بناء لوحات تحكم تُعرَّف عناصرها كمصفوفة config بدل تكرار JSX لكل مخطط.
export function DashboardChartCard({ type = "line", ...props }) {
  const ChartComponent = CHART_BY_TYPE[type];

  if (!ChartComponent) {
    throw new Error(`DashboardChartCard: unsupported chart type "${type}"`);
  }

  return <ChartComponent {...props} />;
}
