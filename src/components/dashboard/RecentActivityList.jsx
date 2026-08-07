import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";
import { formatDate } from "../../utils/date";

export function RecentActivityList({ activities = [] }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <Activity className="h-4 w-4" />
        </div>
        <h3 className="font-black text-foreground text-sm">النشاطات الأخيرة</h3>
      </div>

      {activities.length === 0 ? (
        <EmptyState message="لا توجد نشاطات مسجّلة بعد" rounded="rounded-2xl" />
      ) : (
        <ul className="space-y-2.5">
          {activities.map((activity, index) => (
            <motion.li
              key={activity.id}
              initial={{ opacity: 0, x: 8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-muted/40 text-xs hover:bg-muted/60 transition-colors"
            >
              <span className="font-semibold text-foreground truncate">
                {activity.label}
              </span>
              <span className="text-muted-foreground shrink-0">
                {formatDate(activity.timestamp)}
              </span>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
