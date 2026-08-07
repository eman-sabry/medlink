import { Stethoscope } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";

const STATUS_STYLES = {
  Available: { label: "متاح", dot: "bg-emerald-500", text: "text-emerald-600" },
  InSession: { label: "في جلسة", dot: "bg-cyan-500 animate-pulse", text: "text-cyan-600" },
};

export function DoctorStatusList({ doctors = [] }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <Stethoscope className="h-4 w-4" />
        </div>
        <h3 className="font-black text-foreground text-sm">حالة الأطباء</h3>
      </div>

      {doctors.length === 0 ? (
        <EmptyState message="لا يوجد أطباء مسجّلون" rounded="rounded-2xl" />
      ) : (
        <ul className="space-y-2">
          {doctors.map((doctor) => {
            const style = STATUS_STYLES[doctor.status] ?? STATUS_STYLES.Available;
            return (
              <li
                key={doctor.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-muted/40 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-bold text-foreground truncate">{doctor.name}</p>
                  {doctor.specialty && (
                    <p className="text-muted-foreground truncate">{doctor.specialty}</p>
                  )}
                </div>
                <span className={`inline-flex items-center gap-1.5 font-bold shrink-0 ${style.text}`}>
                  <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                  {style.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
