import { Play, CheckCircle2, Loader2 } from "lucide-react";
import { PermissionGuard } from "../../guards/PermissionGuard";
import { isInProgressStatus, isCompletedStatus } from "../../helpers/appointmentStatus.helpers";

export function SessionActions({ appointment, canManage, isOwnSession, isStarting, isEnding, onStart, onEnd }) {
  const isCompleted = isCompletedStatus(appointment?.status);
  const isInSession = isInProgressStatus(appointment?.status);
  const canStart = !isCompleted && !isInSession;

  if (!canManage || !isOwnSession) return null;

  return (
    <div className="flex items-center gap-2 shrink-0">
      {canStart && (
        <PermissionGuard permission="sessions:start">
          <button
            type="button"
            onClick={onStart}
            disabled={isStarting}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 text-white font-bold text-sm hover:opacity-90 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isStarting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
            <span>بدء الجلسة</span>
          </button>
        </PermissionGuard>
      )}
      {isInSession && (
        <PermissionGuard permission="sessions:end">
          <button
            type="button"
            onClick={onEnd}
            disabled={isEnding}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-rose-500 text-white font-bold text-sm hover:opacity-90 shadow-lg shadow-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isEnding ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            <span>إنهاء الجلسة</span>
          </button>
        </PermissionGuard>
      )}
    </div>
  );
}
