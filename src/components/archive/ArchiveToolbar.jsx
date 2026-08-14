import { Search, ArrowUpDown, X } from "lucide-react";
import { ARCHIVE_SORT_OPTIONS } from "../../constants/archiveConstants";

export function ArchiveToolbar({
  searchQuery = "",
  onSearchChange,
  sortOrder = "newest",
  onSortChange,
  resultCount = 0,
}) {
  return (
    <div
      className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border"
      dir="rtl"
    >
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحث في الأرشيف (الاسم، كود الملف، رقم الفاتورة، السبب)..."
          className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-md"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Sort Options & Result Count */}
      <div className="flex items-center justify-between sm:justify-end gap-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>الترتيب:</span>
          <select
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-background border border-input rounded-xl px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            {ARCHIVE_SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-muted-foreground px-2.5 py-1.5 rounded-xl bg-muted/50 border border-border shrink-0">
          <span className="font-semibold text-foreground">{resultCount}</span> عنصر
        </div>
      </div>
    </div>
  );
}
