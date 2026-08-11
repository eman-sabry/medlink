import { EmptyState } from "../../ui/EmptyState";
import { formatDate, formatTime } from "../../../utils/date";

export function PatientActivityTimeline({ events }) {
  if (events.length === 0) {
    return <EmptyState message="لا يوجد نشاط مسجّل لهذا المريض بعد" />;
  }

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
      <ul className="relative">
        {events.map((event, index) => {
          const Icon = event.icon;
          const isLast = index === events.length - 1;
          return (
            <li key={event.id} className={`relative flex gap-3 ${isLast ? "pb-0" : "pb-4"}`}>
              {!isLast && <span className="absolute top-8 bottom-0 right-[15px] w-px bg-border" />}
              <span className="relative z-10 h-8 w-8 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-card">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1 pb-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-foreground">{event.label}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground font-mono">
                    {formatDate(event.date)} · {formatTime(event.date)}
                  </span>
                </div>
                {event.meta && <p className="text-xs text-muted-foreground mt-0.5 truncate">{event.meta}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
