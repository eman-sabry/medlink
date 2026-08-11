import { Package, CheckCircle2 } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";

export function PackageSummary({ packages, isCompleted, existingUsage }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
      <h3 className="font-black text-foreground text-sm flex items-center gap-2">
        <Package className="h-4 w-4 text-primary" />
        الباقات العلاجية
      </h3>

      {packages.length === 0 ? (
        <EmptyState message="لا توجد باقة نشطة لهذا المريض" rounded="rounded-2xl" />
      ) : (
        <div className="space-y-3">
          {packages.map((pkg) => {
            const usedThisPackage = existingUsage?.patient_package_id === pkg.id;
            return (
              <div key={pkg.id} className="p-4 rounded-2xl bg-muted/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-foreground text-sm">{pkg.templateName}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    نشطة
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="text-muted-foreground">الإجمالي</p>
                    <p className="font-black text-foreground">{pkg.sessions_total}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">المستخدَم</p>
                    <p className="font-black text-amber-600">{pkg.sessions_used_cache ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">المتبقي</p>
                    <p className="font-black text-emerald-600">{pkg.remainingSessions}</p>
                  </div>
                </div>

                {isCompleted && usedThisPackage && (
                  <p className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 pt-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    تم خصم هذه الجلسة من الباقة بالفعل
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
