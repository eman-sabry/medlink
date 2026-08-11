import { Wallet, User, Hash } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";
import { PAYMENT_METHOD_LABELS } from "../../utils/billing";
import { formatDate } from "../../utils/date";

export function PaymentHistory({ payments }) {
  if (payments.length === 0) {
    return <EmptyState message="لا توجد دفعات مسجّلة على هذه الفاتورة" rounded="rounded-2xl" />;
  }

  return (
    <ul className="space-y-2">
      {payments.map((p) => (
        <li
          key={p.id}
          className={`p-3.5 rounded-2xl text-xs space-y-1.5 ${
            p.voided_at ? "bg-muted/40 opacity-60" : "bg-emerald-500/5 ring-1 ring-emerald-500/15"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-black text-foreground">
              <Wallet className="h-3.5 w-3.5 text-emerald-600" />
              {p.amount} ج.م
              <span className="text-muted-foreground font-bold">— {PAYMENT_METHOD_LABELS[p.method] ?? p.method}</span>
            </div>
            <span className="text-muted-foreground">{formatDate(p.paid_at)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <User className="h-3 w-3" />
              بواسطة {p.receivedByName}
            </span>
            {p.reference && (
              <span className="inline-flex items-center gap-1">
                <Hash className="h-3 w-3" />
                {p.reference}
              </span>
            )}
            {p.voided_at && <span className="text-destructive font-bold">ملغاة</span>}
          </div>
          {p.notes && <p className="text-foreground">{p.notes}</p>}
        </li>
      ))}
    </ul>
  );
}
