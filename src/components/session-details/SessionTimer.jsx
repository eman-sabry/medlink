import { Clock, Timer, CalendarClock, PlayCircle, FlagTriangleRight } from "lucide-react";
import { formatTime, formatDurationSeconds } from "../../utils/date";
import { useLiveSessionTimer } from "../../hooks/useLiveSessionTimer";
import { isInProgressStatus, isCompletedStatus } from "../../helpers/appointmentStatus.helpers";
import { computeDelayMinutes, formatDelayMinutes, delayBadgeClass } from "../../helpers/sessionTiming.helpers";

export function SessionTimer({ appointment, treatmentSession, durationSeconds }) {
  const isInSession = isInProgressStatus(appointment?.status);
  const isCompleted = isCompletedStatus(appointment?.status);
  const actualStartedAt = treatmentSession?.actual_started_at || null;
  const actualEndedAt = treatmentSession?.actual_ended_at || null;
  const liveSeconds = useLiveSessionTimer(actualStartedAt, isInSession);
  const delayMinutes = computeDelayMinutes(appointment?.starts_at, actualStartedAt);

  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${isInSession ? "bg-cyan-500/10 text-cyan-600" : "bg-primary/10 text-primary"}`}>
          <Timer className={`h-5 w-5 ${isInSession ? "animate-pulse" : ""}`} />
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground">مدة الجلسة</p>
          <p className="text-2xl font-black text-foreground font-mono tracking-wider">
            {isInSession ? formatDurationSeconds(liveSeconds) : durationSeconds != null ? formatDurationSeconds(durationSeconds) : "—"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <TimingChip icon={CalendarClock} label="الموعد" value={appointment?.starts_at ? formatTime(appointment.starts_at) : "—"} />
        <TimingChip icon={PlayCircle} label="بدأت" value={actualStartedAt ? formatTime(actualStartedAt) : "لم تبدأ بعد"} />
        <span className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-bold ${delayBadgeClass(delayMinutes)}`}>
          <Clock className="h-3.5 w-3.5" />
          {actualStartedAt ? formatDelayMinutes(delayMinutes) : "—"}
        </span>
        {isCompleted && (
          <TimingChip icon={FlagTriangleRight} label="انتهت" value={actualEndedAt ? formatTime(actualEndedAt) : "—"} />
        )}
      </div>
    </div>
  );
}

function TimingChip({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-1.5 bg-muted/50 border border-border px-2.5 py-1.5 rounded-xl">
      <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
      <span className="text-muted-foreground font-medium">{label}:</span>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  );
}
