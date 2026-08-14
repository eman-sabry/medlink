import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  User,
  CalendarDays,
  Receipt,
  Activity,
  Wallet,
  Package,
  Cpu,
  BedDouble,
  Wrench,
  Stethoscope,
  UserCog,
  Sparkles,
  Loader2,
  AlertCircle,
  CornerDownLeft,
} from "lucide-react";
import { useGlobalSearch } from "../../hooks/useGlobalSearch";

const ENTITY_ICONS = {
  patient: User,
  appointment: CalendarDays,
  doctor: Stethoscope,
  staff: UserCog,
  invoice: Receipt,
  session: Activity,
  expense: Wallet,
  package: Package,
  service: Sparkles,
  device: Cpu,
  room: BedDouble,
  maintenance: Wrench,
};

const ENTITY_COLORS = {
  patient: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  appointment: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  doctor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  staff: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  invoice: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  session: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  expense: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  package: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  service: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  device: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  room: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  maintenance: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

export function GlobalSearch() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const {
    searchTerm,
    setSearchTerm,
    debouncedTerm,
    isOpen,
    setIsOpen,
    selectedIndex,
    setSelectedIndex,
    isLoading,
    isError,
    groupedResults,
    flatItems,
    refetch,
  } = useGlobalSearch();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  // Global keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    function handleGlobalKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [setIsOpen]);

  const handleSelect = (item) => {
    if (!item?.url) return;
    setIsOpen(false);
    navigate(item.url);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (flatItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const currentItem = flatItems[selectedIndex] || flatItems[0];
      if (currentItem) {
        handleSelect(currentItem);
      }
    }
  };

  // Keep selected item visible in scroll view
  useEffect(() => {
    if (isOpen && flatItems.length > 0) {
      const activeEl = document.getElementById(`search-result-item-${selectedIndex}`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex, isOpen, flatItems.length]);

  return (
    <div ref={containerRef} className="relative w-full" dir="rtl">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="ابحث عن مريض، موعد، طبيب، فاتورة، مصروف..."
          className="flex h-11 w-full items-center rounded-2xl border border-border/80 bg-card/90 px-4 pl-12 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-xs"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />

        {/* Right Search Icon */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Search className="h-4 w-4 text-primary" />
          )}
        </div>

        {/* Left Action / Clear / Shortcut Button */}
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {searchTerm ? (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="مسح البحث"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <span className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60">
              Ctrl+K
            </span>
          )}
        </div>
      </div>

      {/* Search Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 left-0 mt-2 z-50 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden transition-all animate-in fade-in slide-in-from-top-2 duration-150 max-h-[480px] flex flex-col">
          {/* Status Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/30 text-[11px] font-semibold text-muted-foreground">
            <span>
              {debouncedTerm ? `نتائج البحث عن "${debouncedTerm}"` : "البحث السريع في النظام"}
            </span>
            <span className="flex items-center gap-1">
              استخدم <span className="font-mono bg-background px-1 py-0.5 rounded border border-border/60">↑</span>
              <span className="font-mono bg-background px-1 py-0.5 rounded border border-border/60">↓</span>
              للتنقل و <span className="font-mono bg-background px-1 py-0.5 rounded border border-border/60">Enter</span> للفتح
            </span>
          </div>

          {/* Results List or States */}
          <div className="overflow-y-auto p-2 space-y-3 flex-1 scrollbar-thin scrollbar-thumb-border">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <p className="text-sm font-bold text-foreground">جاري البحث في قاعدة البيانات...</p>
                <p className="text-xs text-muted-foreground">يتم البحث في المرضى، المواعيد، الفواتير، والأجهزة</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                <div className="h-10 w-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <p className="text-sm font-bold text-rose-600">تعذر تنفيذ البحث.</p>
                <button
                  onClick={() => refetch()}
                  className="mt-1 text-xs font-bold text-primary hover:underline"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : !debouncedTerm ? (
              <div className="py-6 px-4 text-center space-y-2">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Search className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-foreground">ابدأ بكتابة اسم المريض، الطبيب، رقم الفاتورة أو الخدمة</p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                  <span className="text-[11px] text-muted-foreground ml-1">أمثلة سريعة:</span>
                  {["أحمد", "PT-100", "INV-2026", "علاج طبيعي", "كشف"].map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => setSearchTerm(sample)}
                      className="text-[11px] px-2 py-0.5 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer border border-border/50"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            ) : flatItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <div className="h-10 w-10 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                  <Search className="h-5 w-5" />
                </div>
                <p className="text-sm font-bold text-foreground">لا توجد نتائج مطابقة.</p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  لم نتمكن من العثور على أي سجل يطابق "{debouncedTerm}". جرّب كتابة رقم الملف أو الاسم بشكل مختلف.
                </p>
              </div>
            ) : (
              groupedResults.map((group) => (
                <div key={group.category} className="space-y-1">
                  <div className="px-3 py-1 text-[11px] font-black text-muted-foreground tracking-wider flex items-center justify-between">
                    <span>{group.category}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted font-bold">
                      {group.items.length}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const itemIndex = flatItems.indexOf(item);
                      const isSelected = itemIndex === selectedIndex;
                      const Icon = ENTITY_ICONS[item.entityType] || User;
                      const badgeColorClass = ENTITY_COLORS[item.entityType] || "bg-primary/10 text-primary border-primary/20";

                      return (
                        <div
                          key={`${item.entityType}-${item.id}`}
                          id={`search-result-item-${itemIndex}`}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                            isSelected
                              ? "bg-primary/10 border-primary/40 text-foreground shadow-xs translate-x-1"
                              : "border-transparent hover:bg-muted/60 text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${badgeColorClass}`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm truncate">
                                  {item.title}
                                </span>
                                {item.badge && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-card border border-border/80 shrink-0">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              {item.subtitle && (
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {item.secondaryInfo && (
                              <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline-block">
                                {item.secondaryInfo}
                              </span>
                            )}
                            {isSelected && (
                              <CornerDownLeft className="h-3.5 w-3.5 text-primary shrink-0 animate-pulse" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-4 py-2 border-t border-border/60 bg-card flex items-center justify-between text-[11px] text-muted-foreground">
            <span>MedLink OS Unified Global Search</span>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:text-foreground font-bold hover:underline"
            >
              إغلاق (Esc)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
