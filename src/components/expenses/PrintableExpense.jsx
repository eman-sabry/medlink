import { EXPENSE_STATUS_FILTER_OPTIONS, PAYMENT_METHOD_LABELS } from "../../helpers/expense.helpers";
import { MAINTENANCE_STATUS_FILTER_OPTIONS } from "../../helpers/statusFilters";
import { formatDate } from "../../utils/date";

export function PrintableExpense({ expense, relatedMaintenance, centerSettings }) {
  if (!expense) return null;

  const statusLabel = EXPENSE_STATUS_FILTER_OPTIONS.find((o) => o.key === expense.status)?.label ?? expense.status;
  const maintenanceStatusLabel = relatedMaintenance
    ? MAINTENANCE_STATUS_FILTER_OPTIONS.find((o) => o.key === relatedMaintenance.status)?.label ?? relatedMaintenance.status
    : null;

  return (
    <div className="hidden print:block text-black" dir="rtl">
      <div className="flex items-start justify-between border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-black">{centerSettings?.name ?? "MedLink"}</h1>
          {centerSettings?.address && <p className="text-sm mt-1">{centerSettings.address}</p>}
          {centerSettings?.phone && <p className="text-sm" dir="ltr">{centerSettings.phone}</p>}
        </div>
        <div className="text-left">
          <h2 className="text-xl font-black">إيصال مصروف</h2>
          <p className="text-sm mt-1">رقم المصروف: {expense.id}</p>
          <p className="text-sm">التاريخ: {formatDate(expense.date)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
        <div>
          <p className="font-bold mb-1">الوصف</p>
          <p>{expense.description}</p>
          <p className="mt-2 font-bold mb-1">التصنيف</p>
          <p>{expense.categoryLabel}</p>
          <p className="mt-2 font-bold mb-1">نوع المصدر</p>
          <p>{expense.sourceLabel}</p>
          {expense.relatedEntityName && (
            <>
              <p className="mt-2 font-bold mb-1">الكيان المرتبط</p>
              <p>{expense.relatedEntityName}</p>
            </>
          )}
          {relatedMaintenance && (
            <>
              <p className="mt-2 font-bold mb-1">حالة الصيانة</p>
              <p>{maintenanceStatusLabel}</p>
            </>
          )}
        </div>
        <div>
          <p className="font-bold mb-1">حالة المصروف</p>
          <p>{statusLabel}</p>
          <p className="mt-2 font-bold mb-1">طريقة الدفع</p>
          <p>{PAYMENT_METHOD_LABELS[expense.payment_method] ?? expense.payment_method ?? "—"}</p>
          <p className="mt-2 font-bold mb-1">أنشأ بواسطة</p>
          <p>{expense.createdByName}</p>
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <div className="w-64 text-sm space-y-1.5">
          <div className="flex justify-between font-black text-base border-t-2 border-black pt-1.5">
            <span>المبلغ</span>
            <span>{expense.amount} ج.م</span>
          </div>
        </div>
      </div>

      {expense.notes && (
        <div className="text-sm mb-6">
          <p className="font-bold mb-1">ملاحظات</p>
          <p>{expense.notes}</p>
        </div>
      )}

      <div className="text-xs text-gray-600 grid grid-cols-2 gap-3 border-t border-gray-300 pt-3 mb-3">
        <p>تاريخ الإنشاء: {formatDate(expense.created_at)}</p>
        <p>آخر تحديث: {formatDate(expense.updated_at)}</p>
      </div>

      <p className="text-xs text-gray-500 border-t border-gray-300 pt-3">تم إصدار هذا الإيصال إلكترونياً عبر نظام MedLink OS.</p>
    </div>
  );
}
