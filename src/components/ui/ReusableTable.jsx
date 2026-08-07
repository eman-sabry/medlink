import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

export function ReusableTable({
  columns = [],
  data = [],
  rowsPerPage = 10,
  emptyMessage = "لا توجد بيانات مطابقة.",
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // حساب البيانات الخاصة بالصفحة الحالية
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentData = data.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  return (
    <div className="rounded-3xl border border-border bg-card shadow-xl overflow-hidden flex flex-col">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-right border-collapse table-auto">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-[11px] font-bold text-muted-foreground">
              {columns.map((col, index) => (
                <th key={index} className={`p-3 ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {currentData.length > 0 ? (
              currentData.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className="hover:bg-muted/40 transition-colors"
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={`p-3 ${col.className || ""}`}>
                      {col.render
                        ? col.render(row)
                        : (row[col.accessor] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-8 text-center text-muted-foreground font-medium"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* شريط التنقل بين الصفحات (Pagination) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
          <span className="text-xs text-muted-foreground font-medium">
            عرض الصفحة{" "}
            <strong className="text-foreground">{currentPage}</strong> من{" "}
            <strong className="text-foreground">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-muted text-xs font-bold text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/80 transition-all cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
              <span>السابق</span>
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-muted text-xs font-bold text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/80 transition-all cursor-pointer"
            >
              <span>التالي</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
