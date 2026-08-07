export function AssessmentSlider({
  title,
  subtitle,
  value,
  onChange,
  min = 0,
  max = 100,
  unit = "%",
  minLabel,
  midLabel,
  maxLabel,
}) {
  return (
    <div className="bg-card border border-border p-6 rounded-3xl space-y-4 shadow-sm">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-xl font-mono">
          {value}
          {unit}
        </span>
        <div className="text-left">
          <h3 className="font-extrabold text-foreground text-sm">{title}</h3>
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
      />
      <div className="flex justify-between text-xs text-muted-foreground font-medium">
        <span>{minLabel}</span>
        <span>{midLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
