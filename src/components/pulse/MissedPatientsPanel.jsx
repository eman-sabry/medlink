import { Phone, MessageSquare, AlertCircle } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";
import { SectionHeader } from "../dashboard/SectionHeader";

export function MissedPatientsPanel({ patients = [], onCall, onMessage }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
      <SectionHeader
        eyebrow="No-Show"
        title="مرضى لم يحضروا اليوم"
        icon={AlertCircle}
      />

      {patients.length === 0 ? (
        <EmptyState
          message="لا توجد حالات تخلف عن الحضور اليوم"
          rounded="rounded-2xl"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {patients.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 rounded-2xl border border-border/80 bg-muted/30 hover:bg-muted/60 transition-all"
            >
              <div className="min-w-0 space-y-1">
                <p className="font-bold text-foreground text-xs truncate">
                  {item.patientName}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  الطبيب: {item.doctorName}
                </p>
                <span className="inline-block px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-black">
                  الموعد: {item.timeLabel}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    onCall ? onCall(item) : window.open(`tel:${item.phone}`)
                  }
                  title="اتصال هاتفي"
                  className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 flex items-center justify-center transition-colors"
                >
                  <Phone className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onMessage
                      ? onMessage(item)
                      : window.open(`https://wa.me/${item.phone}`)
                  }
                  title="إرسال رسالة"
                  className="h-9 w-9 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
