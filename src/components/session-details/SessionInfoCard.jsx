import { Stethoscope, Layers, BedDouble, CalendarDays, Home } from "lucide-react";
import { CustomSelect } from "../ui/CustomSelect";
import { PermissionGuard } from "../../guards/PermissionGuard";
import { formatDate } from "../../utils/date";

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="p-3.5 rounded-2xl bg-muted/40 flex items-center gap-2.5 text-xs">
      <Icon className="h-4 w-4 text-primary shrink-0" />
      <div className="min-w-0">
        <p className="font-bold text-foreground truncate">{value ?? "—"}</p>
        <p className="text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function SessionInfoCard({ appointment, doctor, service, room, bed, rooms, beds, onAssignRoom, onAssignBed }) {
  const roomOptions = rooms.map((r) => ({ value: r.id, label: r.name }));
  const bedOptions = beds
    .filter((b) => (!room || b.room_id === room.id) && (b.status !== "Occupied" || b.id === bed?.id))
    .map((b) => ({ value: b.id, label: b.label }));

  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
      <h3 className="font-black text-foreground text-sm">معلومات الجلسة</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <InfoTile icon={CalendarDays} label="التاريخ" value={formatDate(appointment?.starts_at)} />
        <InfoTile icon={Stethoscope} label="الطبيب المعالج" value={doctor?.full_name ?? appointment?.doctor_name} />
        <InfoTile icon={Layers} label="الخدمة" value={service?.name ?? appointment?.service_name} />
        <InfoTile icon={Home} label="الغرفة الحالية" value={room?.name} />
        <InfoTile icon={BedDouble} label="السرير الحالي" value={bed?.label} />
      </div>

      <PermissionGuard permission="sessions:edit">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-border">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground">تعيين الغرفة</label>
            <CustomSelect value={room?.id ?? ""} onChange={onAssignRoom} options={roomOptions} placeholder="-- اختر الغرفة --" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
              <BedDouble className="h-3 w-3" />
              تعيين السرير
            </label>
            <CustomSelect value={bed?.id ?? ""} onChange={onAssignBed} options={bedOptions} placeholder="-- اختر السرير --" />
          </div>
        </div>
      </PermissionGuard>
    </div>
  );
}
