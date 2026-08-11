import { MoreVertical, UserPlus, BedDouble, Cpu, Edit, Trash2, Sparkles, Ban, CheckCircle2 } from "lucide-react";
import { Dropdown, DropdownItem, DropdownDivider } from "../ui/Dropdown";

const MANUAL_STATUS_ITEMS = [
  { value: "Cleaning", label: "وضع الغرفة تحت التنظيف", icon: Sparkles },
  { value: "OutOfService", label: "إخراج الغرفة من الخدمة", icon: Ban },
];

export function RoomActionsMenu({
  room,
  onAssign,
  onAddBed,
  onManageDevices,
  onEdit,
  onDelete,
  onChangeRoomStatus,
}) {
  const isManualOverride = room.status === "Cleaning" || room.status === "OutOfService";

  return (
    <Dropdown
      align="left"
      trigger={
        <button
          type="button"
          className="p-2 rounded-xl hover:bg-muted/80 text-muted-foreground transition-all cursor-pointer border border-transparent hover:border-border"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      }
    >
      <DropdownItem icon={UserPlus} onClick={() => onAssign(room)}>
        تعيين مريض لسرير
      </DropdownItem>
      <DropdownItem icon={BedDouble} onClick={() => onAddBed(room)}>
        إضافة سرير
      </DropdownItem>
      <DropdownItem icon={Cpu} onClick={() => onManageDevices(room)}>
        إدارة الأجهزة
      </DropdownItem>
      <DropdownItem icon={Edit} onClick={() => onEdit(room)}>
        تعديل الغرفة
      </DropdownItem>
      <DropdownDivider />
      {isManualOverride ? (
        <DropdownItem icon={CheckCircle2} onClick={() => onChangeRoomStatus(room.id, "Available")}>
          إعادة تفعيل الغرفة
        </DropdownItem>
      ) : (
        MANUAL_STATUS_ITEMS.map((item) => (
          <DropdownItem key={item.value} icon={item.icon} onClick={() => onChangeRoomStatus(room.id, item.value)}>
            {item.label}
          </DropdownItem>
        ))
      )}
      <DropdownDivider />
      <DropdownItem icon={Trash2} destructive onClick={() => onDelete(room.id)}>
        حذف الغرفة
      </DropdownItem>
    </Dropdown>
  );
}
