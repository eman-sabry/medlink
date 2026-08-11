import { Package, CalendarDays, CalendarX, Wallet, Receipt, Banknote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PACKAGE_STATUS_META, PACKAGE_PAYMENT_STATUS_LABELS } from "../../helpers/patientPackages.helpers";
import { PAYMENT_METHOD_LABELS } from "../../utils/billing";
import { formatDate } from "../../utils/date";

export function ActivePackageCard({ pkg, showFinancials = false }) {
  const navigate = useNavigate();
  if (!pkg) return null;
  const meta = PACKAGE_STATUS_META[pkg.computedStatus] ?? PACKAGE_STATUS_META.Active;
  const total = pkg.sessions_total ?? 0;
  const used = pkg.sessions_used_cache ?? 0;
  const remaining = pkg.remainingSessions ?? Math.max(0, total - used);
  const progressPercent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Package className="h-4.5 w-4.5" />
          </div>
          <p className="font-bold text-foreground text-sm truncate">{pkg.templateName}</p>
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold border ${meta.badge}`}>
          {meta.label}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
          <span>{total} جلسة</span>
          <span>
            {used} مستخدمة · <span className="text-emerald-600">{remaining} متبقية</span>
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {showFinancials && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-[11px]">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>البداية: {pkg.start_date ? formatDate(pkg.start_date) : "—"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarX className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>الانتهاء: {pkg.end_date ? formatDate(pkg.end_date) : "بلا انتهاء"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
            <Wallet className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>الدفع: {PACKAGE_PAYMENT_STATUS_LABELS[pkg.payment_status] ?? pkg.payment_status ?? "—"}</span>
            <span className="mx-1">•</span>
            <span className="font-bold text-foreground">{pkg.price_snapshot} ج.م</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Banknote className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>مدفوع: <span className="font-bold text-emerald-600">{pkg.paidAmount ?? 0} ج.م</span></span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Banknote className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>
              متبقي:{" "}
              <span className={`font-bold ${(pkg.remainingAmount ?? 0) > 0 ? "text-destructive" : "text-emerald-600"}`}>
                {pkg.remainingAmount ?? 0} ج.م
              </span>
            </span>
          </div>
          {pkg.paymentMethod && (
            <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
              <Wallet className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>طريقة الدفع: <span className="font-bold text-foreground">{PAYMENT_METHOD_LABELS[pkg.paymentMethod] ?? pkg.paymentMethod}</span></span>
            </div>
          )}
          {pkg.invoice_id && (
            <button
              type="button"
              onClick={() => navigate(`/invoices?invoiceId=${pkg.invoice_id}`)}
              className="col-span-2 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-bold transition-all cursor-pointer"
            >
              <Receipt className="h-3.5 w-3.5" />
              عرض الفاتورة
            </button>
          )}
        </div>
      )}
    </div>
  );
}
