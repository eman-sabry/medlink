import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SearchBar } from "../ui/SearchBar";
import { EmptyState } from "../ui/EmptyState";

export function PatientSearchWidget({ patients = [] }) {
  const [query, setQuery] = useState("");

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
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <Search className="h-4 w-4" />
        </div>
        <h3 className="font-extrabold text-foreground text-sm">بحث سريع عن مريض</h3>
      </div>

      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="ابحث بالاسم، رقم الملف، أو الهاتف..."
      />

      {query.trim() && (
        results.length === 0 ? (
          <EmptyState message="لا توجد نتائج مطابقة" rounded="rounded-2xl" />
        ) : (
          <ul className="space-y-2.5">
            {results.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-muted/40 text-xs"
              >
                <span className="font-bold text-foreground truncate">{p.full_name}</span>
                <span className="text-muted-foreground shrink-0">{p.file_no}</span>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}
