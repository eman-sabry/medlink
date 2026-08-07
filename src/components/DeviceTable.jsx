import { Edit, Trash2 } from "lucide-react";

export default function DeviceTable({
  devices,
  onStatusChange,
  onOpenEdit,
  onDelete,
}) {
  return (
    <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs font-extrabold">
              <th className="p-4">اسم الجهاز</th>
              <th className="p-4">الرقم التسلسلي (Serial Number)</th>
              <th className="p-4">معرف الغرفة (Room ID)</th>
              <th className="p-4">الحالة</th>
              <th className="p-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {devices.map((dev) => (
              <tr key={dev.id} className="hover:bg-muted/20 transition-all">
                <td className="p-4 font-black text-foreground text-sm">
                  {dev.name}
                </td>
                <td className="p-4 font-mono font-bold text-muted-foreground">
                  {dev.serial_number}
                </td>
                <td className="p-4 font-mono text-xs text-muted-foreground">
                  {dev.room_id}
                </td>
                <td className="p-4">
                  <select
                    value={dev.status}
                    onChange={(e) => onStatusChange(dev.id, e.target.value)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs border border-border cursor-pointer ${
                      dev.status === "Operational"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : dev.status === "Maintenance"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    <option value="Operational">تعمل (Operational)</option>
                    <option value="Maintenance">صيانة (Maintenance)</option>
                    <option value="Out-Of-Service">
                      خارج الخدمة (Out-Of-Service)
                    </option>
                  </select>
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenEdit(dev)}
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
                </td>
              </tr>
            ))}
            {devices.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="p-8 text-center text-muted-foreground font-bold"
                >
                  لا توجد أجهزة مطابقة للبحث.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
