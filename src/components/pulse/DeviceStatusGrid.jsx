import { Cpu, CheckCircle2, PlayCircle, Wrench, AlertOctagon, ArrowLeft } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";
import { useNavigate } from "react-router-dom";
import { StatusBreakdownMeter } from "../dashboard/primitives/StatusBreakdownMeter";

const CATEGORY_CONFIG = {
  Available: {
    label: "متاح",
    accent: "bg-emerald-500",
    container: "bg-emerald-500/[0.03] hover:bg-emerald-500/[0.08] border-emerald-500/20",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
  },
  InUse: {
    label: "قيد الاستخدام",
    accent: "bg-cyan-500",
    container: "bg-cyan-500/[0.03] hover:bg-cyan-500/[0.08] border-cyan-500/20",
    badge: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
    icon: PlayCircle,
  },
  Maintenance: {
    label: "تحت الصيانة",
    accent: "bg-amber-500",
    container: "bg-amber-500/[0.03] hover:bg-amber-500/[0.08] border-amber-500/20",
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    icon: Wrench,
  },
  OutOfService: {
    label: "خارج الخدمة",
    accent: "bg-rose-500",
    container: "bg-rose-500/[0.03] hover:bg-rose-500/[0.08] border-rose-500/20",
    badge: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    icon: AlertOctagon,
  },
};

export function DeviceStatusGrid({ devices = [] }) {
  const navigate = useNavigate();
  const displayedDevices = devices.slice(0, 5);

  const categoryCounts = devices.reduce((acc, d) => {
    acc[d.category] = (acc[d.category] ?? 0) + 1;
    return acc;
  }, {});
  const availabilitySegments = Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => ({
    key,
    label: cfg.label,
    value: categoryCounts[key] ?? 0,
    barClassName: cfg.accent,
    dotClassName: cfg.accent,
  }));

  return (
    <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between pb-3 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-black text-foreground text-sm">حالة الأجهزة</h3>
            <p className="text-[11px] text-muted-foreground font-medium">متابعة فورية لكفاءة الأجهزة الطبية</p>
          </div>
        </div>

        <button
          onClick={() => navigate("/devices")}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5 bg-primary/10 hover:bg-primary/15 px-3 py-1.5 rounded-xl transition-all"
        >
          <span>عرض الكل ({devices.length})</span>
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
      </div>

      {devices.length > 0 && (
        <StatusBreakdownMeter segments={availabilitySegments} totalLabel={`${devices.length} جهاز إجمالاً`} />
      )}

      {/* Grid Content */}
      {devices.length === 0 ? (
        <EmptyState message="لا توجد أجهزة مسجّلة" rounded="rounded-2xl" />
      ) : (
        <div className="flex flex-col gap-2.5">
          {displayedDevices.map((device) => {
            const config = CATEGORY_CONFIG[device.category] || {
              label: device.category,
              accent: "bg-muted-foreground",
              container: "bg-muted/30 border-border",
              badge: "bg-muted text-muted-foreground border-border",
              icon: Cpu,
            };

            const StatusIcon = config.icon;

            return (
              <div
                key={device.id}
                className={`group relative border rounded-2xl p-3.5 transition-all duration-200 shadow-2xs hover:shadow-md overflow-hidden flex items-center justify-between gap-4 cursor-pointer ${config.container}`}
              >
              
                {/* Left Side: Device Name & Model/Type */}
                <div className="flex items-center gap-3 pr-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-background border border-border/60 text-foreground shrink-0 shadow-2xs">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h4 className="font-bold text-sm text-foreground truncate tracking-tight">
                      {device.name}
                    </h4>
                    {device.model && (
                      <span className="text-[11px] font-medium text-muted-foreground block truncate">
                        {device.model}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Side: Status Badge & Action Button */}
                <div className="flex items-center gap-3 shrink-0">
                  {device.location && (
                    <span className="text-xs font-medium text-muted-foreground hidden sm:inline-block max-w-[130px] truncate" title={device.location}>
                      {device.location}
                    </span>
                  )}

                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${config.badge}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                    <span>{config.label}</span>
                  </div>

                
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}