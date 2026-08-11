import { useNavigate } from "react-router-dom";
import { Receipt, Eye, Printer, Package, CheckCircle2, AlertTriangle } from "lucide-react";
import { useInvoice } from "../../hooks/useInvoice";
import { PermissionGuard } from "../../guards/PermissionGuard";
import { INVOICE_STATUS_FILTER_OPTIONS } from "../../helpers/invoices.helpers";

export function SessionInvoice({ invoice, coveringPackage, onPrintInvoice }) {
  const navigate = useNavigate();
  const { invoice: enrichedInvoice, isLoading } = useInvoice(invoice?.id);
  const statusConfig = enrichedInvoice
    ? INVOICE_STATUS_FILTER_OPTIONS.find((o) => o.key === enrichedInvoice.computedStatus)
    : null;

  if (coveringPackage) {
    return (
      <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="font-black text-foreground text-sm flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary" />
          الفاتورة والمدفوعات
        </h3>
        <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Package className="h-4 w-4" />
            <span className="font-bold text-sm">نوع الفوترة: مغطاة بالباقة</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-card">
              <p className="text-muted-foreground">الباقة</p>
              <p className="font-black text-foreground truncate" title={coveringPackage.templateName}>
                {coveringPackage.templateName}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-card">
              <p className="text-muted-foreground">المستخدَم</p>
              <p className="font-black text-amber-600">{coveringPackage.sessions_used_cache ?? 0}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-card">
              <p className="text-muted-foreground">المتبقي</p>
              <p className="font-black text-emerald-600">{coveringPackage.remainingSessions}</p>
            </div>
          </div>
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            لا حاجة لفاتورة — هذه الجلسة مغطاة بالباقة، ولا توجد فاتورة أو دفعة جديدة لها
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
      <h3 className="font-black text-foreground text-sm flex items-center gap-2">
        <Receipt className="h-4 w-4 text-primary" />
        الفاتورة والمدفوعات
      </h3>

      {!invoice ? (
        <div className="text-center py-6">
          <p className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            لا توجد فاتورة أو باقة مرتبطة بهذا الموعد — يُحدَّد نوع الفوترة عند حجز الموعد
          </p>
        </div>
      ) : isLoading || !enrichedInvoice ? (
        <p className="text-xs text-muted-foreground text-center py-4">جاري تحميل بيانات الفاتورة...</p>
      ) : (
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-muted-foreground">نوع الفوترة: جلسة فردية</p>
          <div className="flex items-center justify-between">
            <p className="font-bold text-foreground text-sm">{enrichedInvoice.invoice_no}</p>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusConfig?.style ?? ""}`}>
              {statusConfig?.label ?? enrichedInvoice.computedStatus}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-muted/40">
              <p className="text-muted-foreground">الإجمالي</p>
              <p className="font-black text-foreground">{enrichedInvoice.total_amount} ج.م</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10">
              <p className="text-muted-foreground">المدفوع</p>
              <p className="font-black text-emerald-600">{enrichedInvoice.netPaid} ج.م</p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10">
              <p className="text-muted-foreground">المتبقي</p>
              <p className="font-black text-rose-600">{enrichedInvoice.balanceDue} ج.م</p>
            </div>
          </div>
          {enrichedInvoice.payment_method && (
            <p className="text-[11px] text-muted-foreground">
              طريقة الدفع: <span className="font-bold text-foreground">{enrichedInvoice.payment_method}</span>
            </p>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => navigate(`/invoices?invoiceId=${enrichedInvoice.id}`)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs transition-all cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              عرض في صفحة الفواتير
            </button>
            <PermissionGuard permission="billing:print">
              <button
                type="button"
                onClick={() => onPrintInvoice(enrichedInvoice)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-muted text-foreground hover:bg-muted/70 font-bold text-xs transition-all cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                طباعة
              </button>
            </PermissionGuard>
          </div>
        </div>
      )}
    </div>
  );
}
