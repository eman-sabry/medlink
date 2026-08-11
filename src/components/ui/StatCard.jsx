// src/components/StatsGrid.jsx
import { memo } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

function TrendTag({ trend }) {
  if (!trend) return null;
  const isUp = trend.direction === "up";
  const Icon = isUp ? TrendingUp : TrendingDown;
  const tone = trend.tone === "bad" ? !isUp : isUp;
  const toneClass = tone
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-rose-600 dark:text-rose-400";

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-background/90 shadow-2xs ${toneClass}`}
    >
      <Icon className="h-3.5 w-3.5" />
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
  iconWrapperClassName = "bg-primary/15 text-primary",
  activeIconClassName = "bg-primary text-primary-foreground shadow-md",
  rounded = "rounded-3xl",
  onClick,
  active = false,
  activeClassName = "",
  trend,
  className = "",
  gradient = "from-primary/[0.07] via-transparent to-transparent",
}) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`${rounded} relative overflow-hidden p-5 border text-right transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 ${
        onClick ? "cursor-pointer" : ""
      } ${
        active
          ? `${
              activeClassName ||
              "bg-primary/15 border-primary/80 shadow-xl shadow-primary/15 ring-2 ring-primary/30"
            } scale-[1.02]`
          : "bg-card border-border/80 hover:border-primary/50 hover:shadow-lg hover:bg-primary/[0.04]"
      } ${className}`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-opacity duration-300 pointer-events-none ${
          active ? "opacity-100" : "opacity-60 group-hover:opacity-100"
        }`}
      />

      <div className="flex items-center justify-between w-full mb-5 relative z-10">
        <span
          className={`text-xs sm:text-sm font-black transition-colors ${
            active
              ? "text-foreground font-extrabold"
              : "text-muted-foreground group-hover:text-foreground"
          }`}
        >
          {label}
        </span>
        {Icon && (
          <div
            className={`p-3 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${
              active ? activeIconClassName : iconWrapperClassName
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="relative z-10 flex items-end justify-between w-full gap-2">
        <div className="flex flex-wrap items-baseline gap-2.5">
          <span
            className={`text-3xl font-black tracking-tight ${valueClassName}`}
          >
            {value}
            {suffix && (
              <span className="text-xs font-semibold text-muted-foreground ms-1">
                {suffix}
              </span>
            )}
          </span>
          <TrendTag trend={trend} />
        </div>

        {active && (
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-background/95 text-foreground shadow-xs animate-fade-in border border-border/50 shrink-0">
            نشط الآن
          </span>
        )}
      </div>
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
      {items.map(({ key, ...item }) => (
        <StatCard key={key ?? item.label} {...item} />
      ))}
    </div>
  );
}
