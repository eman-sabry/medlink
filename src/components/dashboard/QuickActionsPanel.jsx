import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { getDashboardTheme } from "./dashboardTheme";

export function QuickActionsPanel({ title = "إجراءات سريعة", actions = [] }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-4 shadow-sm flex flex-col lg:flex-row items-center  gap-4">
      <div className="flex items-center gap-2.5 shrink-0 px-2">
        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <Zap className="h-4 w-4" />
        </div>
        <span className="font-black text-foreground text-sm">{title}</span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none justify-start lg:justify-end">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const theme = getDashboardTheme(action.color ?? "blue");

          const content = (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-card hover:bg-muted/40 border border-border shadow-xs transition-all text-right whitespace-nowrap h-11"
            >
              <div
                className={`h-7 w-7 rounded-xl flex items-center justify-center shadow-xs ${theme.icon}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-foreground">
                {action.label}
              </span>
            </motion.div>
          );

          return action.to ? (
            <Link
              key={action.label}
              to={action.to}
              className="cursor-pointer shrink-0"
            >
              {content}
            </Link>
          ) : (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="cursor-pointer shrink-0"
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
