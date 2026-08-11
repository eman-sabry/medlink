
import {
  FileText,
  Pill,
  Plus,
  Trash2,
  Save,
  Loader2,
  Printer,
} from "lucide-react";
import { PermissionGuard } from "../../guards/PermissionGuard";

const EMPTY_MEDICINE = { name: "", dosage: "", frequency: "", duration: "" };

export function PrescriptionTab({
  diagnosis,
  setDiagnosis,
  notes,
  setNotes,
  medicines,
  setMedicines,
  hasPrescription,
  onSave,
  isSaving,
  onPrint,
  canEdit,
}) {
  const updateMedicine = (index, field, value) => {
    setMedicines((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-foreground text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            {hasPrescription ? "تعديل الروشتة" : "روشتة جديدة"}
          </h3>
          {hasPrescription && onPrint && (
            <PermissionGuard permission="prescriptions:print">
              <button
                type="button"
                onClick={onPrint}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-muted text-foreground hover:bg-muted/70 font-bold text-xs transition-all cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                طباعة الروشتة
              </button>
            </PermissionGuard>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground">
            التشخيص
          </label>
          <input
            type="text"
            value={diagnosis}
            disabled={!canEdit}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="التشخيص الطبي..."
            className="w-full h-11 rounded-2xl border border-border bg-background px-3.5 text-sm disabled:opacity-60"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground">
            ملاحظات وتعليمات
          </label>
          <textarea
            value={notes}
            disabled={!canEdit}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="تعليمات إضافية للمريض..."
            className="w-full rounded-2xl border border-border bg-background p-3.5 text-sm resize-none disabled:opacity-60"
          />
        </div>
    
        <div className="flex items-center justify-between">
          <h3 className="font-black text-foreground text-sm flex items-center gap-2">
            <Pill className="h-4 w-4 text-primary" />
            الأدوية الموصوفة
          </h3>
          {canEdit && (
            <button
              type="button"
              onClick={() =>
                setMedicines((prev) => [...prev, { ...EMPTY_MEDICINE }])
              }
              className="flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              إضافة دواء
            </button>
          )}
        </div>

        <div className="space-y-2">
          {medicines.map((med, index) => (
            <div
              key={index}
              className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 rounded-2xl bg-muted/40"
            >
              <input
                placeholder="اسم الدواء"
                value={med.name}
                disabled={!canEdit}
                onChange={(e) => updateMedicine(index, "name", e.target.value)}
                className="col-span-2 sm:col-span-2 h-10 rounded-xl border border-border bg-background px-3 text-xs disabled:opacity-60"
              />
              <input
                placeholder="الجرعة"
                value={med.dosage}
                disabled={!canEdit}
                onChange={(e) =>
                  updateMedicine(index, "dosage", e.target.value)
                }
                className="h-10 rounded-xl border border-border bg-background px-3 text-xs disabled:opacity-60"
              />
              <input
                placeholder="التكرار"
                value={med.frequency}
                disabled={!canEdit}
                onChange={(e) =>
                  updateMedicine(index, "frequency", e.target.value)
                }
                className="h-10 rounded-xl border border-border bg-background px-3 text-xs disabled:opacity-60"
              />
              <div className="flex items-center gap-1.5">
                <input
                  placeholder="المدة"
                  value={med.duration}
                  disabled={!canEdit}
                  onChange={(e) =>
                    updateMedicine(index, "duration", e.target.value)
                  }
                  className="h-10 flex-1 min-w-0 rounded-xl border border-border bg-background px-3 text-xs disabled:opacity-60"
                />
                {canEdit && medicines.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setMedicines((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {medicines.every((m) => !m.name) && !canEdit && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 py-2">
              <Pill className="h-3.5 w-3.5" />
              لا توجد أدوية مسجّلة
            </p>
          )}
        </div>

        {canEdit && (
          <PermissionGuard permission="prescriptions:add">
            <div className="pt-4 border-t border-border flex items-center justify-between">
              {!diagnosis.trim() && (
                <p className="text-[11px] font-bold text-amber-600">
                  يجب كتابة التشخيص أولاً قبل الحفظ
                </p>
              )}
              <div className="flex justify-end ms-auto">
                <button
                  type="button"
                  onClick={onSave}
                  disabled={isSaving || !diagnosis.trim()}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>
                    {hasPrescription
                      ? "حفظ تعديلات الروشتة والأدوية"
                      : "حفظ الروشتة بالكامل"}
                  </span>
                </button>
              </div>
            </div>
          </PermissionGuard>
        )}
      </div>
    </div>
  );
}
