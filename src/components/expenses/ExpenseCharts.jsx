import { TrendingDown, CalendarClock, PieChart, Wrench, Layers } from "lucide-react";
import { AreaChartCard } from "../charts/AreaChartCard";
import { LineChartCard } from "../charts/LineChartCard";
import { PieChartCard } from "../charts/PieChartCard";

export function ExpenseCharts({ charts, isLoading }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AreaChartCard
          title="اتجاه المصروفات الشهري"
          subtitle="Monthly Expenses"
          icon={TrendingDown}
          color="rose"
          isLoading={isLoading}
          data={charts.expensesTrendMonthly}
          xKey="month"
          series={[{ key: "total", label: "المصروفات (ج.م)" }]}
        />
        <LineChartCard
          title="المصروفات اليومية"
          subtitle="آخر 30 يوماً"
          icon={CalendarClock}
          color="amber"
          isLoading={isLoading}
          data={charts.expensesTrendDaily}
          xKey="day"
          series={[{ key: "total", label: "المصروفات (ج.م)" }]}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PieChartCard
          title="المصروفات حسب التصنيف"
          subtitle="Expenses by Category"
          icon={PieChart}
          color="indigo"
          isLoading={isLoading}
          data={charts.expensesByCategory}
        />
        <PieChartCard
          title="المصروفات حسب المصدر"
          subtitle="Expenses by Source"
          icon={Layers}
          color="purple"
          isLoading={isLoading}
          data={charts.expensesBySource}
        />
      </div>
      <div className="grid grid-cols-1 gap-4">
        <AreaChartCard
          title="اتجاه مصروفات الصيانة"
          subtitle="Maintenance Expenses Trend — آخر 30 يوماً"
          icon={Wrench}
          color="orange"
          isLoading={isLoading}
          data={charts.maintenanceExpensesTrend}
          xKey="day"
          series={[{ key: "total", label: "مصروفات الصيانة (ج.م)" }]}
        />
      </div>
    </div>
  );
}
