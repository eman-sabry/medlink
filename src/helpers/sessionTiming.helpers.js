export function computeDelayMinutes(scheduledAt, actualStartedAt) {
  if (!scheduledAt || !actualStartedAt) return null;
  const scheduled = new Date(scheduledAt);
  const actual = new Date(actualStartedAt);
  if (isNaN(scheduled.getTime()) || isNaN(actual.getTime())) return null;
  return Math.round((actual - scheduled) / 60000);
}

export function formatDelayMinutes(minutes) {
  if (minutes == null) return "—";
  if (minutes <= 0) return "في الموعد";
  if (minutes < 60) return `${minutes} د`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} س ${mins} د` : `${hours} س`;
}

export function delayBadgeClass(minutes) {
  if (minutes == null) return "bg-muted text-muted-foreground border-border";
  if (minutes <= 0) return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  if (minutes < 10) return "bg-amber-500/10 text-amber-600 border-amber-500/20";
  return "bg-rose-500/10 text-rose-600 border-rose-500/20";
}
