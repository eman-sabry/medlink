import { useMemo, useState } from "react";
import { X, Loader2, UserPlus } from "lucide-react";
import { CustomSelect } from "../ui/CustomSelect";

export function AssignPatientToBedModal({
  isOpen,
  rooms = [],
  beds = [],
  patients = [],
  initialRoomId = null,
  initialBedId = null,
  isSubmitting = false,
  onClose,
  onAssign,
}) {
  const [patientId, setPatientId] = useState("");
  const [roomId, setRoomId] = useState(initialRoomId ?? "");
  const [bedId, setBedId] = useState(initialBedId ?? "");

  const patientOptions = useMemo(
    () =>
      patients.map((p) => ({
        value: p.id,
        label: p.file_no ? `${p.full_name} — ${p.file_no}` : p.full_name,
        searchValue: `${p.full_name} ${p.file_no ?? ""} ${p.phone ?? ""}`,
      })),
    [patients],
  );

  const roomOptions = useMemo(() => rooms.map((r) => ({ value: r.id, label: r.name })), [rooms]);

  const availableBedOptions = useMemo(
    () =>
      beds
        .filter((b) => b.room_id === roomId && b.status === "Available")
        .map((b) => ({ value: b.id, label: b.label })),
    [beds, roomId],
  );

  if (!isOpen) return null;

  const handleRoomChange = (value) => {
    setRoomId(value);
    setBedId("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !patientId || !roomId || !bedId) return;
    try {
      await onAssign({ patientId, roomId, bedId });
      onClose();
    } catch {
      // error toast shown by the mutation hook
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-black text-foreground tracking-wide flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              تعيين مريض لسرير
            </h2>
            <p className="text-xs text-muted-foreground mt-1">يجب أن يكون للمريض موعد بانتظار الطبيب أو وصل</p>
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
            <label className="text-xs font-bold text-muted-foreground">المريض</label>
            <CustomSelect value={patientId} onChange={setPatientId} options={patientOptions} placeholder="اختر المريض" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">الغرفة</label>
            <CustomSelect value={roomId} onChange={handleRoomChange} options={roomOptions} placeholder="اختر الغرفة" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">السرير المتاح</label>
            <CustomSelect
              value={bedId}
              onChange={setBedId}
              options={availableBedOptions}
              placeholder={roomId ? "اختر سريراً متاحاً" : "اختر الغرفة أولاً"}
            />
            {roomId && availableBedOptions.length === 0 && (
              <p className="text-[11px] text-destructive font-bold">لا توجد أسرّة متاحة في هذه الغرفة حالياً</p>
            )}
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
              disabled={isSubmitting || !patientId || !roomId || !bedId}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>تأكيد التعيين</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
