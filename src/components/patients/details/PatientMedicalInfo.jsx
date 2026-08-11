import { HeartPulse, StickyNote, CalendarClock } from "lucide-react";
import { EmptyState } from "../../ui/EmptyState";
import { formatDate } from "../../../utils/date";

const SEVERITY_STYLES = {
  Normal: "bg-muted text-muted-foreground border-border",
  Important: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Critical: "bg-destructive/10 text-destructive border-destructive/20",
};

function Section({ icon: Icon, title, count, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h4 className="font-black text-foreground text-sm">{title}</h4>
        {count > 0 && (
          <span className="text-[11px] font-bold bg-muted px-2 py-0.5 rounded-full text-foreground">
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export function PatientMedicalInfo({ medicalHistory, internalNotes, reassessments }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
      <Section icon={HeartPulse} title="التاريخ المرضي" count={medicalHistory.length}>
        {medicalHistory.length === 0 ? (
          <EmptyState message="لا يوجد تاريخ مرضي مسجّل لهذا المريض" rounded="rounded-2xl" />
        ) : (
          <ul className="space-y-2">
            {medicalHistory.map((m) => (
              <li key={m.id} className="p-3.5 rounded-2xl bg-muted/40 text-xs text-foreground leading-relaxed">
                {m.description}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section icon={StickyNote} title="الملاحظات الداخلية" count={internalNotes.length}>
        {internalNotes.length === 0 ? (
          <EmptyState message="لا توجد ملاحظات داخلية بعد" rounded="rounded-2xl" />
        ) : (
          <ul className="space-y-2">
            {internalNotes.map((n) => (
              <li
                key={n.id}
                className="flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-muted/40 text-xs"
              >
                <div className="min-w-0 space-y-1">
                  {n.content && <p className="text-foreground leading-relaxed">{n.content}</p>}
                  <p className="text-muted-foreground">بواسطة {n.authorName}</p>
                </div>
                <span
                  className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    SEVERITY_STYLES[n.severity] ?? SEVERITY_STYLES.Normal
                  }`}
                >
                  {n.severity}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section icon={CalendarClock} title="إعادات التقييم القادمة" count={reassessments.length}>
        {reassessments.length === 0 ? (
          <EmptyState message="لا توجد إعادات تقييم مجدولة" rounded="rounded-2xl" />
        ) : (
          <ul className="space-y-2">
            {reassessments.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-500/5 ring-1 ring-amber-500/15 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-bold text-foreground">{r.doctorName}</p>
                  <p className="text-muted-foreground">مستحقة بتاريخ {formatDate(r.due_at)}</p>
                </div>
                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
