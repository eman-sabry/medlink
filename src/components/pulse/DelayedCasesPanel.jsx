import { AlarmClockOff } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";

const PRIORITY_STYLES = {
  high: "bg-destructive/10 text-destructive border-destructive/30",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  low: "bg-muted text-muted-foreground border-border",
};

const PRIORITY_LABELS = { high: "عاجل", medium: "متوسط", low: "بسيط" };

export function DelayedCasesPanel({ cases = [] }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/15">
            <AlarmClockOff className="h-4 w-4" />
          </div>
          <h3 className="font-black text-foreground text-sm">الحالات المتأخرة</h3>
        </div>
        {cases.length > 0 && (
          <span className="text-xs font-black bg-destructive/10 text-destructive px-2.5 py-1 rounded-full">
            {cases.length}
          </span>
        )}
      </div>

      {cases.length === 0 ? (
        <EmptyState message="لا توجد مواعيد متأخرة حالياً 👍" rounded="rounded-2xl" />
      ) : (
        <ul className="space-y-2">
          {cases.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-muted/40 text-xs"
            >
              <div className="min-w-0">
                <p className="font-bold text-foreground truncate">{c.patientName}</p>
                <p className="text-muted-foreground truncate">{c.doctorName}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-bold text-foreground">{c.delayMinutes} د</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${PRIORITY_STYLES[c.priority]}`}
                >
                  {PRIORITY_LABELS[c.priority]}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
