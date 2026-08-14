import { useMemo, useState } from "react";
import { X, Loader2, Plus, Trash2, Receipt, AlertTriangle, Eye } from "lucide-react";
import { CustomSelect } from "../ui/CustomSelect";
import { calculateInvoiceTotals, calculateLineTotal, PAYMENT_METHOD_LABELS } from "../../utils/billing";

const EMPTY_ITEM = { service_id: "", description: "", quantity: 1, unit_price: 0, discount_amount: 0 };

export function AddInvoiceModal({
  isOpen,
  onClose,
  onSave,
  onViewExisting,
  patients = [],
  doctors = [],
  appointments = [],
  services = [],
  invoices = [],
}) {
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [invoiceDiscount, setInvoiceDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const patientOptions = useMemo(
    () =>
      patients.map((p) => ({
        value: p.id,
        label: `${p.full_name} (${p.file_no ?? "—"})`,
        searchValue: `${p.full_name} ${p.file_no ?? ""} ${p.phone ?? ""}`,
      })),
    [patients],
  );
  const doctorOptions = useMemo(
    () => doctors.map((d) => ({ value: d.id, label: d.full_name })),
    [doctors],
  );
  const patientAppointments = useMemo(
    () => appointments.filter((a) => a.patient_id === patientId),
    [appointments, patientId],
  );
  const appointmentOptions = useMemo(
    () =>
      patientAppointments.map((a) => ({
        value: a.id,
        label: `${a.service_name} — ${new Date(a.starts_at).toLocaleDateString("ar-EG-u-nu-latn")}`,
      })),
    [patientAppointments],
  );
  const serviceOptions = useMemo(
    () => services.map((s) => ({ value: s.id, label: `${s.name} (${s.default_price} ج.م)` })),
    [services],
  );
  const methodOptions = useMemo(
    () => Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({ value, label })),
    [],
  );

  const totals = useMemo(() => calculateInvoiceTotals(items, Number(invoiceDiscount) || 0), [items, invoiceDiscount]);

  const existingInvoiceForAppointment = useMemo(
    () => (appointmentId ? invoices.find((inv) => inv.appointment_id === appointmentId) ?? null : null),
    [invoices, appointmentId],
  );

  if (!isOpen) return null;

  const handleAppointmentChange = (id) => {
    setAppointmentId(id);
    const appointment = patientAppointments.find((a) => a.id === id);
    if (!appointment) return;
    if (appointment.doctor_id) setDoctorId(appointment.doctor_id);
    const service = services.find((s) => s.id === appointment.service_id);
    if (service) {
      setItems((prev) => {
        if (prev.length === 1 && !prev[0].service_id) {
          return [{ service_id: service.id, description: service.name, quantity: 1, unit_price: service.default_price ?? 0, discount_amount: 0 }];
        }
        return prev;
      });
    }
  };

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        if (field === "service_id") {
          const service = services.find((s) => s.id === value);
          if (service) {
            updated.description = service.name;
            updated.unit_price = service.default_price ?? 0;
          }
        }
        return updated;
      }),
    );
  };

  const resetForm = () => {
    setPatientId("");
    setDoctorId("");
    setAppointmentId("");
    setItems([{ ...EMPTY_ITEM }]);
    setInvoiceDiscount(0);
    setPaidAmount(0);
    setPaymentMethod("Cash");
    setNotes("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !patientId || existingInvoiceForAppointment || items.every((it) => !it.service_id)) return;

    setIsSubmitting(true);
    try {
      const validItems = items
        .filter((it) => it.service_id)
        .map((it) => ({
          service_id: it.service_id,
          description: it.description,
          quantity: Number(it.quantity) || 1,
          unit_price: Number(it.unit_price) || 0,
          discount_amount: Number(it.discount_amount) || 0,
          line_total: calculateLineTotal(it),
        }));

      await onSave({
        invoice: {
          patient_id: patientId,
          appointment_id: appointmentId || null,
          doctor_id: doctorId || null,
          issued_at: new Date().toISOString(),
          due_at: new Date().toISOString(),
          status: "Unpaid",
          subtotal_amount: totals.subtotal,
          discount_amount: totals.discount,
          total_amount: totals.total,
          payment_method: paymentMethod,
          notes: notes.trim(),
        },
        items: validItems,
        payment:
          Number(paidAmount) > 0
            ? { amount: Number(paidAmount), method: paymentMethod }
            : null,
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Add invoice error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-3xl rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-black text-foreground tracking-wide flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            إنشاء فاتورة جديدة
          </h2>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-all cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">المريض</label>
              <CustomSelect value={patientId} onChange={(v) => { setPatientId(v); setAppointmentId(""); }} options={patientOptions} placeholder="-- اختر المريض --" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">الموعد / الجلسة (اختياري)</label>
              <CustomSelect value={appointmentId} onChange={handleAppointmentChange} options={appointmentOptions} placeholder="-- بدون ربط بموعد --" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">الطبيب</label>
              <CustomSelect value={doctorId} onChange={setDoctorId} options={doctorOptions} placeholder="-- اختر الطبيب --" />
            </div>
          </div>

          {existingInvoiceForAppointment && (
            <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-destructive/10 ring-1 ring-destructive/20 text-sm">
              <div className="flex items-center gap-2.5 text-destructive font-bold">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>تم إنشاء فاتورة بالفعل لهذا العنصر ({existingInvoiceForAppointment.invoice_no})</span>
              </div>
              <button
                type="button"
                onClick={() => onViewExisting?.(existingInvoiceForAppointment)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-destructive text-white font-bold text-xs hover:opacity-90 transition-all cursor-pointer shrink-0"
              >
                <Eye className="h-3.5 w-3.5" />
                عرض الفاتورة
              </button>
            </div>
          )}

          <div className={`space-y-2 ${existingInvoiceForAppointment ? "hidden" : ""}`}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted-foreground">بنود الفاتورة</label>
              <button type="button" onClick={() => setItems((prev) => [...prev, { ...EMPTY_ITEM }])} className="flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer">
                <Plus className="h-3.5 w-3.5" />
                إضافة بند
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 rounded-2xl bg-muted/40">
                  <div className="col-span-2">
                    <CustomSelect value={item.service_id} onChange={(v) => updateItem(index, "service_id", v)} options={serviceOptions} placeholder="اختر الخدمة" />
                  </div>
                  <input type="number" min="1" placeholder="الكمية" value={item.quantity} onChange={(e) => updateItem(index, "quantity", e.target.value)} className="h-10 rounded-xl border border-border bg-background px-3 text-xs" />
                  <input type="number" min="0" placeholder="سعر الوحدة" value={item.unit_price} onChange={(e) => updateItem(index, "unit_price", e.target.value)} className="h-10 rounded-xl border border-border bg-background px-3 text-xs" />
                  <div className="flex items-center gap-1.5">
                    <input type="number" min="0" placeholder="خصم البند" value={item.discount_amount} onChange={(e) => updateItem(index, "discount_amount", e.target.value)} className="h-10 flex-1 min-w-0 rounded-xl border border-border bg-background px-3 text-xs" />
                    {items.length > 1 && (
                      <button type="button" onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))} className="shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 cursor-pointer">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${existingInvoiceForAppointment ? "hidden" : ""}`}>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">خصم إضافي على الفاتورة (ج.م)</label>
                <input type="number" min="0" value={invoiceDiscount} onChange={(e) => setInvoiceDiscount(e.target.value)} className="w-full h-11 rounded-2xl border border-border bg-background px-4 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">دفعة أولية عند الإنشاء (ج.م)</label>
                <input type="number" min="0" max={totals.total} value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} className="w-full h-11 rounded-2xl border border-border bg-background px-4 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">طريقة الدفع</label>
                <CustomSelect value={paymentMethod} onChange={setPaymentMethod} options={methodOptions} />
              </div>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-primary/5 ring-1 ring-primary/15 h-fit">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span className="font-bold text-foreground">{totals.subtotal} ج.م</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">الخصم</span>
                <span className="font-bold text-rose-600">-{totals.discount} ج.م</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-primary/15">
                <span className="font-black text-foreground">الإجمالي</span>
                <span className="font-black text-primary">{totals.total} ج.م</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">المتبقي بعد الدفعة الأولية</span>
                <span className="font-bold text-foreground">{Math.max(0, totals.total - (Number(paidAmount) || 0))} ج.م</span>
              </div>
            </div>
          </div>

          <div className={`space-y-1.5 ${existingInvoiceForAppointment ? "hidden" : ""}`}>
            <label className="text-xs font-bold text-muted-foreground">ملاحظات</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="ملاحظات إضافية..." className="w-full rounded-2xl border border-border bg-background p-4 text-sm resize-none" />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-2xl bg-muted text-foreground font-bold text-sm hover:bg-muted/80 transition-all cursor-pointer">
              إلغاء
            </button>
            {!existingInvoiceForAppointment && (
              <button type="submit" disabled={isSubmitting || !patientId} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-50">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>إنشاء الفاتورة</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
