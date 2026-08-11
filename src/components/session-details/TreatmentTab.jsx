import { Stethoscope, Loader2, Save } from "lucide-react";
import { PermissionGuard } from "../../guards/PermissionGuard";

const TEXT_FIELDS = [
  { key: "treatmentPerformed", label: "العلاج المُقدَّم" },
  { key: "exercises", label: "التمارين/التدخلات" },
  { key: "progress", label: "التقدّم الملحوظ" },
  { key: "recommendations", label: "التوصيات" },
];

export function TreatmentTab({ form, onChange, onSave, isSaving, canEdit }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
      <h3 className="font-black text-foreground text-sm flex items-center gap-2">
        <Stethoscope className="h-4 w-4 text-primary" />
        العلاج وملاحظات الجلسة
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {TEXT_FIELDS.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">{field.label}</label>
            <textarea
              rows={3}
              value={form[field.key]}
              disabled={!canEdit}
              onChange={(e) => onChange(field.key, e.target.value)}
              className="w-full rounded-2xl border border-border bg-background p-3.5 text-xs resize-none disabled:opacity-60"
            />
          </div>
        ))}
      </div>

      {canEdit && (
        <PermissionGuard permission="sessions:edit">
          <div className="flex justify-end pt-2 border-t border-border">
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>حفظ ملاحظات العلاج</span>
            </button>
          </div>
        </PermissionGuard>
      )}
    </div>
  );
}
