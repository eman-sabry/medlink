import { useState } from "react";
import { X, Loader2, Plus, Trash2, FileText } from "lucide-react";

const EMPTY_MEDICINE = { name: "", dosage: "", frequency: "", duration: "" };

export function AddPrescriptionModal({ isOpen, session, onClose, onSubmit }) {
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState([{ ...EMPTY_MEDICINE }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !session) return null;

  const updateMedicine = (index, field, value) => {
    setMedicines((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !diagnosis.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        id: session.id,
        prescription: {
          diagnosis: diagnosis.trim(),
          notes: notes.trim(),
          medicines: medicines.filter((m) => m.name.trim()),
        },
      });
      setDiagnosis("");
      setNotes("");
      setMedicines([{ ...EMPTY_MEDICINE }]);
      onClose();
    } catch (error) {
      console.error("Add prescription error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-black text-foreground tracking-wide flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              إضافة روشتة
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              للجلسة مع {session.doctorName} — {session.serviceName}
            </p>
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
            <label className="text-xs font-bold text-muted-foreground">التشخيص</label>
            <input
              type="text"
              required
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="التشخيص الطبي..."
              className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground focus:outline-hidden focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted-foreground">الأدوية</label>
              <button
                type="button"
                onClick={() => setMedicines((prev) => [...prev, { ...EMPTY_MEDICINE }])}
                className="flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                إضافة دواء
              </button>
            </div>
            <div className="space-y-2">
              {medicines.map((med, index) => (
                <div key={index} className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 rounded-2xl bg-muted/40">
                  <input
                    placeholder="اسم الدواء"
                    value={med.name}
                    onChange={(e) => updateMedicine(index, "name", e.target.value)}
                    className="col-span-2 sm:col-span-2 h-10 rounded-xl border border-border bg-background px-3 text-xs"
                  />
                  <input
                    placeholder="الجرعة"
                    value={med.dosage}
                    onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                    className="h-10 rounded-xl border border-border bg-background px-3 text-xs"
                  />
                  <input
                    placeholder="التكرار"
                    value={med.frequency}
                    onChange={(e) => updateMedicine(index, "frequency", e.target.value)}
                    className="h-10 rounded-xl border border-border bg-background px-3 text-xs"
                  />
                  <div className="flex items-center gap-1.5">
                    <input
                      placeholder="المدة"
                      value={med.duration}
                      onChange={(e) => updateMedicine(index, "duration", e.target.value)}
                      className="h-10 flex-1 min-w-0 rounded-xl border border-border bg-background px-3 text-xs"
                    />
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setMedicines((prev) => prev.filter((_, i) => i !== index))}
                        className="shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">ملاحظات وتعليمات</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="تعليمات إضافية للمريض..."
              className="w-full rounded-2xl border border-border bg-background p-4 text-sm text-foreground focus:outline-hidden focus:border-primary transition-all resize-none"
            />
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
              disabled={isSubmitting || !diagnosis.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>حفظ الروشتة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
