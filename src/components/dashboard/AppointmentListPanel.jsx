import { motion } from "framer-motion";
import { EmptyState } from "../ui/EmptyState";
import { formatDate, formatTime } from "../../utils/date";

export function AppointmentListPanel({
  title,
  icon: Icon,
  appointments = [],
  emptyMessage = "لا توجد مواعيد",
  badgeClassName = "bg-primary/10 text-primary ring-1 ring-primary/15",
}) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className={`p-2.5 rounded-2xl ${badgeClassName}`}>
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="font-black text-foreground text-sm">{title}</h3>
        </div>
        <span className="text-xs font-bold bg-muted px-2.5 py-1 rounded-full text-foreground">
          {appointments.length}
        </span>
      </div>

      {appointments.length === 0 ? (
        <EmptyState message={emptyMessage} rounded="rounded-2xl" />
      ) : (
        <ul className="space-y-2.5 max-h-72 overflow-y-auto">
          {appointments.map((app, index) => (
            <motion.li
              key={app.id}
              initial={{ opacity: 0, x: 8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-muted/40 text-xs hover:bg-muted/60 transition-colors"
            >
              <div className="min-w-0">
                <p className="font-bold text-foreground truncate">
                  {app.patient_name ?? "مريض"}
                </p>
                <p className="text-muted-foreground truncate">{app.doctor_name}</p>
              </div>
              <div className="text-left shrink-0">
                <p className="font-bold text-foreground">{formatTime(app.starts_at)}</p>
                <p className="text-muted-foreground">{formatDate(app.starts_at)}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
