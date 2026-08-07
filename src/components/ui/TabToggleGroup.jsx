export function TabToggleGroup({ tabs, value, onChange, className = "" }) {
  return (
    <div
      className={`flex items-center gap-2 p-1.5 bg-muted/50 rounded-2xl w-fit border border-border/50 ${className}`}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = value === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isActive
                ? "bg-card text-primary shadow-sm border border-border/40"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
