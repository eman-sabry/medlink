import { X, Calendar, Stethoscope, FileText, DoorOpen, CheckCircle2 } from "lucide-react";
import { formatDate, formatTime } from "../../../utils/date";

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 text-xs">
      <Icon className="h-4 w-4 text-primary shrink-0" />
      <span className="text-muted-foreground font-bold">{label}:</span>
      <span className="text-foreground font-bold truncate">{value || "—"}</span>
    </div>
  );
}

export function AppointmentDetailModal({ appointment, onClose }) {
  if (!appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-lg font-black text-foreground">تفاصيل الموعد</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          <Row icon={Stethoscope} label="الطبيب" value={appointment.doctor_name} />
          <Row icon={FileText} label="الخدمة" value={appointment.service_name} />
          <Row
            icon={Calendar}
            label="الموعد"
            value={`${formatDate(appointment.starts_at)} — ${formatTime(appointment.starts_at)}`}
          />
          <Row icon={DoorOpen} label="الغرفة" value={appointment.room_name} />
          <Row icon={CheckCircle2} label="الحالة" value={appointment.status} />
          {appointment.notes && <Row icon={FileText} label="ملاحظات" value={appointment.notes} />}
        </div>
      </div>
    </div>
  );
}
