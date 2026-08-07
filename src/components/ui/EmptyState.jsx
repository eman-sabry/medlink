export function EmptyState({
  message = "لا توجد بيانات مطابقة.",
  rounded = "rounded-3xl",
  colSpanFull = false,
  className = "",
}) {
  return (
    <div
      className={`${colSpanFull ? "col-span-full " : ""}py-20 text-center text-muted-foreground font-medium bg-card border border-border ${rounded} shadow-sm ${className}`}
    >
      {message}
    </div>
  );
}
