import { ArrowRight, Stethoscope, Hash, Home, BedDouble, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { STATUS_FILTER_OPTIONS } from "../../helpers/appointmentStatus.helpers";
import { formatDate } from "../../utils/date";

export function SessionHeader({ appointment, doctor, room, bed }) {
  const navigate = useNavigate();
  const statusConfig = STATUS_FILTER_OPTIONS.find((o) => o.key === appointment?.status);

  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground hover:bg-muted/70 transition-all cursor-pointer shrink-0"
        title="العودة"
      >
        <ArrowRight className="h-4.5 w-4.5" />
      </button>
      <div className="min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl md:text-2xl font-black text-foreground">{appointment?.patient_name}</h1>
          {statusConfig && (
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${statusConfig.style}`}>
              {statusConfig.label}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1.5">
          <span className="flex items-center gap-1">
            <Hash className="h-3 w-3" />
            {appointment?.patient_file_no || "—"}
          </span>
          <span className="flex items-center gap-1">
            <Stethoscope className="h-3 w-3" />
            {doctor?.full_name ?? appointment?.doctor_name ?? "—"}
          </span>
          {room && (
            <span className="flex items-center gap-1">
              <Home className="h-3 w-3" />
              {room.name}
            </span>
          )}
          {bed && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3 w-3" />
              {bed.label}
            </span>
          )}
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {formatDate(appointment?.starts_at)}
          </span>
        </div>
      </div>
    </div>
  );
}
