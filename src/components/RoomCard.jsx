import { memo } from "react";
import { BedDouble, Cpu, Trash2, ChevronDown } from "lucide-react";

function RoomCardImpl({
  room,
  beds = [],
  devices = [],
  equipment = [],
  onUpdateRoomStatus,
  onUpdateBedStatus,
  onDelete,
}) {
  // تخصيص الألوان والحواف لكل حالة غرفة
  const getRoomStyle = (status) => {
    switch (status) {
      case "Available":
        return {
          label: "متاحة",
          border: "border-emerald-500/40 hover:border-emerald-500",
          badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        };
      case "Occupied":
        return {
          label: "مشغولة",
          border: "border-rose-500/40 hover:border-rose-500",
          badge: "bg-rose-500/10 text-rose-600 border-rose-500/20",
        };
      case "Cleaning":
        return {
          label: "تنظيف",
          border: "bg-amber-500/5 border-amber-500/40 hover:border-amber-500",
          badge: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        };
      default:
        return {
          label: "خارج الخدمة",
          border: "bg-slate-500/5 border-slate-500/40 hover:border-slate-500",
          badge: "bg-slate-500/10 text-slate-600 border-slate-500/20",
        };
    }
  };

  const roomStyle = getRoomStyle(room.status);

  return (
    <div
      className={`relative bg-gradient-to-b from-card to-muted/20 border ${roomStyle.border} rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 group`}
    >
      {/* رأس الكارت (اسم الغرفة وقائمة تغيير حالتها) */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 inline-block mb-2">
            {room.type}
          </span>
          <h3 className="text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
            {room.name}
          </h3>
        </div>

        {/* زر تغيير حالة الغرفة مباشرة */}
        <div className="relative">
          <select
            value={room.status}
            onChange={(e) => onUpdateRoomStatus(room.id, e.target.value)}
            className={`appearance-none px-3 py-1.5 pl-7 rounded-full font-bold text-xs border ${roomStyle.badge} cursor-pointer focus:outline-none transition-all`}
          >
            <option value="Available">● متاحة</option>
            <option value="Occupied">● مشغولة</option>
            <option value="Cleaning">● تنظيف</option>
            <option value="OutOfService">● خارج الخدمة</option>
          </select>
          <ChevronDown className="h-3 w-3 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
        </div>
      </div>

      {/* قسم الأسرة والتحكم في حالة المريض */}
      <div className="space-y-3 bg-muted/40 p-4 rounded-2xl border border-border/50">
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <BedDouble className="h-4 w-4 text-primary" />
            <span>
              الأسرة المتاحة (
              {beds.filter((b) => b.status === "Available").length} من{" "}
              {beds.length})
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {beds.length > 0 ? (
            beds.map((bed) => (
              <div
                key={bed.id}
                className={`text-xs p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                  bed.status === "Available"
                    ? "bg-card text-emerald-600 border-emerald-500/20 shadow-xs"
                    : "bg-rose-500/5 text-rose-600 border-rose-500/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold">{bed.label}</span>
                  {bed.status === "Occupied" && bed.patient_name && (
                    <span className="text-[11px] bg-rose-500/10 px-2 py-0.5 rounded-md font-medium text-rose-700">
                      المريض: {bed.patient_name}
                    </span>
                  )}
                </div>

                {/* تغيير حالة السرير */}
                <select
                  value={bed.status}
                  onChange={(e) => onUpdateBedStatus(bed.id, e.target.value)}
                  className="bg-card border border-border text-foreground text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer focus:outline-none"
                >
                  <option value="Available">متاح</option>
                  <option value="Occupied">مشغول</option>
                </select>
              </div>
            ))
          ) : (
            <span className="text-xs text-muted-foreground italic">
              لا توجد أسرة مرتبطة بهذه الغرفة
            </span>
          )}
        </div>
      </div>

      {/* الأجهزة الطبية المتوفرة في الغرفة */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <Cpu className="h-4 w-4 text-primary" />
          <span>الأجهزة الطبية المتوفرة</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {devices.length > 0 ? (
            devices.map((dev) => (
              <span
                key={dev.id}
                className="text-[11px] font-medium px-3 py-1 rounded-xl bg-card border border-border text-foreground shadow-xs flex items-center gap-1.5"
              >
                <span>{dev.name}</span>
                <span
                  className={`w-2 h-2 rounded-full ${dev.status === "Operational" ? "bg-emerald-500" : "bg-amber-500"}`}
                />
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground italic">
              لا توجد أجهزة مسجلة
            </span>
          )}
        </div>
      </div>

      {/* زر الحذف */}
      <div className="pt-4 border-t border-border/60 flex items-center justify-between">
        <div className="text-[11px] text-muted-foreground font-medium">
          {equipment.length > 0 ? equipment[0].name : "معدات أساسية"}
        </div>
        <button
          type="button"
          onClick={() => onDelete(room.id)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-500/10 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>حذف الغرفة</span>
        </button>
      </div>
    </div>
  );
}

export const RoomCard = memo(RoomCardImpl);
