import { ListOrdered } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";

const LONG_WAIT_MINUTES = 30;

export function WaitingQueuePanel({ queue = [] }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/15">
            <ListOrdered className="h-4 w-4" />
          </div>
          <h3 className="font-black text-foreground text-sm">طابور الانتظار الحي</h3>
        </div>
        {queue.length > 0 && (
          <span className="text-xs font-black bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded-full">
            {queue.length}
          </span>
        )}
      </div>

      {queue.length === 0 ? (
        <EmptyState message="لا يوجد مرضى في الانتظار حالياً" rounded="rounded-2xl" />
      ) : (
        <ul className="space-y-2">
          {queue.map((item) => {
            const isLongWait = item.waitedMinutes > LONG_WAIT_MINUTES;
            return (
              <li
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-2xl text-xs ${
                  isLongWait ? "bg-rose-500/5 ring-1 ring-rose-500/20" : "bg-muted/40"
                }`}
              >
                <span className="h-7 w-7 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary font-black">
                  {item.queueNumber}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-foreground truncate">{item.patientName}</p>
                  <p className="text-muted-foreground truncate">{item.doctorName}</p>
                </div>
                <div className="text-left shrink-0">
                  <p className={`font-black ${isLongWait ? "text-rose-600" : "text-foreground"}`}>
                    {item.waitedMinutes} د
                  </p>
                  <p className="text-muted-foreground">~{item.estimatedRemainingMinutes} د متبقية</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
