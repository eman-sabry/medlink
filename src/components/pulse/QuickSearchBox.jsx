import { useMemo, useState } from "react";
import { Search, User } from "lucide-react";
import { usePatients } from "../../hooks/usePatients";

export function QuickSearchBox() {
  const { patients } = usePatients();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return patients
      .filter(
        (p) =>
          p.full_name?.toLowerCase().includes(q) ||
          p.file_no?.toLowerCase().includes(q) ||
          p.phone?.includes(query),
      )
      .slice(0, 6);
  }, [patients, query]);

  return (
    <div className="relative w-full sm:w-64">
      <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
        placeholder="بحث سريع عن مريض..."
        className="w-full h-10 pl-3 pr-10 rounded-2xl bg-muted/50 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      />

      {isFocused && query.trim() && (
        <div className="absolute top-full mt-2 w-full sm:w-80 right-0 z-50 rounded-2xl border border-border bg-card shadow-2xl p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
          {results.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">لا توجد نتائج مطابقة</p>
          ) : (
            results.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-muted/60 transition-colors"
              >
                <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{p.full_name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{p.file_no}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
