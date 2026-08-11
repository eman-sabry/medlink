import { ROOM_OCCUPANCY_LEVEL_META } from "../../helpers/rooms.helpers";

export function RoomStatusBadge({ status, className = "" }) {
  const meta = ROOM_OCCUPANCY_LEVEL_META[status] ?? ROOM_OCCUPANCY_LEVEL_META.Available;
  return (
    <span
      className={`px-3 py-1 rounded-full font-bold text-[10px] tracking-wide shadow-xs border whitespace-nowrap ${meta.badge} ${className}`}
    >
      ● {meta.label}
    </span>
  );
}
