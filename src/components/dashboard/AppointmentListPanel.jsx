import { motion } from "framer-motion";
import { User, Stethoscope, Clock, Calendar, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "../ui/EmptyState";
import { formatDate, formatTime } from "../../utils/date";

export function AppointmentListPanel({
  title,
  icon: Icon,
  appointments = [],
  emptyMessage = "لا توجد مواعيد",
  badgeClassName = "bg-primary/10 text-primary ring-1 ring-primary/15",
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-card border border-border/80 rounded-[2.5rem] p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-2xl ${badgeClassName} shadow-xs`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-black text-foreground text-sm md:text-base tracking-tight">
              {title}
            </h3>
            <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
              قائمة المواعيد المسجلة في النظام
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/appointments")}
          className="flex items-center gap-1.5 text-xs font-black bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground px-3.5 py-2 rounded-2xl border border-primary/20 transition-all shadow-xs cursor-pointer shrink-0"
        >
          <span>كل المواعيد</span>
          <ArrowUpRight className="h-3.5 w-3.5 rtl:rotate-90" />
        </button>
      </div>

      {appointments.length === 0 ? (
        <EmptyState message={emptyMessage} rounded="rounded-2xl" />
      ) : (
        <ul className="space-y-3 overflow-y-hidden pl-1.5 custom-scrollbar">
          {appointments.map((app, index) => (
            <motion.li
              key={app.id || index}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              className="group flex items-center justify-between gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50 hover:bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="h-11 w-11 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/30 font-bold text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-2xs">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="font-bold text-foreground text-xs md:text-sm truncate group-hover:text-primary transition-colors">
                    {app.patient_name ?? "مريض غير معروف"}
                  </p>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium truncate">
                    <Stethoscope className="h-3 w-3 text-primary shrink-0" />
                    <span className="truncate">
                      {app.doctor_name || "غير محدد"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-left shrink-0 space-y-1 bg-background/80 px-3.5 py-2 rounded-xl border border-border/40 shadow-2xs">
                <div className="flex items-center justify-end gap-1.5 text-primary text-xs font-black">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatTime(app.starts_at)}</span>
                </div>
                <div className="flex items-center justify-end gap-1.5 text-muted-foreground text-[10px] font-semibold">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(app.starts_at)}</span>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
