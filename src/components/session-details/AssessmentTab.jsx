import { ClipboardList, Loader2, Save } from "lucide-react";
import { PermissionGuard } from "../../guards/PermissionGuard";

const TEXT_FIELDS = [
  { key: "assessment", label: "التقييم" },
  { key: "symptoms", label: "الأعراض" },
  { key: "observations", label: "الملاحظات السريرية" },
];

export function AssessmentTab({ form, onChange, onSave, isSaving, canEdit }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
      <h3 className="font-black text-foreground text-sm flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-primary" />
        التقييم السريري
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5 sm:col-span-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-muted-foreground">مستوى الألم</label>
            <span className="text-xs font-black text-primary">{form.painLevel} / 10</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={form.painLevel}
            disabled={!canEdit}
            onChange={(e) => onChange("painLevel", Number(e.target.value))}
            className="w-full accent-primary disabled:opacity-60"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground">مدى الحركة (ROM)</label>
          <input
            type="text"
            value={form.rangeOfMotion}
            disabled={!canEdit}
            onChange={(e) => onChange("rangeOfMotion", e.target.value)}
            placeholder="مثال: 70 درجة"
            className="w-full h-11 rounded-2xl border border-border bg-background px-3.5 text-xs disabled:opacity-60"
          />
        </div>

        {TEXT_FIELDS.map((field) => (
          <div key={field.key} className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">{field.label}</label>
            <textarea
              rows={2}
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
              <span>حفظ التقييم</span>
            </button>
          </div>
        </PermissionGuard>
      )}
    </div>
  );
}
