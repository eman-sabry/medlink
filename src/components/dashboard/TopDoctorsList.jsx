import { motion } from "framer-motion";
import { Stethoscope, Award, CheckCircle2, Crown, Medal } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";

export function TopDoctorsList({ doctors = [] }) {
  const topDoctors = [...doctors]
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 5);

  const topThree = topDoctors.slice(0, 3);
  const remainingDoctors = topDoctors.slice(3);

  return (
    <div className="bg-card border border-border/80 rounded-[2.5rem] p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/15 shadow-xs">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-black text-foreground text-sm md:text-base">
              أفضل الأطباء أداءً
            </h3>
            <p className="text-[11px] font-medium text-muted-foreground">
              ترتيب الأطباء بناءً على الجلسات المكتملة
            </p>
          </div>
        </div>

        <span className="text-xs font-bold bg-amber-500/10 text-amber-600 px-3.5 py-1.5 rounded-full border border-amber-500/25">
          Top 5
        </span>
      </div>

      {topDoctors.length === 0 ? (
        <EmptyState
          message="لا توجد بيانات جلسات مكتملة بعد"
          rounded="rounded-2xl"
        />
      ) : (
        <div className="space-y-4">
          {topThree[0] && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="relative p-4 rounded-2xl bg-gradient-to-tr from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-500/30 shadow-sm flex items-center justify-between gap-4 overflow-hidden"
            >
              <div className="absolute -left-6 -bottom-6 text-amber-500/10 pointer-events-none">
                <Crown className="h-28 w-28" />
              </div>

              <div className="flex items-center gap-3.5 min-w-0 relative z-10">
                <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-300 text-slate-950 shadow-md shadow-amber-500/40 ring-2 ring-yellow-200 font-black">
                  <Crown className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider block">
                      المركز الأول
                    </span>
                    <span className="font-black text-foreground text-sm md:text-base truncate block">
                      {topThree[0].name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-background/90 px-3.5 py-2 rounded-xl border border-amber-500/30 shrink-0 text-amber-600 text-xs font-black relative z-10 shadow-xs">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                <span>{topThree[0].completed} جلسة</span>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topThree.slice(1).map((doctor, idx) => {
              const actualRank = idx + 2; 
              const isSecond = actualRank === 2;

              return (
                <motion.div
                  key={doctor.name || actualRank}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: (idx + 1) * 0.05 }}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 shadow-xs ${
                    isSecond
                      ? "bg-slate-500/10 border-slate-400/30"
                      : "bg-amber-900/10 border-amber-700/30"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`h-7 w-7 shrink-0 flex items-center justify-center rounded-xl text-xs font-black ${
                        isSecond
                          ? "bg-gradient-to-tr from-slate-400 via-slate-300 to-slate-200 text-slate-950 shadow-sm shadow-slate-400/40 ring-1 ring-slate-100"
                          : "bg-gradient-to-tr from-amber-800 via-amber-700 to-amber-600 text-amber-50 shadow-sm shadow-amber-900/40 ring-1 ring-amber-500/50"
                      }`}
                    >
                      <Medal className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-muted-foreground block">
                        المركز {isSecond ? "الثاني" : "الثالث"}
                      </span>
                      <span className="font-bold text-foreground text-xs md:text-sm truncate block">
                        {doctor.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-background/80 px-2.5 py-1.5 rounded-xl border border-border/50 shrink-0 text-emerald-600 text-xs font-black">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{doctor.completed}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {remainingDoctors.length > 0 && (
            <ul className="space-y-2.5 pt-2 border-t border-border/50">
              {remainingDoctors.map((doctor, index) => {
                const rank = index + 4;
                return (
                  <motion.li
                    key={doctor.name || rank}
                    initial={{ opacity: 0, x: 8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.2, delay: index * 0.04 }}
                    className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-muted/40 border border-border/50 hover:bg-card hover:border-border transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="h-6 w-6 shrink-0 flex items-center justify-center rounded-lg bg-muted text-muted-foreground font-bold text-xs border border-border">
                        {rank}
                      </span>
                      <span className="font-bold text-foreground text-xs truncate">
                        {doctor.name}
                      </span>
                    </div>
                    <span className="text-muted-foreground text-xs font-semibold shrink-0">
                      {doctor.completed} جلسة
                    </span>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
