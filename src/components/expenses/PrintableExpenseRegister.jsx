import { EXPENSE_STATUS_FILTER_OPTIONS, PAYMENT_METHOD_LABELS } from "../../helpers/expense.helpers";
import { formatDate } from "../../utils/date";

export function PrintableExpenseRegister({ expenses, centerSettings, filtersSummary }) {
  if (!expenses) return null;

  const totalAmount = expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);
  const count = expenses.length;
  const average = count > 0 ? Math.round((totalAmount / count) * 100) / 100 : 0;

  return (
    <div className="hidden print:block text-black text-xs" dir="rtl">
      <div className="flex items-start justify-between border-b-2 border-black pb-4 mb-4">
        <div>
          <h1 className="text-xl font-black">{centerSettings?.name ?? "MedLink"}</h1>
          <h2 className="text-lg font-bold mt-1">سجل المصروفات</h2>
        </div>
        <div className="text-left">
          <p>تاريخ الإصدار: {formatDate(new Date().toISOString())}</p>
          <p>عدد المصروفات: {count}</p>
        </div>
      </div>

      {filtersSummary && <p className="mb-4 text-gray-600">الفلاتر المطبّقة: {filtersSummary}</p>}

      <table className="w-full border-collapse mb-4 invoice-print-table">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="py-1.5 text-right">رقم المصروف</th>
            <th className="py-1.5 text-right">الوصف</th>
            <th className="py-1.5 text-right">التصنيف</th>
            <th className="py-1.5 text-right">المصدر</th>
            <th className="py-1.5 text-center">المبلغ</th>
            <th className="py-1.5 text-center">طريقة الدفع</th>
            <th className="py-1.5 text-center">التاريخ</th>
            <th className="py-1.5 text-center">الحالة</th>
            <th className="py-1.5 text-left">أنشأ بواسطة</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.id} className="border-b border-gray-300">
              <td className="py-1.5 font-bold">{exp.id.slice(0, 8)}</td>
              <td className="py-1.5">{exp.description}</td>
              <td className="py-1.5">{exp.categoryLabel}</td>
              <td className="py-1.5">{exp.sourceLabel}</td>
              <td className="py-1.5 text-center">{exp.amount} ج.م</td>
              <td className="py-1.5 text-center">
                {exp.payment_method ? PAYMENT_METHOD_LABELS[exp.payment_method] ?? exp.payment_method : "—"}
              </td>
              <td className="py-1.5 text-center">{formatDate(exp.date)}</td>
              <td className="py-1.5 text-center">
                {EXPENSE_STATUS_FILTER_OPTIONS.find((o) => o.key === exp.status)?.label ?? exp.status}
              </td>
              <td className="py-1.5 text-left">{exp.createdByName}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64 space-y-1 border-t-2 border-black pt-2">
          <div className="flex justify-between font-bold"><span>عدد المصروفات</span><span>{count}</span></div>
          <div className="flex justify-between font-bold"><span>إجمالي المصروفات</span><span>{totalAmount} ج.م</span></div>
          <div className="flex justify-between"><span>متوسط قيمة المصروف</span><span>{average} ج.م</span></div>
        </div>
      </div>
    </div>
  );
}
