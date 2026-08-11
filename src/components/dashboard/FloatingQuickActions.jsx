import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";

export function FloatingQuickActions({ actions = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!actions || actions.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 left-6 z-50 flex flex-col items-start print:hidden"
      dir="rtl"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mb-3.5 flex flex-col gap-2.5 items-start"
          >
            {actions.map((action, index) => {
              const Icon = action.icon;

              const content = (
                <motion.div
                  initial={{ opacity: 0, x: -12, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  transition={{ delay: index * 0.04, duration: 0.2 }}
                  className={`flex items-center gap-3.5 px-5 py-3 rounded-full shadow-xl border backdrop-blur-md text-white transition-all hover:scale-105 cursor-pointer ${
                    action.color === "blue"
                      ? "bg-blue-600/95 border-blue-400/40 shadow-blue-500/20"
                      : action.color === "purple"
                        ? "bg-purple-600/95 border-purple-400/40 shadow-purple-500/20"
                        : action.color === "emerald"
                          ? "bg-emerald-600/95 border-emerald-400/40 shadow-emerald-500/20"
                          : action.color === "amber"
                            ? "bg-amber-600/95 border-amber-400/40 shadow-amber-500/20"
                            : action.color === "rose"
                              ? "bg-rose-600/95 border-rose-400/40 shadow-rose-500/20"
                              : "bg-primary/95 border-primary/40 shadow-primary/20"
                  }`}
                >
                  <span className="text-xs font-black tracking-wide whitespace-nowrap">
                    {action.label}
                  </span>
                  {Icon && (
                    <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  )}
                </motion.div>
              );

              return action.to ? (
                <Link
                  key={action.label}
                  to={action.to}
                  onClick={() => setIsOpen(false)}
                  className="shrink-0"
                >
                  {content}
                </Link>
              ) : (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => {
                    action.onClick?.();
                    setIsOpen(false);
                  }}
                  className="shrink-0 text-right bg-transparent border-none p-0 cursor-pointer"
                >
                  {content}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-15 w-15 h-14 w-14 rounded-full bg-gradient-to-tr from-primary via-purple-600 to-indigo-500 text-white shadow-2xl shadow-primary/50 flex items-center justify-center border-2 border-white/30 cursor-pointer transition-all focus:outline-none"
        aria-label="الإجراءات السريعة"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {isOpen ? <X className="h-7 w-7" /> : <Plus className="h-7 w-7" />}
        </motion.div>
      </motion.button>
    </div>
  );
}
