import { History, User } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";
import { ACTIVITY_ACTION_LABELS } from "../../helpers/activityLog.helpers";
import { formatDate, formatTime } from "../../utils/date";

export function SessionActivity({ activity }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-3">
      <h3 className="font-black text-foreground text-sm flex items-center gap-2">
        <History className="h-4 w-4 text-primary" />
        نشاط الجلسة
      </h3>

      {activity.length === 0 ? (
        <EmptyState message="لا يوجد نشاط مسجّل لهذه الجلسة بعد" rounded="rounded-2xl" />
      ) : (
        <div className="space-y-2">
          {activity.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-muted/40 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <User className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-foreground truncate">
                    {ACTIVITY_ACTION_LABELS[item.action] ?? item.action}
                  </p>
                  <p className="text-muted-foreground truncate">{item.actorName}</p>
                </div>
              </div>
              <div className="text-left shrink-0 text-muted-foreground">
                <p>{formatDate(item.created_at)}</p>
                <p>{formatTime(item.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
