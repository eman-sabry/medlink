import { BedDouble, UserPlus, LogOut, User, Hash, Clock, MoreVertical, Trash2 } from "lucide-react";
import { Dropdown, DropdownItem, DropdownDivider } from "../ui/Dropdown";
import { BED_STATUS_META, BED_STATUS_OPTIONS } from "../../helpers/rooms.helpers";
import { formatTime } from "../../utils/date";

const MANUAL_BED_OPTIONS = BED_STATUS_OPTIONS.filter((o) => o.value !== "Occupied");

export function BedRow({ bed, occupant, canManage, onAssign, onRelease, onChangeStatus, onDelete }) {
  const meta = BED_STATUS_META[bed.status] ?? BED_STATUS_META.Available;

  return (
    <div className="text-xs p-3 rounded-xl border border-border/60 bg-card shadow-xs space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <BedDouble className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>{bed.label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] border ${meta.badge}`}>
            {meta.label}
          </span>
          {canManage && (
            <Dropdown
              align="left"
              trigger={
                <button
                  type="button"
                  className="h-6 w-6 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground cursor-pointer"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>
              }
            >
              {bed.status === "Available" && (
                <DropdownItem icon={UserPlus} onClick={() => onAssign(bed)}>
                  تعيين مريض
                </DropdownItem>
              )}
              {bed.status === "Occupied" && (
                <DropdownItem icon={LogOut} onClick={() => onRelease(bed.id)}>
                  تحرير السرير
                </DropdownItem>
              )}
              {bed.status !== "Occupied" &&
                MANUAL_BED_OPTIONS.filter((o) => o.value !== bed.status).map((o) => (
                  <DropdownItem key={o.value} onClick={() => onChangeStatus(bed.id, o.value)}>
                    {o.label}
                  </DropdownItem>
                ))}
              {bed.status !== "Occupied" && (
                <>
                  <DropdownDivider />
                  <DropdownItem icon={Trash2} destructive onClick={() => onDelete(bed.id)}>
                    حذف السرير
                  </DropdownItem>
                </>
              )}
            </Dropdown>
          )}
        </div>
      </div>

      {bed.status === "Occupied" && occupant?.patient && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground bg-rose-500/5 border border-rose-500/15 rounded-lg px-2.5 py-2">
          <span className="flex items-center gap-1 font-bold text-rose-700">
            <User className="h-3 w-3" />
            {occupant.patient.full_name}
          </span>
          {occupant.patient.file_no && (
            <span className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              {occupant.patient.file_no}
            </span>
          )}
          {(occupant.session?.actual_started_at || occupant.session?.starts_at) && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              منذ {formatTime(occupant.session.actual_started_at || occupant.session.starts_at)}
              {occupant.expectedEndAt ? ` — حتى ${formatTime(occupant.expectedEndAt)}` : ""}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
