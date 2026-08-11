import { Eye, Edit, Wallet, Printer, Archive, ArchiveRestore, CreditCard } from "lucide-react";
import { ReusableTable } from "../ui/ReusableTable";
import { PermissionGuard } from "../../guards/PermissionGuard";
import { INVOICE_STATUS_FILTER_OPTIONS } from "../../helpers/invoices.helpers";
import { PAYMENT_METHOD_LABELS } from "../../utils/billing";
import { formatDate } from "../../utils/date";

function StatusBadge({ status }) {
  const config = INVOICE_STATUS_FILTER_OPTIONS.find((o) => o.key === status);
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
        config?.style ?? "bg-muted text-muted-foreground border-border"
      }`}
    >
      {config?.label ?? status}
    </span>
  );
}

function PaymentMethodBadge({ method }) {
  if (!method) return <span className="text-muted-foreground text-[11px]">—</span>;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
      <CreditCard className="h-3 w-3" />
      {PAYMENT_METHOD_LABELS[method] ?? method}
    </span>
  );
}

export function InvoiceTable({
  invoices,
  onView,
  onEdit,
  onRecordPayment,
  onPrint,
  onArchive,
  onRestore,
  isArchivedView = false,
}) {
  const columns = [
    { header: "رقم الفاتورة", accessor: "invoice_no", className: "font-black text-primary" },
    {
      header: "المريض",
      render: (inv) => (
        <div>
          <p className="font-bold text-foreground truncate">{inv.patientName}</p>
          <p className="text-muted-foreground">{inv.patientFileNo}</p>
        </div>
      ),
    },
    {
      header: "التاريخ",
      render: (inv) => formatDate(inv.issued_at),
      className: "text-muted-foreground hidden md:table-cell",
    },
    {
      header: "الإجمالي",
      render: (inv) => `${inv.total_amount} ج.م`,
      className: "font-bold text-foreground",
    },
    {
      header: "المدفوع",
      render: (inv) => `${inv.netPaid} ج.م`,
      className: "text-emerald-600 font-bold hidden sm:table-cell",
    },
    {
      header: "المتبقي",
      render: (inv) => (
        <span className={inv.balanceDue > 0 ? "text-rose-600 font-bold" : "text-muted-foreground"}>
          {inv.balanceDue} ج.م
        </span>
      ),
      className: "hidden sm:table-cell",
    },
    {
      header: "طريقة الدفع",
      render: (inv) => <PaymentMethodBadge method={inv.payment_method ?? inv.lastPaymentMethod} />,
      className: "hidden lg:table-cell",
    },
    { header: "الحالة", render: (inv) => <StatusBadge status={inv.computedStatus} /> },
    {
      header: "الإجراءات",
      render: (inv) => (
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => onView(inv)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
            title="عرض التفاصيل"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          {!isArchivedView && (
            <PermissionGuard permission="billing:record_payment">
              {inv.balanceDue > 0 && (
                <button
                  type="button"
                  onClick={() => onRecordPayment(inv)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all cursor-pointer"
                  title="تسجيل دفعة"
                >
                  <Wallet className="h-3.5 w-3.5" />
                </button>
              )}
            </PermissionGuard>
          )}
          <PermissionGuard permission="billing:print">
            <button
              type="button"
              onClick={() => onPrint(inv)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-muted/70 transition-all cursor-pointer"
              title="طباعة الفاتورة"
            >
              <Printer className="h-3.5 w-3.5" />
            </button>
          </PermissionGuard>
          {!isArchivedView && (
            <PermissionGuard permission="billing:edit">
              <button
                type="button"
                onClick={() => onEdit(inv)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-orange-500 hover:bg-primary/15 hover:text-primary transition-all cursor-pointer"
                title="تعديل"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
            </PermissionGuard>
          )}
          <PermissionGuard permission="billing:delete">
            {isArchivedView ? (
              <button
                type="button"
                onClick={() => onRestore(inv)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all cursor-pointer"
                title="استعادة"
              >
                <ArchiveRestore className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onArchive(inv)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-red-500 hover:bg-destructive/15 hover:text-destructive transition-all cursor-pointer"
                title="أرشفة"
              >
                <Archive className="h-3.5 w-3.5" />
              </button>
            )}
          </PermissionGuard>
        </div>
      ),
      className: "text-center",
    },
  ];

  return (
    <ReusableTable
      columns={columns}
      data={invoices}
      rowsPerPage={10}
      emptyMessage={isArchivedView ? "لا توجد فواتير مؤرشفة" : "لا توجد فواتير مطابقة"}
    />
  );
}
