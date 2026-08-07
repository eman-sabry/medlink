import { motion } from "framer-motion";
import { Stethoscope } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";

export function DoctorScheduleList({ doctors = [] }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 ring-1 ring-teal-500/15">
          <Stethoscope className="h-4 w-4" />
        </div>
        <h3 className="font-black text-foreground text-sm">جدول الأطباء اليوم</h3>
      </div>

      {doctors.length === 0 ? (
        <EmptyState message="لا يوجد أطباء مسجّلون" rounded="rounded-2xl" />
      ) : (
        <ul className="space-y-2.5">
          {doctors.map((doctor, index) => (
            <motion.li
              key={doctor.id}
              initial={{ opacity: 0, x: 8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-muted/40 text-xs hover:bg-muted/60 transition-colors"
            >
              <span className="font-bold text-foreground truncate">
                {doctor.full_name}
              </span>
              <span className="text-muted-foreground shrink-0">
                {doctor.todaysAppointmentsCount} موعد اليوم
              </span>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
