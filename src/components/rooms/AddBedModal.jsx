import { useState } from "react";
import { X, Loader2, BedDouble } from "lucide-react";
import { CustomSelect } from "../ui/CustomSelect";
import { BED_STATUS_OPTIONS } from "../../helpers/rooms.helpers";

const INITIAL_STATUS_OPTIONS = BED_STATUS_OPTIONS.filter((o) => o.value !== "Occupied");

export function AddBedModal({ isOpen, room, isSubmitting = false, onClose, onAdd }) {
  const [label, setLabel] = useState("");
  const [status, setStatus] = useState("Available");

  if (!isOpen || !room) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !label.trim()) return;
    try {
      await onAdd({ roomId: room.id, label, status });
      onClose();
    } catch {
      // error toast shown by the mutation hook
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-black text-foreground tracking-wide flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-primary" />
              إضافة سرير
            </h2>
            <p className="text-xs text-muted-foreground mt-1">غرفة {room.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">اسم/رقم السرير</label>
            <input
              type="text"
              autoFocus
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="مثال: سرير علاج 5"
              className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground focus:outline-hidden focus:border-primary transition-all shadow-xs"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">الحالة الأولية</label>
            <CustomSelect value={status} onChange={setStatus} options={INITIAL_STATUS_OPTIONS} />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl bg-muted text-foreground font-bold text-sm hover:bg-muted/80 transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !label.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>إضافة السرير</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
