import { PhoneCall } from "lucide-react";
import { EmptyState } from "../../ui/EmptyState";
import { formatDate } from "../../../utils/date";

const STATUS_STYLES = {
  "بحاجة اتصال": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "تم الاتصال": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "أعاد الحجز": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  "لن يعود": "bg-destructive/10 text-destructive border-destructive/20",
};

export function PatientFollowUps({ followUps }) {
  if (followUps.length === 0) {
    return <EmptyState message="لا توجد متابعات مسجّلة لهذا المريض" />;
  }

  return (
    <div className="space-y-3">
      {followUps.map((f) => (
        <div
          key={f.id}
          className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <PhoneCall className="h-4 w-4" />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-xs text-muted-foreground">
                الطبيب: {f.doctorName} — المسؤول: {f.assigneeName}
              </p>
              {f.notes && f.notes !== "—" && (
                <p className="text-sm text-foreground">{f.notes}</p>
              )}
              <p className="text-[11px] text-muted-foreground">
                آخر تحديث: {f.updated_at ? formatDate(f.updated_at) : "—"}
              </p>
            </div>
          </div>
          <span
            className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
              STATUS_STYLES[f.currentStatus] ?? "bg-muted text-muted-foreground border-border"
            }`}
          >
            {f.currentStatus}
          </span>
        </div>
      ))}
    </div>
  );
}
