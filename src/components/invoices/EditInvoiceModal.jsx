import { useState } from "react";
import { X, Loader2, Edit } from "lucide-react";
import { CustomSelect } from "../ui/CustomSelect";
import { roundMoney, PAYMENT_METHOD_LABELS } from "../../utils/billing";

export function EditInvoiceModal({ isOpen, invoice, onClose, onUpdate, doctors = [] }) {
  const [doctorId, setDoctorId] = useState(() => invoice?.doctor_id ?? "");
  const [dueAt, setDueAt] = useState(() => (invoice?.due_at ? invoice.due_at.slice(0, 10) : ""));
  const [discount, setDiscount] = useState(() => invoice?.discount_amount ?? 0);
  const [paymentMethod, setPaymentMethod] = useState(() => invoice?.payment_method ?? "Cash");
  const [notes, setNotes] = useState(() => invoice?.notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !invoice) return null;

  const doctorOptions = doctors.map((d) => ({ value: d.id, label: d.full_name }));
  const methodOptions = Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({ value, label }));
  const newTotal = roundMoney(Math.max(0, (invoice.subtotal_amount ?? 0) - (Number(discount) || 0)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onUpdate(invoice.id, {
        id: invoice.id,
        patient_id: invoice.patient_id,
        appointment_id: invoice.appointment_id,
        invoice_no: invoice.invoice_no,
        issued_at: invoice.issued_at,
        subtotal_amount: invoice.subtotal_amount,
        status: invoice.status,
        doctor_id: doctorId || null,
        due_at: dueAt ? new Date(dueAt).toISOString() : invoice.due_at,
        discount_amount: Number(discount) || 0,
        total_amount: newTotal,
        payment_method: paymentMethod,
        notes: notes.trim(),
      });
      onClose();
    } catch (error) {
      console.error("Update invoice error:", error);
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
            تعديل الفاتورة {invoice.invoice_no}
          </h2>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-all cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">الطبيب</label>
            <CustomSelect value={doctorId} onChange={setDoctorId} options={doctorOptions} placeholder="-- اختر الطبيب --" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">تاريخ الاستحقاق</label>
            <input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">الخصم الإجمالي (ج.م)</label>
            <input type="number" min="0" max={invoice.subtotal_amount} value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm" />
            <p className="text-[11px] text-muted-foreground">الإجمالي الجديد: <span className="font-bold text-primary">{newTotal} ج.م</span></p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">طريقة الدفع</label>
            <CustomSelect value={paymentMethod} onChange={setPaymentMethod} options={methodOptions} />
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
