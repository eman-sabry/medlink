import { Stethoscope } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";

function initialsOf(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

export function DoctorStatusCompact({ doctors = [] }) {
  return (
    <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <Stethoscope className="h-4 w-4" />
          </div>
          <h3 className="font-black text-foreground text-sm tracking-tight">
            حالة الأطباء
          </h3>
        </div>
        <span className="text-xs font-bold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
          إجمالي: {doctors.length}
        </span>
      </div>

      {doctors.length === 0 ? (
        <EmptyState message="لا يوجد أطباء مسجّلون" rounded="rounded-2xl" />
      ) : (
        <div className="flex flex-wrap gap-2.5">
          {doctors.map((doctor) => {
            const isBusy = doctor.status === "InSession";
            return (
              <div
                key={doctor.id}
                className={`flex items-center gap-3 pr-3.5 pl-3 py-2.5 rounded-2xl border transition-all duration-200 hover:shadow-xs ${
                  isBusy
                    ? "bg-amber-500/5 border-amber-500/25 dark:bg-amber-500/10 dark:border-amber-500/30"
                    : "bg-emerald-500/5 border-emerald-500/20 dark:bg-emerald-500/10 dark:border-emerald-500/25"
                }`}
              >
                <div className="relative shrink-0">
                  <div
                    className={`h-10 w-10 rounded-2xl flex items-center justify-center font-black text-xs shadow-xs ${
                      isBusy
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                        : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    }`}
                  >
                    {initialsOf(doctor.name)}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -left-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-card ${
                      isBusy ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                    }`}
                  />
                </div>

                <div className="min-w-0">
                  <p className="font-bold text-foreground text-xs truncate max-w-[130px]">
                    {doctor.name}
                  </p>
                  <p
                    className={`text-[11px] font-black mt-0.5 ${
                      isBusy
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {isBusy ? "في جلسة حالياً" : "متاح للعمل"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
