import { UserPlus } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";

export function NewPatientsList({ patients = [] }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <UserPlus className="h-4 w-4" />
        </div>
        <h3 className="font-extrabold text-foreground text-sm">مرضى جدد مسجّلون حديثاً</h3>
      </div>

      {patients.length === 0 ? (
        <EmptyState message="لا يوجد مرضى جدد بعد" rounded="rounded-2xl" />
      ) : (
        <ul className="space-y-2.5">
          {patients.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-muted/40 text-xs"
            >
              <span className="font-bold text-foreground truncate">{p.full_name}</span>
              <span className="text-muted-foreground shrink-0">{p.file_no}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
