import { ListOrdered } from "lucide-react";
import { EmptyState } from "../../ui/EmptyState";

const LONG_WAIT_MINUTES = 30;

export function LiveQueueList({
  queue = [],
  title = "طابور الانتظار الحي",
  icon: Icon = ListOrdered,
  emptyMessage = "لا يوجد مرضى في الانتظار حالياً",
}) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/15">
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="font-black text-foreground text-sm">{title}</h3>
        </div>
        {queue.length > 0 && (
          <span className="text-xs font-black bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded-full">
            {queue.length}
          </span>
        )}
      </div>

      {queue.length === 0 ? (
        <EmptyState message={emptyMessage} rounded="rounded-2xl" />
      ) : (
        <ul className="relative">
          {queue.map((item, index) => {
            const isLongWait = item.waitedMinutes > LONG_WAIT_MINUTES;
            const isLast = index === queue.length - 1;
            const progress = Math.min(100, Math.round((item.waitedMinutes / LONG_WAIT_MINUTES) * 100));

            return (
              <li key={item.id} className={`relative flex gap-3 ${isLast ? "pb-0" : "pb-3"}`}>
                {!isLast && (
                  <span className="absolute top-7 bottom-0 right-[13px] w-px bg-border" />
                )}
                <span
                  className={`relative z-10 h-7 w-7 shrink-0 flex items-center justify-center rounded-full text-xs font-black ${
                    isLongWait
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                      : "bg-primary/10 text-primary ring-2 ring-card"
                  }`}
                >
                  {item.queueNumber}
                </span>

                <div
                  className={`min-w-0 flex-1 rounded-2xl p-3 text-xs ${
                    isLongWait ? "bg-rose-500/5 ring-1 ring-rose-500/20" : "bg-blue-500/10 ring-1 ring-blue-500/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-foreground truncate">{item.patientName}</p>
                      <p className="text-muted-foreground truncate">{item.doctorName}</p>
                    </div>
                    <div className="text-left shrink-0">
                      <p className={`font-black ${isLongWait ? "text-rose-600" : "text-foreground"}`}>
                        {item.waitedMinutes} د
                      </p>
                      <p className="text-muted-foreground">~{item.estimatedRemainingMinutes} د متبقية</p>
                    </div>
                  </div>
                  <div className="mt-2 h-1 rounded-full bg-border overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isLongWait ? "bg-rose-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
