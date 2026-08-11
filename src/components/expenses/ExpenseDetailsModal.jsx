import { Link } from "react-router-dom";
import { X, FileText, Tag, Layers, CreditCard, Calendar, User, ExternalLink, Wrench, Printer } from "lucide-react";
import { EXPENSE_STATUS_FILTER_OPTIONS, PAYMENT_METHOD_LABELS } from "../../helpers/expense.helpers";
import { MAINTENANCE_STATUS_FILTER_OPTIONS } from "../../helpers/statusFilters";
import { PermissionGuard } from "../../guards/PermissionGuard";
import { formatDate } from "../../utils/date";

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="p-3.5 rounded-2xl bg-muted/40 flex items-center gap-2.5 text-xs">
      <Icon className="h-4 w-4 text-primary shrink-0" />
      <div className="min-w-0">
        <p className="font-bold text-foreground truncate">{value ?? "—"}</p>
        <p className="text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function ExpenseDetailsModal({ expense, relatedMaintenance, onClose, onPrint }) {
  if (!expense) return null;

  const statusConfig = EXPENSE_STATUS_FILTER_OPTIONS.find((o) => o.key === expense.status);
  const maintenanceStatusConfig = relatedMaintenance
    ? MAINTENANCE_STATUS_FILTER_OPTIONS.find((o) => o.key === relatedMaintenance.status)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-black text-foreground tracking-wide flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            تفاصيل المصروف
          </h2>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-all cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-2xl font-black text-foreground">{expense.description}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(expense.date)}
              </p>
            </div>
            <div className="text-left">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${statusConfig?.style ?? ""}`}>
                {statusConfig?.label ?? expense.status}
              </span>
              <p className="text-2xl font-black text-rose-600 mt-1.5">{expense.amount} ج.م</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoTile icon={Tag} label="التصنيف" value={expense.categoryLabel} />
            <InfoTile icon={Layers} label="نوع المصدر" value={expense.sourceLabel} />
            <InfoTile icon={CreditCard} label="طريقة الدفع" value={PAYMENT_METHOD_LABELS[expense.payment_method] ?? expense.payment_method} />
            <InfoTile icon={User} label="أنشأ بواسطة" value={expense.createdByName} />
          </div>

          {expense.relatedEntityName && (
            <div className="p-4 rounded-2xl bg-primary/5 ring-1 ring-primary/15 flex items-center justify-between gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">الكيان المرتبط</p>
                <p className="font-bold text-foreground">{expense.relatedEntityName}</p>
                {relatedMaintenance && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                    <Wrench className="h-3 w-3" />
                    حالة الصيانة:
                    <span className={`font-bold px-2 py-0.5 rounded-full border ${maintenanceStatusConfig?.style ?? ""}`}>
                      {maintenanceStatusConfig?.label ?? relatedMaintenance.status}
                    </span>
                  </p>
                )}
              </div>
              {expense.relatedEntityRoute && (
                <Link
                  to={expense.relatedEntityRoute}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-all cursor-pointer shrink-0"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  عرض السجل
                </Link>
              )}
            </div>
          )}

          {expense.notes && (
            <div className="p-3.5 rounded-2xl bg-muted/40 text-xs">
              <p className="text-muted-foreground font-bold mb-1">ملاحظات</p>
              <p className="text-foreground">{expense.notes}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-[11px] text-muted-foreground pt-2 border-t border-border">
            <p>تاريخ الإنشاء: {formatDate(expense.created_at)}</p>
            <p>آخر تحديث: {formatDate(expense.updated_at)}</p>
          </div>

          {onPrint && (
            <div className="flex items-center pt-2">
              <PermissionGuard permission="expenses:print">
                <button
                  type="button"
                  onClick={() => onPrint(expense)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  طباعة المصروف
                </button>
              </PermissionGuard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
