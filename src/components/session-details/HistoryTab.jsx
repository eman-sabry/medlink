import { History } from "lucide-react";
import { PatientSessionHistory } from "../patients/details/PatientSessionHistory";
import { SessionActivity } from "./SessionActivity";
import { EmptyState } from "../ui/EmptyState";

export function HistoryTab({ previousSessions, sessionActivity }) {
  return (
    <div className="space-y-5">
      <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-3">
        <h3 className="font-black text-foreground text-sm flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          جلسات سابقة لهذا المريض
        </h3>
        {previousSessions.length > 0 ? (
          <PatientSessionHistory sessions={previousSessions} />
        ) : (
          <EmptyState message="لا توجد جلسات سابقة لهذا المريض" rounded="rounded-2xl" />
        )}
      </div>

      <SessionActivity activity={sessionActivity} />
    </div>
  );
}
