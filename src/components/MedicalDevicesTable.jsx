import { useState } from "react";
import { Edit, Trash2, ChevronDown } from "lucide-react";
import { ReusableTable } from "./ui/ReusableTable";

export function MedicalDevicesTable({
  devices,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const [dropdownId, setDropdownId] = useState(null);

  const getDeviceStatusColor = (status) => {
    switch (status) {
      case "Operational":
        return "bg-emerald-500/10 text-emerald-600 border border-emerald-300";
      case "Maintenance":
        return "bg-amber-500/10 text-amber-600 border border-amber-300";
      case "Out-Of-Service":
        return "bg-red-500/10 text-red-600 border border-red-300";
      default:
        return "bg-primary/10 text-primary border border-primary/20";
    }
  };

  const statusLabels = {
    Operational: "تعمل (Operational)",
    Maintenance: "صيانة (Maintenance)",
    "Out-Of-Service": "خارج الخدمة (Out-Of-Service)",
  };

  const columns = [
    {
      header: "اسم الجهاز",
      render: (dev) => (
        <span className="font-bold text-foreground truncate">{dev.name}</span>
      ),
      className: "w-[25%]",
    },
    {
      header: "الرقم التسلسلي (Serial)",
      render: (dev) => (
        <span className="font-mono text-muted-foreground">
          {dev.serial_number}
        </span>
      ),
      className: "w-[20%]",
    },
    {
      header: "معرف الغرفة (Room ID)",
      render: (dev) => (
        <span className="font-mono text-xs text-muted-foreground truncate max-w-[150px] inline-block">
          {dev.room_id}
        </span>
      ),
      className: "w-[20%]",
    },
    {
      header: "الحالة",
      render: (dev) => {
        const isOpen = dropdownId === dev.id;
        return (
          <div className="relative inline-block text-right">
            <button
              type="button"
              onClick={() => setDropdownId(isOpen ? null : dev.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center justify-between gap-2 min-w-[160px] shadow-sm ${getDeviceStatusColor(
                dev.status,
              )} cursor-pointer transition-all hover:opacity-80`}
            >
              <span className="truncate">
                {statusLabels[dev.status] || dev.status}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div
                className="absolute z-50 top-full mt-2 right-0 bg-card border border-border rounded-2xl shadow-2xl p-1.5 min-w-[180px] space-y-1 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                {Object.entries(statusLabels).map(([value, label]) => {
                  const isSelected = dev.status === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setDropdownId(null);
                        // إرسال معرف الجهاز والقيمة الجديدة لتنفيذ الحفظ والتحديث
                        if (!isSelected) {
                          onStatusChange(dev.id, value);
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
      className: "w-[20%]",
    },
    {
      header: "إجراءات",
      render: (dev) => (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(dev)}
            className="p-2 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
            title="تعديل"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(dev.id)}
            className="p-2 rounded-xl bg-muted hover:bg-red-500/10 text-red-500 transition-all cursor-pointer"
            title="حذف"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      className: "text-center w-[15%]",
    },
  ];

  return (
    <ReusableTable
      columns={columns}
      data={devices}
      rowsPerPage={10}
      emptyMessage="لا توجد أجهزة طبية مسجلة حالياً."
    />
  );
}
