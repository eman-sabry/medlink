import { memo } from "react";
import { BedDouble, Cpu, CheckCircle2, Users } from "lucide-react";
import { RoomStatusBadge } from "./RoomStatusBadge";
import { BedRow } from "./BedRow";
import { RoomActionsMenu } from "./RoomActionsMenu";
import {
  ROOM_OCCUPANCY_LEVEL_META,
  computeRoomOccupancyLevel,
  getRoomBedSummary,
} from "../../helpers/rooms.helpers";

function RoomCardImpl({
  room,
  beds = [],
  devices = [],
  equipment = [],
  canManage = false,
  onAssignPatient,
  onReleaseBed,
  onChangeBedStatus,
  onDeleteBed,
  onChangeRoomStatus,
  onAddBed,
  onManageDevices,
  onEditRoom,
  onDeleteRoom,
}) {
  const occupancyLevel = computeRoomOccupancyLevel(room, beds);
  const roomBorder = (ROOM_OCCUPANCY_LEVEL_META[occupancyLevel] ?? ROOM_OCCUPANCY_LEVEL_META.Available).border;
  const summary = getRoomBedSummary(beds);

  return (
    <div
      className={`relative bg-gradient-to-b from-card to-muted/20 border ${roomBorder} rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 group`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 inline-block mb-2">
            {room.type}
          </span>
          <h3 className="text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
            {room.name}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <RoomStatusBadge status={occupancyLevel} />
          {canManage && (
            <RoomActionsMenu
              room={room}
              onAssign={(r) => onAssignPatient(r, null)}
              onAddBed={onAddBed}
              onManageDevices={onManageDevices}
              onEdit={onEditRoom}
              onDelete={onDeleteRoom}
              onChangeRoomStatus={onChangeRoomStatus}
            />
          )}
        </div>
      </div>

      <div className="space-y-3 bg-muted/40 p-4 rounded-2xl border border-border/50">
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <BedDouble className="h-4 w-4 text-primary" />
            <span>الأسرّة ({summary.total})</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" /> {summary.available}
            </span>
            <span className="flex items-center gap-1 text-rose-600">
              <Users className="h-3.5 w-3.5" /> {summary.occupied}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {beds.length > 0 ? (
            beds.map((bed) => (
              <BedRow
                key={bed.id}
                bed={bed}
                occupant={bed.occupant}
                canManage={canManage}
                onAssign={(b) => onAssignPatient(room, b)}
                onRelease={onReleaseBed}
                onChangeStatus={onChangeBedStatus}
                onDelete={onDeleteBed}
              />
            ))
          ) : (
            <span className="text-xs text-muted-foreground italic">
              لا توجد أسرة مرتبطة بهذه الغرفة
            </span>
          )}
        </div>
      </div>

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
                title={dev.serial_number}
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

      {equipment.length > 0 && (
        <div className="pt-4 border-t border-border/60 text-[11px] text-muted-foreground font-medium">
          {equipment[0].name}
        </div>
      )}
    </div>
  );
}

export const RoomCard = memo(RoomCardImpl);
