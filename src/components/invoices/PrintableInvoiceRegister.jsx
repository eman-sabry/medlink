import { PAYMENT_METHOD_LABELS } from "../../utils/billing";
import { INVOICE_STATUS_FILTER_OPTIONS } from "../../helpers/invoices.helpers";
import { formatDate } from "../../utils/date";

export function PrintableInvoiceRegister({ invoices, centerSettings, filtersSummary }) {
  if (!invoices) return null;

  const totalAmount = invoices.reduce((sum, i) => sum + (i.total_amount ?? 0), 0);
  const totalPaid = invoices.reduce((sum, i) => sum + i.netPaid, 0);
  const totalRemaining = invoices.reduce((sum, i) => sum + i.balanceDue, 0);

  return (
    <div className="hidden print:block text-black text-xs" dir="rtl">
      <div className="flex items-start justify-between border-b-2 border-black pb-4 mb-4">
        <div>
          <h1 className="text-xl font-black">{centerSettings?.name ?? "MedLink"}</h1>
          <h2 className="text-lg font-bold mt-1">سجل الفواتير</h2>
        </div>
        <div className="text-left">
          <p>تاريخ الإصدار: {formatDate(new Date().toISOString())}</p>
          <p>عدد الفواتير: {invoices.length}</p>
        </div>
      </div>

      {filtersSummary && <p className="mb-4 text-gray-600">الفلاتر المطبّقة: {filtersSummary}</p>}

      <table className="w-full border-collapse mb-4 invoice-print-table">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="py-1.5 text-right">رقم الفاتورة</th>
            <th className="py-1.5 text-right">التاريخ</th>
            <th className="py-1.5 text-right">المريض</th>
            <th className="py-1.5 text-center">الإجمالي</th>
            <th className="py-1.5 text-center">المدفوع</th>
            <th className="py-1.5 text-center">المتبقي</th>
            <th className="py-1.5 text-center">الحالة</th>
            <th className="py-1.5 text-left">طريقة الدفع</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-b border-gray-300">
              <td className="py-1.5 font-bold">{inv.invoice_no}</td>
              <td className="py-1.5">{formatDate(inv.issued_at)}</td>
              <td className="py-1.5">{inv.patientName}</td>
              <td className="py-1.5 text-center">{inv.total_amount} ج.م</td>
              <td className="py-1.5 text-center">{inv.netPaid} ج.م</td>
              <td className="py-1.5 text-center">{inv.balanceDue} ج.م</td>
              <td className="py-1.5 text-center">
                {INVOICE_STATUS_FILTER_OPTIONS.find((o) => o.key === inv.computedStatus)?.label ?? inv.computedStatus}
              </td>
              <td className="py-1.5 text-left">
                {(() => {
                  const method = inv.payment_method ?? inv.lastPaymentMethod;
                  return method ? PAYMENT_METHOD_LABELS[method] ?? method : "—";
                })()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64 space-y-1 border-t-2 border-black pt-2">
          <div className="flex justify-between font-bold"><span>إجمالي الفواتير</span><span>{totalAmount} ج.م</span></div>
          <div className="flex justify-between"><span>إجمالي المدفوع</span><span>{totalPaid} ج.م</span></div>
          <div className="flex justify-between font-bold"><span>إجمالي المتبقي</span><span>{totalRemaining} ج.م</span></div>
        </div>
      </div>
    </div>
  );
}
