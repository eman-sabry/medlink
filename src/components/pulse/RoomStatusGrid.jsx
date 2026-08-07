import {
  DoorOpen,
  CheckCircle2,
  UserCheck,
  Sparkles,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { EmptyState } from "../ui/EmptyState";
import { useNavigate } from "react-router-dom";

const STATUS_CONFIG = {
  Available: {
    label: "متاحة",
    accent: "bg-emerald-500",
    container:
      "bg-emerald-500/[0.03] hover:bg-emerald-500/[0.08] border-emerald-500/20",
    badge:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
  },
  Occupied: {
    label: "مشغولة",
    accent: "bg-rose-500",
    container: "bg-rose-500/[0.03] hover:bg-rose-500/[0.08] border-rose-500/20",
    badge: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    icon: UserCheck,
  },
  Cleaning: {
    label: "تحت التنظيف",
    accent: "bg-amber-500",
    container:
      "bg-amber-500/[0.03] hover:bg-amber-500/[0.08] border-amber-500/20",
    badge:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    icon: Sparkles,
  },
  Maintenance: {
    label: "خارج الخدمة",
    accent: "bg-slate-400",
    container:
      "bg-slate-500/[0.03] hover:bg-slate-500/[0.08] border-slate-500/20",
    badge:
      "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
    icon: AlertTriangle,
  },
};

export function RoomStatusGrid({ rooms = [] }) {
  const navigate = useNavigate();
  const displayedRooms = rooms.slice(0, 5);

  return (
    <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between pb-3 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <DoorOpen className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-black text-foreground text-sm">حالة الغرف</h3>
            <p className="text-[11px] text-muted-foreground font-medium">
              متابعة فورية لإشغال الغرف
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/rooms")}
          className="text-xs font-bold text-primary cursor-pointer hover:underline flex items-center gap-1.5 bg-primary/10 hover:bg-primary/15 px-3 py-1.5 rounded-xl transition-all"
        >
          <span>عرض الكل ({rooms.length})</span>
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Grid Content */}
      {rooms.length === 0 ? (
        <EmptyState message="لا توجد غرف مسجّلة" rounded="rounded-2xl" />
      ) : (
        <div className="flex flex-col gap-2.5">
          {displayedRooms.map((room) => {
            const config = STATUS_CONFIG[room.status] || {
              label: room.status,
              accent: "bg-muted-foreground",
              container: "bg-muted/30 border-border",
              badge: "bg-muted text-muted-foreground border-border",
              icon: DoorOpen,
            };

            const StatusIcon = config.icon;

            return (
              <div
                key={room.id}
                className={`group relative border rounded-2xl p-3.5 transition-all duration-200 shadow-2xs hover:shadow-md overflow-hidden flex items-center justify-between gap-4 cursor-pointer ${config.container}`}
              >
                {/* شريط الحالة الجانبي الملون بدقة */}
                <div
                  className={`absolute top-0 right-0 bottom-0 w-1.5 ${config.accent}`}
                />

                {/* Left Side: Room Name & Type */}
                <div className="flex items-center gap-3 pr-3 min-w-0">
                 
                  <div className="min-w-0 space-y-0.5">
                    <h4 className="font-bold text-sm text-foreground truncate tracking-tight">
                      {room.name}
                    </h4>
                    {room.type && (
                      <span className="text-[11px] font-medium text-muted-foreground block truncate">
                        {room.type}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Side: Status Badge & Action Button */}
                <div className="flex items-center gap-3 shrink-0">
                  {room.patientName && (
                    <span
                      className="text-xs font-medium text-muted-foreground hidden sm:inline-block max-w-[130px] truncate"
                      title={room.patientName}
                    >
                      {room.patientName}
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
