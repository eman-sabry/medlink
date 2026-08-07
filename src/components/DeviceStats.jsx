import { Cpu, CheckCircle2, Wrench, AlertTriangle } from "lucide-react";

export default function DeviceStats({
  totalCount,
  workingCount,
  maintenanceCount,
  outOfServiceCount,
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-card border border-border p-5 rounded-3xl shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs text-muted-foreground font-bold block">
            إجمالي الأجهزة
          </span>
          <span className="text-2xl font-black text-foreground mt-1 block">
            {totalCount}
          </span>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <Cpu className="h-6 w-6" />
        </div>
      </div>

      <div className="bg-card border border-border p-5 rounded-3xl shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs text-muted-foreground font-bold block">
            تعمل (Operational)
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {workingCount}
          </span>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6" />
        </div>
      </div>

      <div className="bg-card border border-border p-5 rounded-3xl shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs text-muted-foreground font-bold block">
            تحت الصيانة
          </span>
          <span className="text-2xl font-black text-amber-500 mt-1 block">
            {maintenanceCount}
          </span>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <Wrench className="h-6 w-6" />
        </div>
      </div>

      <div className="bg-card border border-border p-5 rounded-3xl shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs text-muted-foreground font-bold block">
            خارج الخدمة
          </span>
          <span className="text-2xl font-black text-red-500 mt-1 block">
            {outOfServiceCount}
          </span>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
