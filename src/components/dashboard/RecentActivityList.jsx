import { motion } from "framer-motion";
import { Activity, Clock } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";
import { formatDate } from "../../utils/date";

export function RecentActivityList({ activities = [] }) {
  return (
    <div className="bg-card border border-border/80 rounded-[2.5rem] p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15 shadow-xs">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-black text-foreground text-sm md:text-base">
              النشاطات الأخيرة
            </h3>
            <p className="text-[11px] font-medium text-muted-foreground">
              أحدث العمليات والتحديثات في النظام
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[11px] font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>مباشر</span>
        </div>
      </div>

      {activities.length === 0 ? (
        <EmptyState message="لا توجد نشاطات مسجّلة بعد" rounded="rounded-2xl" />
      ) : (
        <ul className="space-y-3">
          {activities.map((activity, index) => (
            <motion.li
              key={activity.id || index}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              className="group flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-muted/40 border border-border/50 hover:bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors shrink-0" />
                <span className="font-bold text-foreground text-xs md:text-sm truncate">
                  {activity.label}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-muted-foreground shrink-0 bg-background/80 px-2.5 py-1 rounded-xl border border-border/40 text-[11px] font-semibold">
                <Clock className="h-3 w-3 text-primary/70" />
                <span>{formatDate(activity.timestamp)}</span>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
