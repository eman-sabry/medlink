import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function DailySummaryCard({ summary }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-primary/10 via-cyan-500/5 to-transparent" />
      <div className="relative flex items-start gap-3">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-cyan-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-black text-foreground text-sm mb-1.5">الملخص التنفيذي لليوم</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
        </div>
      </div>
    </motion.div>
  );
}
