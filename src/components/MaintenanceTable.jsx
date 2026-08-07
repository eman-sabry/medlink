import { useState } from "react";
import { Edit, Trash2, ChevronDown, Calendar } from "lucide-react";
import { ReusableTable } from "./ui/ReusableTable";

export function MaintenanceTable({
  maintenanceEntries,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const [dropdownId, setDropdownId] = useState(null);

  const getMaintenanceStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500/10 text-emerald-600 border border-emerald-300";
      case "Pending":
        return "bg-amber-500/10 text-amber-600 border border-amber-300";
      default:
        return "bg-primary/10 text-primary border border-primary/20";
    }
  };

  const statusLabels = {
    Completed: "مكتملة (Completed)",
    Pending: "قيد الانتظار (Pending)",
  };

  const columns = [
    {
      header: "سبب الصيانة",
      render: (entry) => (
        <span className="font-bold text-foreground truncate">
          {entry.reason}
        </span>
      ),
      className: "w-[25%]",
    },
    {
      header: "معرف الجهاز (Device ID)",
      render: (entry) => (
        <span className="font-mono text-xs text-muted-foreground truncate max-w-[150px] inline-block">
          {entry.device_id}
        </span>
      ),
      className: "w-[20%]",
    },
    {
      header: "التكلفة",
      render: (entry) => (
        <span className="font-bold text-foreground inline-flex items-center gap-1">
        
          {entry.cost}{" "}
          <span className="text-xs font-normal text-muted-foreground">ج.م</span>
        </span>
      ),
      className: "w-[15%]",
    },
    {
      header: "تاريخ الانتهاء",
      render: (entry) => (
        <span className="font-mono text-xs text-muted-foreground inline-flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          {entry.completed_at || "—"}
        </span>
      ),
      className: "w-[15%]",
    },
    {
      header: "الحالة",
      render: (entry) => {
        const isOpen = dropdownId === entry.id;
        return (
          <div className="relative inline-block text-right">
            <button
              type="button"
              onClick={() => setDropdownId(isOpen ? null : entry.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center justify-between gap-2 min-w-[150px] shadow-sm ${getMaintenanceStatusColor(
                entry.status,
              )} cursor-pointer transition-all hover:opacity-80`}
            >
              <span className="truncate">
                {statusLabels[entry.status] || entry.status}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div
                className="absolute z-50 top-full mt-2 right-0 bg-card border border-border rounded-2xl shadow-2xl p-1.5 min-w-[170px] space-y-1 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                {Object.entries(statusLabels).map(([value, label]) => {
                  const isSelected = entry.status === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setDropdownId(null);
                        if (!isSelected) {
                          onStatusChange(entry.id, value);
                        }
                      }}
                      className={`w-full text-right px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="truncate">{label}</span>
                      {isSelected && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      },
      className: "w-[15%]",
    },
    {
      header: "إجراءات",
      render: (entry) => (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(entry)}
            className="p-2 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
            title="تعديل"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
            className="p-2 rounded-xl bg-muted hover:bg-red-500/10 text-red-500 transition-all cursor-pointer"
            title="حذف"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      className: "text-center w-[10%]",
    },
  ];

  return (
    <ReusableTable
      columns={columns}
      data={maintenanceEntries}
      rowsPerPage={10}
      emptyMessage="لا توجد سجلات صيانة مسجلة حالياً."
    />
  );
}
