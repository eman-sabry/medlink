import { useState, useMemo } from "react";
import { Scale, TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import { ComposedChartCard } from "../charts/ComposedChartCard";

const TIME_RANGES = [
  { id: "today", label: "اليوم" },
  { id: "week", label: "هذا الأسبوع" },
  { id: "month", label: "هذا الشهر" },
  { id: "year", label: "هذا العام" },
];

export function RevenueVsExpensesChart({
  revenueVsExpensesSeries,
  fallbackData = [],
  isLoading = false,
  isError = false,
}) {
  const [selectedRange, setSelectedRange] = useState("year");

  // Select active dataset based on filter
  const activeData = useMemo(() => {
    if (!revenueVsExpensesSeries) return fallbackData;
    const series = revenueVsExpensesSeries[selectedRange];
    if (series && series.length > 0) return series;
    return fallbackData;
  }, [revenueVsExpensesSeries, selectedRange, fallbackData]);

  // Compute summary totals for selected time range
  const summary = useMemo(() => {
    const totalRev = activeData.reduce((sum, d) => sum + (Number(d.revenue) || 0), 0);
    const totalExp = activeData.reduce((sum, d) => sum + (Number(d.expenses) || 0), 0);
    const netProf = totalRev - totalExp;
    return {
      revenue: Math.round(totalRev * 100) / 100,
      expenses: Math.round(totalExp * 100) / 100,
      profit: Math.round(netProf * 100) / 100,
    };
  }, [activeData]);

  // Action header buttons for time range filtering
  const rangeActions = (
    <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border/60">
      {TIME_RANGES.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => setSelectedRange(r.id)}
          className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
            selectedRange === r.id
              ? "bg-card text-foreground shadow-xs border border-border/80"
              : "text-muted-foreground hover:text-foreground hover:bg-card/40"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-2">
      <ComposedChartCard
        title="الإيرادات مقابل المصروفات"
        subtitle={`مقارنة التدفقات المالية وصافي الأرباح — ${
          TIME_RANGES.find((t) => t.id === selectedRange)?.label || ""
        }`}
        icon={Scale}
        color="emerald"
        isLoading={isLoading}
        isError={isError}
        data={activeData}
        xKey="label"
        actions={rangeActions}
        height={290}
        series={[
          {
            key: "revenue",
            label: "الإيرادات المحصلة",
            type: "bar",
            color: "#10b981", // Emerald
          },
          {
            key: "expenses",
            label: "المصروفات الفعلية",
            type: "bar",
            color: "#f43f5e", // Rose
          },
          {
            key: "profit",
            label: "صافي الربح",
            type: "line",
            color: "#0284c7", // Sky/Blue
          },
        ]}
      />

      {/* Mini Financial Summary Strip for Selected Period */}
      {!isLoading && !isError && activeData.length > 0 && (
        <div className="grid grid-cols-3 gap-2 px-1 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <DollarSign className="h-3.5 w-3.5" />
              <span>إجمالي الإيرادات</span>
            </div>
            <span className="font-black text-emerald-700 dark:text-emerald-300">
              {summary.revenue.toLocaleString("en-US")} ج.م
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-rose-500/5 border border-rose-500/15">
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
              <Wallet className="h-3.5 w-3.5" />
              <span>إجمالي المصروفات</span>
            </div>
            <span className="font-black text-rose-700 dark:text-rose-300">
              {summary.expenses.toLocaleString("en-US")} ج.م
            </span>
          </div>

          <div
            className={`flex items-center justify-between p-2.5 rounded-2xl border ${
              summary.profit >= 0
                ? "bg-blue-500/5 border-blue-500/15 text-blue-700 dark:text-blue-300"
                : "bg-amber-500/5 border-amber-500/15 text-amber-700 dark:text-amber-300"
            }`}
          >
            <div className="flex items-center gap-1.5 font-medium">
              {summary.profit >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              )}
              <span>صافي الربح</span>
            </div>
            <span className="font-black">
              {summary.profit.toLocaleString("en-US")} ج.م
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
