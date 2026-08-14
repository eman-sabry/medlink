import { ARCHIVE_ENTITY_CONFIG } from "../../constants/archiveConstants";

export function ArchiveCategoryTabs({
  activeCategory = "all",
  onSelectCategory,
  counts = {},
}) {
  const categories = Object.values(ARCHIVE_ENTITY_CONFIG);

  return (
    <div className="w-full overflow-x-auto pb-1 scrollbar-none" dir="rtl">
      <div className="flex items-center gap-2 min-w-max p-1 bg-muted/40 rounded-2xl border border-border/80">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.key;
          const count = counts[cat.key] ?? 0;

          // Don't render empty categories if they are secondary unless active or 'all'
          if (cat.key !== "all" && count === 0 && !isActive && ["followup", "note", "room", "maintenance"].includes(cat.key)) {
            return null;
          }

          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onSelectCategory(cat.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? cat.color || "text-primary" : "text-muted-foreground"}`} />
              <span>{cat.label}</span>
              <span
                className={`text-2xs px-1.5 py-0.5 rounded-full font-bold transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
