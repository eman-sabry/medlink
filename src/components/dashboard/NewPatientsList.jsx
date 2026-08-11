import { motion } from "framer-motion";
import { UserPlus, ChevronLeft, FileText, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "../ui/EmptyState";

export function NewPatientsList({ patients = [] }) {
  const navigate = useNavigate();

  return (
    <div className="bg-card border border-border/80 rounded-[2.5rem] p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15 shadow-xs">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-black text-foreground text-sm md:text-base">
              مرضى جدد مسجّلون حديثاً
            </h3>
            <p className="text-[11px] font-medium text-muted-foreground">
              آخر المرضى المنضمين للنظام
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/patients")}
          className="flex items-center gap-1.5 text-xs font-black bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground px-3.5 py-2 rounded-2xl border border-primary/20 transition-all shadow-xs cursor-pointer shrink-0"
        >
          <span>كل المرضى</span>
          <ArrowUpRight className="h-3.5 w-3.5 rtl:rotate-90" />
        </button>
      </div>

      {patients.length === 0 ? (
        <EmptyState message="لا يوجد مرضى جدد بعد" rounded="rounded-2xl" />
      ) : (
        <ul className="space-y-3">
          {patients.map((p, index) => (
            <motion.li
              key={p.id || index}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
            >
              <div
                onClick={() => navigate(`/patients/${p.id}`)}
                className="group flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-muted/40 border border-border/50 hover:bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/15 font-black text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-xs">
                    {p.full_name?.charAt(0) || "P"}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <span className="font-bold text-foreground text-xs md:text-sm truncate block group-hover:text-primary transition-colors">
                      {p.full_name}
                    </span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <FileText className="h-3 w-3 text-primary/70 shrink-0" />
                      ملف رقم: {p.file_no}
                    </span>
                  </div>
                </div>

                <div className="h-8 w-8 rounded-xl bg-background/80 border border-border/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all shrink-0 shadow-xs">
                  <ChevronLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
