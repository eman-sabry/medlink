import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { getDashboardTheme } from "./dashboardTheme";

export function QuickActionsPanel({ title = "إجراءات سريعة", actions = [] }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <Zap className="h-4 w-4" />
        </div>
        <h3 className="font-black text-foreground text-sm">{title}</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const theme = getDashboardTheme(action.color ?? "blue");

          const content = (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-muted/30 hover:bg-muted/60 border border-border transition-colors text-center h-full"
            >
              <div
                className={`h-9 w-9 rounded-xl flex items-center justify-center shadow-md ${theme.icon}`}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>
              <span className="text-xs font-bold text-foreground">{action.label}</span>
            </motion.div>
          );

          return action.to ? (
            <Link key={action.label} to={action.to} className="cursor-pointer">
              {content}
            </Link>
          ) : (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="cursor-pointer"
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
