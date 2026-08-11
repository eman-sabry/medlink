import { AlarmClockOff } from "lucide-react";
import { AlertStack } from "../dashboard/primitives/AlertStack";

export function DelayedCasesPanel({ cases = [] }) {
  const items = cases.map((c) => ({
    id: c.id,
    title: c.patientName,
    subtitle: c.doctorName,
    severity: c.priority,
    meta: `${c.delayMinutes} د`,
  }));

  return (
    <AlertStack
      items={items}
      title="الحالات المتأخرة"
      icon={AlarmClockOff}
      emptyMessage="لا توجد مواعيد متأخرة حالياً 👍"
    />
  );
}
