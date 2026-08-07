import { Search } from "lucide-react";

export default function DeviceSearch({ searchQuery, setSearchQuery }) {
  return (
    <div className="bg-card border border-border p-4 rounded-3xl shadow-sm flex items-center gap-3">
      <Search className="h-5 w-5 text-muted-foreground mr-2" />
      <input
        type="text"
        placeholder="بحث باسم الجهاز، الرقم التسلسلي، أو كود الغرفة..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-transparent text-xs md:text-sm focus:outline-none text-foreground"
      />
    </div>
  );
}
