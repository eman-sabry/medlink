import { memo } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

function TrendTag({ trend }) {
  if (!trend) return null;
  const isUp = trend.direction === "up";
  const Icon = isUp ? TrendingUp : TrendingDown;
  const tone = trend.tone === "bad" ? !isUp : isUp;
  const toneClass = tone ? "text-emerald-600" : "text-rose-600";

  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${toneClass}`}>
      <Icon className="h-3 w-3" />
      {trend.label}
    </span>
  );
}

function StatCardImpl({
  label,
  value,
  suffix,
  icon: Icon,
  valueClassName = "text-foreground",
  iconWrapperClassName = "bg-primary/10 text-primary",
  rounded = "rounded-2xl",
  onClick,
  active = false,
  activeClassName = "",
  trend,
  className = "",
}) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`p-4 ${rounded} border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between text-right ${
        onClick ? "cursor-pointer" : ""
      } ${active ? activeClassName : ""} ${className}`}
    >
      <div className="min-w-0">
        <span className="text-xs font-bold text-muted-foreground block truncate">
          {label}
        </span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className={`text-2xl font-black block ${valueClassName}`}>
            {value}
            {suffix && <span className="text-xs font-normal"> {suffix}</span>}
          </span>
          <TrendTag trend={trend} />
        </div>
      </div>
      {Icon && (
        <div className={`p-2.5 rounded-xl shrink-0 ${iconWrapperClassName}`}>
          <Icon className="h-5 w-5" />
        </div>
      )}
    </Wrapper>
  );
}

export const StatCard = memo(StatCardImpl);

export function StatsGrid({
  items,
  className = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
}) {
  return (
    <div className={`grid ${className} gap-4`}>
      {items.map((item) => (
        <StatCard key={item.key ?? item.label} {...item} />
      ))}
    </div>
  );
}
