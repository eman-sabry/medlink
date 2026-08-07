import { FileText } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";
import { formatDate } from "../../utils/date";

export function PatientHistoryPanel({ sessions = [] }) {
  const withPrescription = sessions.filter((s) => s.prescription?.diagnosis).slice(0, 6);

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <FileText className="h-4 w-4" />
        </div>
        <h3 className="font-extrabold text-foreground text-sm">
          آخر التشخيصات والروشتات
        </h3>
      </div>

      {withPrescription.length === 0 ? (
        <EmptyState message="لا توجد سجلات تشخيص بعد" rounded="rounded-2xl" />
      ) : (
        <ul className="space-y-2.5">
          {withPrescription.map((session) => (
            <li key={session.id} className="p-3 rounded-2xl bg-muted/40 text-xs space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-foreground truncate">
                  {session.prescription.diagnosis}
                </span>
                <span className="text-muted-foreground shrink-0">
                  {formatDate(session.completed_at ?? session.starts_at)}
                </span>
              </div>
              {session.prescription.notes && (
                <p className="text-muted-foreground truncate">{session.prescription.notes}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
