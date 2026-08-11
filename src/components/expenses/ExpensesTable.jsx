import { Eye, Edit, Archive, ArchiveRestore, CreditCard, Tag, Layers, Printer } from "lucide-react";
import { ReusableTable } from "../ui/ReusableTable";
import { PermissionGuard } from "../../guards/PermissionGuard";
import { EXPENSE_STATUS_FILTER_OPTIONS, PAYMENT_METHOD_LABELS } from "../../helpers/expense.helpers";
import { formatDate } from "../../utils/date";

function StatusBadge({ status }) {
  const config = EXPENSE_STATUS_FILTER_OPTIONS.find((o) => o.key === status);
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

function CategoryBadge({ label }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
      <Tag className="h-3 w-3" />
      {label}
    </span>
  );
}

function SourceBadge({ label }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
      <Layers className="h-3 w-3" />
      {label}
    </span>
  );
}

function PaymentMethodBadge({ method }) {
  if (!method) return <span className="text-muted-foreground text-[11px]">—</span>;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 border border-teal-500/20">
      <CreditCard className="h-3 w-3" />
      {PAYMENT_METHOD_LABELS[method] ?? method}
    </span>
  );
}

export function ExpensesTable({
  expenses,
  onView,
  onEdit,
  onPrint,
  onArchive,
  onRestore,
  isArchivedView = false,
}) {
  const columns = [
    {
      header: "رقم المصروف",
      render: (exp) => <span className="font-black text-primary">{exp.id.slice(0, 8)}</span>,
    },
    {
      header: "الوصف",
      render: (exp) => <p className="font-bold text-foreground truncate max-w-[180px]">{exp.description}</p>,
    },
    {
      header: "التصنيف",
      render: (exp) => <CategoryBadge label={exp.categoryLabel} />,
      className: "hidden sm:table-cell",
    },
    {
      header: "المصدر",
      render: (exp) => (
        <div>
          <SourceBadge label={exp.sourceLabel} />
          {exp.relatedEntityName && (
            <p className="text-muted-foreground text-[10px] mt-1 truncate max-w-[140px]">{exp.relatedEntityName}</p>
          )}
        </div>
      ),
      className: "hidden md:table-cell",
    },
    {
      header: "المبلغ",
      render: (exp) => `${exp.amount} ج.م`,
      className: "font-bold text-rose-600",
    },
    {
      header: "طريقة الدفع",
      render: (exp) => <PaymentMethodBadge method={exp.payment_method} />,
      className: "hidden lg:table-cell",
    },
    {
      header: "التاريخ",
      render: (exp) => formatDate(exp.date),
      className: "text-muted-foreground hidden sm:table-cell",
    },
    { header: "الحالة", render: (exp) => <StatusBadge status={exp.status} /> },
    {
      header: "أنشأ بواسطة",
      render: (exp) => exp.createdByName,
      className: "text-muted-foreground hidden lg:table-cell",
    },
    {
      header: "الإجراءات",
      render: (exp) => (
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => onView(exp)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
            title="عرض التفاصيل"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <PermissionGuard permission="expenses:print">
            <button
              type="button"
              onClick={() => onPrint(exp)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-muted/70 transition-all cursor-pointer"
              title="طباعة المصروف"
            >
              <Printer className="h-3.5 w-3.5" />
            </button>
          </PermissionGuard>
          {!isArchivedView && (
            <PermissionGuard permission="expenses:edit">
              <button
                type="button"
                onClick={() => onEdit(exp)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-orange-500 hover:bg-primary/15 hover:text-primary transition-all cursor-pointer"
                title="تعديل"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
            </PermissionGuard>
          )}
          <PermissionGuard permission="expenses:delete">
            {isArchivedView ? (
              <button
                type="button"
                onClick={() => onRestore(exp)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all cursor-pointer"
                title="استعادة"
              >
                <ArchiveRestore className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onArchive(exp)}
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
      data={expenses}
      rowsPerPage={10}
      emptyMessage={isArchivedView ? "لا توجد مصروفات مؤرشفة" : "لا توجد مصروفات مطابقة"}
    />
  );
}
