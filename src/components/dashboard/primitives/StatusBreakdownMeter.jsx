export function StatusBreakdownMeter({ segments = [], totalLabel }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        {segments
          .filter((s) => s.value > 0)
          .map((s) => (
            <div
              key={s.key}
              className={`h-full ${s.barClassName} transition-all`}
              style={{ width: `${(s.value / total) * 100}%` }}
              title={`${s.label}: ${s.value}`}
            />
          ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {segments.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
            <span className={`h-2 w-2 rounded-full shrink-0 ${s.dotClassName}`} />
            {s.label}
            <span className="text-foreground">{s.value}</span>
          </span>
        ))}
        {totalLabel && (
          <span className="text-[11px] font-bold text-muted-foreground mr-auto">{totalLabel}</span>
        )}
      </div>
    </div>
  );
}
