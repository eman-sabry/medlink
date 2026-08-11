import { X, Printer, Wallet, User, FileText, Stethoscope, Calendar, CreditCard } from "lucide-react";
import { useInvoice } from "../../hooks/useInvoice";
import { PermissionGuard } from "../../guards/PermissionGuard";
import { PaymentHistory } from "./PaymentHistory";
import { INVOICE_STATUS_FILTER_OPTIONS } from "../../helpers/invoices.helpers";
import { PAYMENT_METHOD_LABELS } from "../../utils/billing";
import { LoadingState } from "../ui/LoadingState";
import { formatDate } from "../../utils/date";

export function InvoiceDetailsModal({ invoiceId, onClose, onPrint, onRecordPayment }) {
  const { isLoading, invoice } = useInvoice(invoiceId);

  if (!invoiceId) return null;

  const statusConfig = invoice
    ? INVOICE_STATUS_FILTER_OPTIONS.find((o) => o.key === invoice.computedStatus)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-black text-foreground tracking-wide flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            تفاصيل الفاتورة
          </h2>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-all cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading || !invoice ? (
          <LoadingState message="جاري تحميل تفاصيل الفاتورة..." />
        ) : (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-2xl font-black text-foreground">{invoice.invoice_no}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(invoice.issued_at)}
                </p>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${statusConfig?.style ?? ""}`}>
                {statusConfig?.label ?? invoice.computedStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-muted/40 flex items-center gap-2.5 text-xs">
                <User className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="font-bold text-foreground">{invoice.patient?.full_name ?? "مريض غير معروف"}</p>
                  <p className="text-muted-foreground">{invoice.patient?.file_no ?? "—"}</p>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-muted/40 flex items-center gap-2.5 text-xs">
                <Stethoscope className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="font-bold text-foreground">{invoice.doctorName ?? "غير محدد"}</p>
                  <p className="text-muted-foreground">الطبيب المعالج</p>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-muted/40 flex items-center gap-2.5 text-xs">
                <CreditCard className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="font-bold text-foreground">
                    {PAYMENT_METHOD_LABELS[invoice.payment_method] ?? invoice.payment_method ?? "—"}
                  </p>
                  <p className="text-muted-foreground">طريقة الدفع</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-muted-foreground">البنود</h3>
              <div className="rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-2.5 text-right font-bold text-muted-foreground">الوصف</th>
                      <th className="p-2.5 text-center font-bold text-muted-foreground">الكمية</th>
                      <th className="p-2.5 text-center font-bold text-muted-foreground">السعر</th>
                      <th className="p-2.5 text-center font-bold text-muted-foreground">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoice.items.map((item) => (
                      <tr key={item.id}>
                        <td className="p-2.5 font-bold text-foreground">{item.serviceName}</td>
                        <td className="p-2.5 text-center text-muted-foreground">{item.quantity}</td>
                        <td className="p-2.5 text-center text-muted-foreground">{item.unit_price} ج.م</td>
                        <td className="p-2.5 text-center font-bold text-foreground">{item.line_total} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 rounded-2xl bg-muted/40">
                <p className="text-muted-foreground">المجموع الفرعي</p>
                <p className="font-black text-foreground mt-0.5">{invoice.subtotal_amount} ج.م</p>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40">
                <p className="text-muted-foreground">الخصم</p>
                <p className="font-black text-foreground mt-0.5">{invoice.discount_amount} ج.م</p>
              </div>
              <div className="p-3 rounded-2xl bg-primary/10">
                <p className="text-muted-foreground">الإجمالي</p>
                <p className="font-black text-primary mt-0.5">{invoice.total_amount} ج.م</p>
              </div>
              <div className="p-3 rounded-2xl bg-rose-500/10">
                <p className="text-muted-foreground">المتبقي</p>
                <p className="font-black text-rose-600 mt-0.5">{invoice.balanceDue} ج.م</p>
              </div>
            </div>

            {invoice.notes && (
              <div className="p-3.5 rounded-2xl bg-muted/40 text-xs">
                <p className="text-muted-foreground font-bold mb-1">ملاحظات</p>
                <p className="text-foreground">{invoice.notes}</p>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-muted-foreground">سجل الدفعات</h3>
              <PaymentHistory payments={invoice.payments} />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <PermissionGuard permission="billing:record_payment">
                {invoice.balanceDue > 0 && (
                  <button
                    type="button"
                    onClick={() => onRecordPayment(invoice)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500/10 text-emerald-600 font-bold text-sm hover:bg-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Wallet className="h-4 w-4" />
                    تسجيل دفعة
                  </button>
                )}
              </PermissionGuard>
              <PermissionGuard permission="billing:print">
                <button
                  type="button"
                  onClick={() => onPrint(invoice)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  طباعة
                </button>
              </PermissionGuard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
