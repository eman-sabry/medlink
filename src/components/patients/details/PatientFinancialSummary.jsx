import { Receipt, Wallet, Package, Layers, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "../../ui/EmptyState";
import { ActivePackageCard } from "../ActivePackageCard";
import { INVOICE_STATUS_FILTER_OPTIONS } from "../../../helpers/invoices.helpers";
import { formatDate } from "../../../utils/date";

export function PatientFinancialSummary({ invoices, packages, services, outstandingBalance }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground">إجمالي الفواتير</p>
            <p className="text-xl font-black text-foreground mt-1">{invoices.length}</p>
          </div>
          <Receipt className="h-6 w-6 text-primary" />
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground">الرصيد المتبقي</p>
            <p className={`text-xl font-black mt-1 ${outstandingBalance > 0 ? "text-destructive" : "text-emerald-600"}`}>
              {outstandingBalance} ج.م
            </p>
          </div>
          <Wallet className="h-6 w-6 text-primary" />
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground">الباقات العلاجية</p>
            <p className="text-xl font-black text-foreground mt-1">{packages.length}</p>
          </div>
          <Package className="h-6 w-6 text-primary" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-black text-foreground text-sm">الفواتير والمدفوعات</h3>
        {invoices.length === 0 ? (
          <EmptyState message="لا توجد فواتير مسجّلة لهذا المريض" rounded="rounded-2xl" />
        ) : (
          <ul className="space-y-2">
            {invoices.map((inv) => {
              const statusConfig = INVOICE_STATUS_FILTER_OPTIONS.find((o) => o.key === inv.computedStatus);
              return (
              <li
                key={inv.id}
                onClick={() => navigate(`/invoices?invoiceId=${inv.id}`)}
                className="p-4 rounded-2xl bg-muted/40 space-y-2 cursor-pointer hover:bg-muted/70 transition-colors group"
              >
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div>
                      <p className="font-bold text-foreground">{inv.invoice_no}</p>
                      <p className="text-muted-foreground">{formatDate(inv.issued_at)}</p>
                    </div>
                    <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      statusConfig?.style ?? "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {statusConfig?.label ?? inv.computedStatus}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-center">
                  <div className="p-2 rounded-xl bg-card">
                    <p className="text-muted-foreground">الإجمالي</p>
                    <p className="font-bold text-foreground">{inv.total_amount} ج.م</p>
                  </div>
                  <div className="p-2 rounded-xl bg-card">
                    <p className="text-muted-foreground">المدفوع</p>
                    <p className="font-bold text-emerald-600">{inv.netPaid} ج.م</p>
                  </div>
                  <div className="p-2 rounded-xl bg-card">
                    <p className="text-muted-foreground">المتبقي</p>
                    <p className={`font-bold ${inv.balanceDue > 0 ? "text-destructive" : "text-emerald-600"}`}>
                      {inv.balanceDue} ج.م
                    </p>
                  </div>
                </div>
              </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-black text-foreground text-sm">الباقات العلاجية</h3>
        {packages.length === 0 ? (
          <EmptyState message="لا توجد باقات علاجية لهذا المريض" rounded="rounded-2xl" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {packages
              .slice()
              .sort((a, b) => new Date(b.created_at ?? 0) - new Date(a.created_at ?? 0))
              .map((pkg) => (
                <ActivePackageCard key={pkg.id} pkg={pkg} showFinancials />
              ))}
          </div>
        )}
      </div>

      {services.length > 0 && (
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <Layers className="h-4 w-4 text-primary" />
            <h3 className="font-black text-foreground text-sm">الخدمات المستفاد منها</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {services.map((name) => (
              <span key={name} className="text-xs font-bold px-3 py-1.5 rounded-xl bg-muted/60 text-foreground">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
