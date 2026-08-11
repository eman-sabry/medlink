import { PAYMENT_METHOD_LABELS } from "../../utils/billing";
import { INVOICE_STATUS_FILTER_OPTIONS } from "../../helpers/invoices.helpers";
import { formatDate } from "../../utils/date";

export function PrintableInvoice({ invoice, centerSettings }) {
  if (!invoice) return null;

  const statusLabel = INVOICE_STATUS_FILTER_OPTIONS.find((o) => o.key === invoice.computedStatus)?.label ?? invoice.computedStatus;

  const lastPaymentMethod = [...invoice.payments].sort(
    (a, b) => new Date(b.paid_at ?? 0) - new Date(a.paid_at ?? 0),
  )[0]?.method;
  const displayedPaymentMethod = invoice.payment_method ?? lastPaymentMethod;

  return (
    <div className="hidden print:block text-black" dir="rtl">
      <div className="flex items-start justify-between border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-black">{centerSettings?.name ?? "MedLink"}</h1>
          {centerSettings?.address && <p className="text-sm mt-1">{centerSettings.address}</p>}
          {centerSettings?.phone && <p className="text-sm" dir="ltr">{centerSettings.phone}</p>}
        </div>
        <div className="text-left">
          <h2 className="text-xl font-black">فاتورة</h2>
          <p className="text-sm mt-1">رقم الفاتورة: {invoice.invoice_no}</p>
          <p className="text-sm">التاريخ: {formatDate(invoice.issued_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
        <div>
          <p className="font-bold mb-1">بيانات المريض</p>
          <p>{invoice.patient?.full_name ?? "—"}</p>
          <p>رقم الملف: {invoice.patient?.file_no ?? "—"}</p>
          {invoice.patient?.phone && <p dir="ltr">{invoice.patient.phone}</p>}
        </div>
        <div>
          <p className="font-bold mb-1">الطبيب المعالج</p>
          <p>{invoice.doctorName ?? "—"}</p>
          <p className="mt-2 font-bold mb-1">حالة الفاتورة</p>
          <p>{statusLabel}</p>
          <p className="mt-2 font-bold mb-1">طريقة الدفع</p>
          <p>{PAYMENT_METHOD_LABELS[displayedPaymentMethod] ?? displayedPaymentMethod ?? "—"}</p>
        </div>
      </div>

      <table className="w-full text-sm border-collapse mb-6 invoice-print-table">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="py-2 text-right">الخدمة</th>
            <th className="py-2 text-center">الكمية</th>
            <th className="py-2 text-center">سعر الوحدة</th>
            <th className="py-2 text-center">الخصم</th>
            <th className="py-2 text-left">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id} className="border-b border-gray-300">
              <td className="py-2">{item.serviceName}</td>
              <td className="py-2 text-center">{item.quantity}</td>
              <td className="py-2 text-center">{item.unit_price} ج.م</td>
              <td className="py-2 text-center">{item.discount_amount} ج.م</td>
              <td className="py-2 text-left">{item.line_total} ج.م</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-6">
        <div className="w-64 text-sm space-y-1.5">
          <div className="flex justify-between"><span>المجموع الفرعي</span><span>{invoice.subtotal_amount} ج.م</span></div>
          <div className="flex justify-between"><span>الخصم</span><span>{invoice.discount_amount} ج.م</span></div>
          <div className="flex justify-between font-black text-base border-t-2 border-black pt-1.5"><span>الإجمالي</span><span>{invoice.total_amount} ج.م</span></div>
          <div className="flex justify-between"><span>المدفوع</span><span>{invoice.netPaid} ج.م</span></div>
          <div className="flex justify-between font-bold"><span>المتبقي</span><span>{invoice.balanceDue} ج.م</span></div>
        </div>
      </div>

      {invoice.payments.length > 0 && (
        <div className="mb-6">
          <p className="font-bold mb-2 text-sm">سجل الدفعات</p>
          <table className="w-full text-xs border-collapse invoice-print-table">
            <thead>
              <tr className="border-b border-black">
                <th className="py-1.5 text-right">التاريخ</th>
                <th className="py-1.5 text-center">المبلغ</th>
                <th className="py-1.5 text-center">الطريقة</th>
                <th className="py-1.5 text-left">استلمها</th>
              </tr>
            </thead>
            <tbody>
              {invoice.payments.map((p) => (
                <tr key={p.id} className="border-b border-gray-300">
                  <td className="py-1.5">{formatDate(p.paid_at)}</td>
                  <td className="py-1.5 text-center">{p.amount} ج.م</td>
                  <td className="py-1.5 text-center">{PAYMENT_METHOD_LABELS[p.method] ?? p.method}</td>
                  <td className="py-1.5 text-left">{p.receivedByName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {invoice.notes && (
        <div className="text-sm mb-6">
          <p className="font-bold mb-1">ملاحظات</p>
          <p>{invoice.notes}</p>
        </div>
      )}

      <p className="text-xs text-gray-500 border-t border-gray-300 pt-3">تم إصدار هذه الفاتورة إلكترونياً عبر نظام MedLink OS.</p>
    </div>
  );
}
