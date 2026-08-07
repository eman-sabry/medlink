import { X } from "lucide-react";

export default function DeviceModal({
  isOpen,
  onClose,
  onSubmit,
  editingDevice,
  formData,
  setFormData,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md space-y-6 shadow-xl text-right">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-lg font-black text-foreground">
            {editingDevice ? "تعديل بيانات الجهاز" : "إضافة جهاز طبي جديد"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">
              اسم الجهاز
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="مثال: جهاز علاج طبيعي 1"
              className="w-full bg-muted/40 border border-border rounded-2xl p-3 text-xs focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">
              الرقم التسلسلي (Serial Number)
            </label>
            <input
              type="text"
              required
              value={formData.serial_number}
              onChange={(e) =>
                setFormData({ ...formData, serial_number: e.target.value })
              }
              placeholder="مثال: SN-DEV-991"
              className="w-full bg-muted/40 border border-border rounded-2xl p-3 text-xs focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">
              معرف الغرفة (Room ID)
            </label>
            <input
              type="text"
              required
              value={formData.room_id}
              onChange={(e) =>
                setFormData({ ...formData, room_id: e.target.value })
              }
              placeholder="مثال: rom10000-0000-0000-0000-000000000001"
              className="w-full bg-muted/40 border border-border rounded-2xl p-3 text-xs focus:outline-none focus:border-primary font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">
              حالة الجهاز
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full bg-muted/40 border border-border rounded-2xl p-3 text-xs focus:outline-none focus:border-primary"
            >
              <option value="Operational">تعمل (Operational)</option>
              <option value="Maintenance">صيانة (Maintenance)</option>
              <option value="Out-Of-Service">
                خارج الخدمة (Out-Of-Service)
              </option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-muted text-foreground font-bold text-xs cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md cursor-pointer"
            >
              {editingDevice ? "حفظ التعديلات" : "إضافة الجهاز"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
