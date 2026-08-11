import { TrendingUp, CalendarClock, PieChart, Stethoscope, Layers, Wallet } from "lucide-react";
import { AreaChartCard } from "../charts/AreaChartCard";
import { LineChartCard } from "../charts/LineChartCard";
import { BarChartCard } from "../charts/BarChartCard";

export function InvoiceCharts({ charts, isLoading }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AreaChartCard
          title="اتجاه الإيرادات الشهري"
          subtitle="Monthly Revenue"
          icon={TrendingUp}
          color="emerald"
          isLoading={isLoading}
          data={charts.revenueByMonth}
          xKey="month"
          series={[{ key: "total", label: "الإيرادات (ج.م)" }]}
        />
        <LineChartCard
          title="الإيرادات اليومية"
          subtitle="آخر 14 يوماً"
          icon={CalendarClock}
          color="cyan"
          isLoading={isLoading}
          data={charts.revenueByDay}
          xKey="day"
          series={[{ key: "total", label: "الإيرادات (ج.م)" }]}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChartCard
          title="توزيع حالات الفواتير"
          subtitle="Paid vs Partial vs Unpaid"
          icon={PieChart}
          isLoading={isLoading}
          height={240}
          data={charts.statusDistribution}
          xKey="name"
          series={[{ key: "value", label: "عدد الفواتير" }]}
          colorByCategory
        />
        <BarChartCard
          title="الإيرادات حسب طريقة الدفع"
          subtitle="Revenue by Payment Method"
          icon={Wallet}
          color="indigo"
          isLoading={isLoading}
          height={240}
          data={charts.revenueByMethod}
          xKey="name"
          series={[{ key: "value", label: "الإيرادات (ج.م)" }]}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChartCard
          title="الإيرادات حسب الخدمة"
          subtitle="Revenue by Service"
          icon={Layers}
          color="purple"
          isLoading={isLoading}
          data={charts.revenueByService}
          xKey="name"
          series={[{ key: "value", label: "الإيرادات (ج.م)" }]}
        />
        <BarChartCard
          title="الإيرادات حسب الطبيب"
          subtitle="Revenue by Doctor"
          icon={Stethoscope}
          color="teal"
          isLoading={isLoading}
          data={charts.revenueByDoctor}
          xKey="name"
          series={[{ key: "value", label: "الإيرادات (ج.م)" }]}
        />
      </div>
    </div>
  );
}
