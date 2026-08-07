import { motion } from "framer-motion";
import { Stethoscope } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";

export function TopDoctorsList({ doctors = [] }) {
  const topDoctors = [...doctors].sort((a, b) => b.completed - a.completed).slice(0, 5);

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/15">
          <Stethoscope className="h-4 w-4" />
        </div>
        <h3 className="font-black text-foreground text-sm">أفضل الأطباء أداءً</h3>
      </div>

      {topDoctors.length === 0 ? (
        <EmptyState message="لا توجد بيانات جلسات مكتملة بعد" rounded="rounded-2xl" />
      ) : (
        <ul className="space-y-2.5">
          {topDoctors.map((doctor, index) => (
            <motion.li
              key={doctor.name}
              initial={{ opacity: 0, x: 8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-muted/40 text-xs hover:bg-muted/60 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="h-6 w-6 shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white font-black shadow-md shadow-amber-500/30">
                  {index + 1}
                </span>
                <span className="font-bold text-foreground truncate">{doctor.name}</span>
              </div>
              <span className="text-muted-foreground shrink-0">
                {doctor.completed} جلسة مكتملة
              </span>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
