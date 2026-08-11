import { useState } from "react";
import { X, Loader2, StickyNote } from "lucide-react";
import { CustomSelect } from "../../ui/CustomSelect";

const SEVERITY_OPTIONS = [
  { value: "Normal", label: "عادية" },
  { value: "Important", label: "هامة" },
  { value: "Critical", label: "حرجة" },
];

export function AddNoteModal({ isOpen, onClose, onAdd }) {
  const [content, setContent] = useState("");
  const [severity, setSeverity] = useState("Normal");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !content.trim()) return;
    setIsSubmitting(true);
    try {
      await onAdd({ content: content.trim(), severity });
      setContent("");
      setSeverity("Normal");
      onClose();
    } catch (error) {
      console.error("Add note error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-black text-foreground tracking-wide flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-primary" />
            إضافة ملاحظة
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-all cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">نص الملاحظة</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              placeholder="اكتب الملاحظة هنا..."
              className="w-full rounded-2xl border border-border bg-background p-4 text-sm text-foreground focus:outline-hidden focus:border-primary transition-all shadow-xs resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">درجة الأهمية</label>
            <CustomSelect value={severity} onChange={setSeverity} options={SEVERITY_OPTIONS} />
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
              disabled={isSubmitting || !content.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>حفظ الملاحظة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
