import { Search } from "lucide-react";

export function SearchBar({
  value,
  onChange,
  placeholder = "بحث...",
  variant = "standalone",
  className = "",
}) {
  if (variant === "boxed") {
    return (
      <div
        className={`bg-card p-3 rounded-3xl border border-border flex items-center gap-3 ${className}`}
      >
        <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 px-2 rounded-2xl bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 pl-4 pr-11 rounded-2xl bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      />
    </div>
  );
}
