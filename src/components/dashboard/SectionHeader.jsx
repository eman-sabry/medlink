import { motion } from "framer-motion";
import { getDashboardTheme } from "./dashboardTheme";

export function SectionHeader({ eyebrow, title, icon: Icon, color }) {
  const theme = color ? getDashboardTheme(color) : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-2.5 px-1"
    >
      {Icon && (
        <div
          className={
            theme
              ? `h-8 w-8 rounded-xl flex items-center justify-center shadow-md ${theme.icon}`
              : "p-1.5 rounded-xl bg-primary/10 text-primary"
          }
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      )}
      <div>
        {eyebrow && (
          <span
            className={`text-[10px] font-bold uppercase tracking-widest block ${
              theme ? "text-foreground/60" : "text-primary"
            }`}
          >
            {eyebrow}
          </span>
        )}
        <h2 className="text-sm font-black text-foreground">{title}</h2>
      </div>
    </motion.div>
  );
}
