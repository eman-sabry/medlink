import { useState } from "react";
import { X, Loader2, Edit, Link2 } from "lucide-react";
import { CustomSelect } from "../ui/CustomSelect";
import { toDateInputValue } from "../../utils/date";
import {
  categoryOptionsForSelect,
  EXPENSE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  EXPENSE_SOURCE_TYPES,
} from "../../helpers/expense.helpers";

export function EditExpenseModal({ isOpen, expense, onClose, onUpdate }) {
  const [description, setDescription] = useState(() => expense?.description ?? "");
  const [category, setCategory] = useState(() => expense?.category ?? "Other");
  const [amount, setAmount] = useState(() => expense?.amount ?? "");
  const [date, setDate] = useState(() => toDateInputValue(expense?.date) ?? "");
  const [paymentMethod, setPaymentMethod] = useState(() => expense?.payment_method ?? "Cash");
  const [status, setStatus] = useState(() => expense?.status ?? "Paid");
  const [notes, setNotes] = useState(() => expense?.notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !expense) return null;

  const isLinkedToSource = expense.sourceType && expense.sourceType !== "Manual";
  const categoryOptions = categoryOptionsForSelect();
  const statusOptions = Object.entries(EXPENSE_STATUS_LABELS).map(([value, label]) => ({ value, label }));
  const methodOptions = Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({ value, label }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !description.trim() || !(Number(amount) > 0)) return;
    setIsSubmitting(true);
    try {
      await onUpdate(expense.id, {
        description: description.trim(),
        category,
        amount: Number(amount),
        date: date ? new Date(date).toISOString() : expense.date,
        payment_method: paymentMethod,
        status,
        notes: notes.trim(),
      });
      onClose();
    } catch (error) {
      console.error("Update expense error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-black text-foreground tracking-wide flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            تعديل المصروف
          </h2>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-all cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLinkedToSource && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-primary/5 ring-1 ring-primary/15 text-xs text-muted-foreground">
            <Link2 className="h-4 w-4 text-primary shrink-0" />
            <span>
              هذا المصروف مرتبط بمصدر ({EXPENSE_SOURCE_TYPES[expense.sourceType] ?? expense.sourceType}) — المبلغ يُحدَّث تلقائياً من المصدر ولا يمكن تعديله هنا مباشرةً.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">الوصف</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">التصنيف</label>
            <CustomSelect value={category} onChange={setCategory} options={categoryOptions} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">المبلغ (ج.م)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLinkedToSource}
              className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">التاريخ</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-2xl border border-border bg-background p-4 text-sm resize-none" />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-2xl bg-muted text-foreground font-bold text-sm hover:bg-muted/80 transition-all cursor-pointer">
              إلغاء
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-50">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
