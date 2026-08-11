import { useMemo, useState } from "react";
import { X, Loader2, Wallet, AlertTriangle, Eye } from "lucide-react";
import { CustomSelect } from "../ui/CustomSelect";
import {
  categoryOptionsForSelect,
  sourceTypeOptionsForSelect,
  SOURCE_TYPES_WITH_RELATED_ENTITY,
  EXPENSE_STATUS,
  EXPENSE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "../../helpers/expense.helpers";

export function AddExpenseModal({
  isOpen,
  onClose,
  onSave,
  onViewExisting,
  maintenanceList = [],
  devicesList = [],
  roomsList = [],
  expenses = [],
}) {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [sourceType, setSourceType] = useState("Manual");
  const [sourceId, setSourceId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [status, setStatus] = useState(EXPENSE_STATUS.PAID);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryOptions = useMemo(() => categoryOptionsForSelect(), []);
  const sourceTypeOptions = useMemo(() => sourceTypeOptionsForSelect(), []);
  const statusOptions = useMemo(
    () => Object.entries(EXPENSE_STATUS_LABELS).map(([value, label]) => ({ value, label })),
    [],
  );
  const methodOptions = useMemo(
    () => Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({ value, label })),
    [],
  );

  const needsRelatedEntity = SOURCE_TYPES_WITH_RELATED_ENTITY.includes(sourceType);
  const relatedEntityOptions = useMemo(() => {
    if (sourceType === "Maintenance") {
      return maintenanceList.map((m) => ({ value: m.id, label: `${m.reason} — ${m.cost} ج.م` }));
    }
    if (sourceType === "Device") {
      return devicesList.map((d) => ({ value: d.id, label: d.name }));
    }
    if (sourceType === "Room") {
      return roomsList.map((r) => ({ value: r.id, label: r.name }));
    }
    return [];
  }, [sourceType, maintenanceList, devicesList, roomsList]);

  const existingExpenseForSource = useMemo(
    () =>
      needsRelatedEntity && sourceId
        ? expenses.find((exp) => exp.source_type === sourceType && exp.source_id === sourceId) ?? null
        : null,
    [expenses, sourceType, sourceId, needsRelatedEntity],
  );

  if (!isOpen) return null;

  const resetForm = () => {
    setDescription("");
    setCategory("Other");
    setSourceType("Manual");
    setSourceId("");
    setAmount("");
    setDate(new Date().toISOString().slice(0, 10));
    setPaymentMethod("Cash");
    setStatus(EXPENSE_STATUS.PAID);
    setNotes("");
  };

  const isValid =
    description.trim() &&
    Number(amount) > 0 &&
    (!needsRelatedEntity || sourceId) &&
    !existingExpenseForSource;

  const handleSourceTypeChange = (value) => {
    setSourceType(value);
    setSourceId("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !isValid) return;

    setIsSubmitting(true);
    try {
      await onSave({
        description: description.trim(),
        category,
        source_type: sourceType,
        source_id: needsRelatedEntity ? sourceId : null,
        amount: Number(amount),
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        payment_method: paymentMethod,
        status,
        notes: notes.trim(),
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Add expense error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-black text-foreground tracking-wide flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            إضافة مصروف جديد
          </h2>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-all cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">الوصف</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثال: فاتورة كهرباء شهر أغسطس"
              className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">التصنيف</label>
              <CustomSelect value={category} onChange={setCategory} options={categoryOptions} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">نوع المصدر</label>
              <CustomSelect value={sourceType} onChange={handleSourceTypeChange} options={sourceTypeOptions} />
            </div>
          </div>

          {needsRelatedEntity && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">
                {sourceType === "Maintenance" ? "سجل الصيانة المرتبط" : sourceType === "Device" ? "الجهاز المرتبط" : "الغرفة المرتبطة"}
              </label>
              <CustomSelect
                value={sourceId}
                onChange={setSourceId}
                options={relatedEntityOptions}
                placeholder="-- اختر --"
              />
            </div>
          )}

          {existingExpenseForSource && (
            <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-destructive/10 ring-1 ring-destructive/20 text-sm">
              <div className="flex items-center gap-2.5 text-destructive font-bold">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>يوجد مصروف بالفعل مرتبط بهذا المصدر</span>
              </div>
              <button
                type="button"
                onClick={() => onViewExisting?.(existingExpenseForSource)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-destructive text-white font-bold text-xs hover:opacity-90 transition-all cursor-pointer shrink-0"
              >
                <Eye className="h-3.5 w-3.5" />
                عرض المصروف
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">المبلغ (ج.م)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">التاريخ</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">طريقة الدفع</label>
              <CustomSelect value={paymentMethod} onChange={setPaymentMethod} options={methodOptions} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">الحالة</label>
              <CustomSelect value={status} onChange={setStatus} options={statusOptions} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">ملاحظات</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="ملاحظات إضافية..."
              className="w-full rounded-2xl border border-border bg-background p-4 text-sm resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-2xl bg-muted text-foreground font-bold text-sm hover:bg-muted/80 transition-all cursor-pointer">
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>إضافة المصروف</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
