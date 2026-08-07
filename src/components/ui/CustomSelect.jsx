import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";

export function CustomSelect({ value, onChange, options = [], placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  // تصفية العناصر بناءً على البحث
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* حقل الإدخال الرئيسي */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 rounded-2xl border px-4 text-sm flex items-center justify-between cursor-pointer transition-all shadow-xs outline-none"
        style={{
          backgroundColor: "var(--background)",
          borderColor: isOpen ? "var(--primary)" : "var(--border)",
          color: "var(--foreground)",
          boxShadow: isOpen
            ? "0 0 0 2px color-mix(in srgb, var(--primary) 30%, transparent)"
            : "none",
        }}
      >
        <span
          style={{
            color: selectedOption
              ? "var(--foreground)"
              : "var(--muted-foreground)",
            fontWeight: selectedOption ? "700" : "400",
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className="h-4 w-4 transition-transform duration-200"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            color: isOpen ? "var(--primary)" : "var(--muted-foreground)",
          }}
        />
      </div>

      {/* القائمة المنسدلة الداخلية */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 mt-2 rounded-2xl border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl flex flex-col gap-2"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
            borderRadius: "1.5rem",
          }}
        >
          {/* حقل البحث داخل القائمة (يظهر إذا كان عدد الخيارات أكثر من 4) */}
          {options.length > 4 && (
            <div className="relative px-1 pt-1">
              <Search
                className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
                style={{ color: "var(--muted-foreground)" }}
              />
              <input
                type="text"
                placeholder="ابحث هنا..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full h-9 rounded-xl border px-3 pr-9 text-xs outline-none transition-all"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
                autoFocus
              />
            </div>
          )}

          {/* قائمة العناصر مع سكرول داخلي وأقصى ارتفاع */}
          <div className="max-h-52 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <CustomSelectItem
                    key={opt.value}
                    label={opt.label}
                    isSelected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                  />
                );
              })
            ) : (
              <div
                className="px-3 py-4 text-xs text-center font-medium"
                style={{ color: "var(--muted-foreground)" }}
              >
                لا توجد نتائج مطابقة
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CustomSelectItem({ label, isSelected, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center justify-between w-full px-3.5 py-2.5 text-sm font-bold rounded-xl cursor-pointer transition-all"
      style={{
        color: isSelected || isHovered ? "var(--primary)" : "var(--foreground)",
        backgroundColor: isSelected
          ? "color-mix(in srgb, var(--primary) 15%, transparent)"
          : isHovered
            ? "color-mix(in srgb, var(--primary) 10%, transparent)"
            : "transparent",
      }}
    >
      <span>{label}</span>
      {isSelected && (
        <Check className="h-4 w-4" style={{ color: "var(--primary)" }} />
      )}
    </div>
  );
}
