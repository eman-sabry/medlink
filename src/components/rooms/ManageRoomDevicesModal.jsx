import { useMemo, useState } from "react";
import { X, Cpu, ArrowRightLeft, Trash2 } from "lucide-react";
import { CustomSelect } from "../ui/CustomSelect";
import { useMedicalDevices } from "../../hooks/useMedicalDevices";
import { useRooms } from "../../hooks/useRooms";

const DEVICE_STATUS_META = {
  Operational: { label: "تعمل", badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  Maintenance: { label: "صيانة", badge: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  "Out-Of-Service": { label: "خارج الخدمة", badge: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
};

export function ManageRoomDevicesModal({ isOpen, room, roomDevices = [], onClose }) {
  const { devices, handleAssignRoom, isAssigningRoom } = useMedicalDevices();
  const { rooms } = useRooms();
  const [selectedDeviceId, setSelectedDeviceId] = useState("");

  const roomsById = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);

  const availableToAssign = useMemo(
    () =>
      devices
        .filter((d) => d.room_id !== room?.id)
        .map((d) => ({
          value: d.id,
          label: d.room_id
            ? `${d.name} — حالياً في ${roomsById.get(d.room_id)?.name ?? "غرفة أخرى"}`
            : `${d.name} — غير معيّن لغرفة`,
        })),
    [devices, room, roomsById],
  );

  if (!isOpen || !room) return null;

  const handleAssign = async () => {
    if (!selectedDeviceId || isAssigningRoom) return;
    await handleAssignRoom(selectedDeviceId, room.id);
    setSelectedDeviceId("");
  };

  const handleRemove = (deviceId) => {
    if (isAssigningRoom) return;
    handleAssignRoom(deviceId, null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-black text-foreground tracking-wide flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              إدارة أجهزة الغرفة
            </h2>
            <p className="text-xs text-muted-foreground mt-1">غرفة {room.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground">الأجهزة الحالية</label>
          {roomDevices.length > 0 ? (
            <div className="flex flex-col gap-2">
              {roomDevices.map((dev) => {
                const meta = DEVICE_STATUS_META[dev.status] ?? DEVICE_STATUS_META.Operational;
                return (
                  <div
                    key={dev.id}
                    className="flex items-center justify-between gap-2 p-3 rounded-2xl border border-border bg-muted/30 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-foreground truncate">{dev.name}</p>
                      <p className="text-[11px] text-muted-foreground">{dev.serial_number}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] border ${meta.badge}`}>
                        {meta.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemove(dev.id)}
                        disabled={isAssigningRoom}
                        title="إزالة من الغرفة"
                        className="h-7 w-7 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">لا توجد أجهزة في هذه الغرفة حالياً</p>
          )}
        </div>

        <div className="space-y-2 pt-4 border-t border-border">
          <label className="text-xs font-bold text-muted-foreground">تعيين جهاز موجود لهذه الغرفة</label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <CustomSelect
                value={selectedDeviceId}
                onChange={setSelectedDeviceId}
                options={availableToAssign}
                placeholder="اختر جهازاً..."
              />
            </div>
            <button
              type="button"
              onClick={handleAssign}
              disabled={!selectedDeviceId || isAssigningRoom}
              className="h-12 px-4 rounded-2xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              نقل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
