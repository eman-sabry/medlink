import { useMemo, useState } from "react";
import { X, Loader2, Package, CheckCircle2 } from "lucide-react";
import { CustomSelect } from "../ui/CustomSelect";
import { PAYMENT_METHOD_LABELS } from "../../utils/billing";

const METHOD_OPTIONS = Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({ value, label }));

export function AssignPackageModal({ isOpen, patientName, packageTemplates = [], isSubmitting = false, onClose, onAssign }) {
  const [packageTemplateId, setPackageTemplateId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));

  const activeTemplates = useMemo(
    () => packageTemplates.filter((t) => t.status === "Active"),
    [packageTemplates],
  );
  const templateOptions = useMemo(
    () => activeTemplates.map((t) => ({ value: t.id, label: t.name })),
    [activeTemplates],
  );
  const selectedTemplate = activeTemplates.find((t) => t.id === packageTemplateId) ?? null;
  const finalPrice = selectedTemplate
    ? Math.round(selectedTemplate.price * (1 - (selectedTemplate.discount_percent ?? 0) / 100))
    : 0;

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !packageTemplateId) return;
    try {
      await onAssign({ packageTemplateId, paymentMethod, startDate });
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
              <Package className="h-5 w-5 text-primary" />
              اشتراك في باقة
            </h2>
            <p className="text-xs text-muted-foreground mt-1">المريض: {patientName}</p>
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
            <label className="text-xs font-bold text-muted-foreground">الباقة</label>
            <CustomSelect
              value={packageTemplateId}
              onChange={setPackageTemplateId}
              options={templateOptions}
              placeholder="اختر باقة..."
            />
          </div>

          {selectedTemplate && (
            <div className="grid grid-cols-2 gap-2 p-3.5 rounded-2xl bg-primary/5 border border-primary/10 text-xs">
              <div className="p-2 rounded-xl bg-card text-center">
                <p className="text-muted-foreground">عدد الجلسات</p>
                <p className="font-black text-foreground mt-0.5">{selectedTemplate.session_count}</p>
              </div>
              <div className="p-2 rounded-xl bg-card text-center">
                <p className="text-muted-foreground">السعر النهائي</p>
                <p className="font-black text-primary mt-0.5">{finalPrice} ج.م</p>
              </div>
              {selectedTemplate.discount_percent > 0 && (
                <div className="col-span-2 flex items-center justify-center gap-1.5 text-emerald-600 font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>خصم {selectedTemplate.discount_percent}% — بدلاً من {selectedTemplate.price} ج.م</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">تاريخ البداية</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">طريقة الدفع</label>
            <CustomSelect value={paymentMethod} onChange={setPaymentMethod} options={METHOD_OPTIONS} />
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
              disabled={isSubmitting || !packageTemplateId}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>تأكيد الاشتراك والدفع</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
