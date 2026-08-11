import { motion } from "framer-motion";
import { Stethoscope, Calendar } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";

function initialsOf(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

export function DoctorScheduleList({ doctors = [] }) {
  return (
    <div className="bg-card border border-border/80 rounded-[2.5rem] p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-600 ring-1 ring-teal-500/15 shadow-xs">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-black text-foreground text-sm md:text-base">
               الأطباء اليوم
            </h3>
            <p className="text-[11px] font-medium text-muted-foreground">
              متابعة مواعيد الأطباء والمناوبات الحالية
            </p>
          </div>
        </div>

        <span className="text-xs font-bold bg-teal-500/10 text-teal-600 px-3.5 py-1.5 rounded-full border border-teal-500/20 shrink-0">
          إجمالي: {doctors.length}
        </span>
      </div>

      {doctors.length === 0 ? (
        <EmptyState message="لا يوجد أطباء مسجّلون" rounded="rounded-2xl" />
      ) : (
        <div className="flex flex-wrap gap-3">
          {doctors.map((doctor, index) => {
            const appointmentCount = doctor.todaysAppointmentsCount || 0;

            return (
              <motion.div
                key={doctor.id || index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="flex items-center gap-3.5 pr-4 pl-3.5 py-3 rounded-2xl border bg-muted/40 border-border/60 hover:bg-card hover:border-teal-500/40 hover:shadow-md transition-all duration-200"
              >
                <div className="relative shrink-0">
                  <div className="h-10 w-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-600 border border-teal-500/30 flex items-center justify-center font-black text-xs shadow-xs">
                    {initialsOf(doctor.full_name)}
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="font-bold text-foreground text-xs md:text-sm truncate max-w-[140px]">
                    {doctor.full_name}
                  </p>
                  <p className="text-[11px] font-black text-teal-600 dark:text-teal-600 mt-0.5 flex items-center gap-1">
                    <Calendar className="h-3 w-3 shrink-0" />
                    <span>{appointmentCount} موعد اليوم</span>
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
