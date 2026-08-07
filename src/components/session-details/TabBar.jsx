export function TabBar({ tabs, activeTab, onChange }) {
  return (
    <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card text-muted-foreground hover:bg-muted/50 border border-border"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
