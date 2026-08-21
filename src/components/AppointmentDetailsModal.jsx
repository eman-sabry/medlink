import {
  X,
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  CheckCircle2,
  DoorOpen,
  BedDouble,
  AlertCircle,
} from "lucide-react";

export function AppointmentDetailsModal({ isOpen, appointment, onClose }) {
  if (!isOpen || !appointment) return null;

  const parseDate = (isoString) => {
    if (!isoString) return null;
    const cleaned = String(isoString).replace(
      /(\d{4}-\d{2}-)0(\d{2}T)/,
      "$1$2",
    );
    const d = new Date(cleaned);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatTime = (isoString) => {
    const date = parseDate(isoString);
    if (!date) return isoString || "-";
    return date.toLocaleTimeString("ar-EG-u-nu-latn", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (isoString) => {
    const date = parseDate(isoString);
    if (!date) return isoString || "-";
    try {
      return date.toLocaleDateString("ar-EG-u-nu-latn", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return date.toLocaleDateString() || "-";
    }
  };

  const patientName = appointment.patient_name || appointment.patient_id || "-";
  const doctorName = appointment.doctor_name || appointment.doctor_id || "-";
  const serviceName = appointment.service_name || appointment.service_id || "-";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-6 text-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-foreground">
                تفاصيل الموعد
              </h3>
              <p className="text-xs text-muted-foreground">
                كود الموعد: #{appointment.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 text-xs font-medium text-muted-foreground">
          <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
            <div className="flex items-center gap-3 text-foreground font-bold text-sm">
              <User className="h-4 w-4 text-primary shrink-0" />
              <span>
                المريض: <strong className="text-primary">{patientName}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Stethoscope className="h-4 w-4 text-primary shrink-0" />
              <span>
                الطبيب:{" "}
                <strong className="text-foreground">{doctorName}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <span>
                نوع الخدمة:{" "}
                <strong className="text-foreground">{serviceName}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span>
                البداية:{" "}
                <strong className="text-foreground">
                  {formatTime(appointment.starts_at)}
                </strong>{" "}
                ({formatDate(appointment.starts_at)})
              </span>
            </div>

            {appointment.ends_at && (
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <span>
                  النهاية:{" "}
                  <strong className="text-foreground">
                    {formatTime(appointment.ends_at)}
                  </strong>{" "}
                  ({formatDate(appointment.ends_at)})
                </span>
              </div>
            )}

            {appointment.room_id && (
              <div className="flex items-center gap-3">
                <DoorOpen className="h-4 w-4 text-primary shrink-0" />
                <span>
                  الغرفة:{" "}
                  <strong className="text-foreground">
                    {appointment.room_id}
                  </strong>
                </span>
              </div>
            )}

            {appointment.bed_id && (
              <div className="flex items-center gap-3">
                <BedDouble className="h-4 w-4 text-primary shrink-0" />
                <span>
                  السرير:{" "}
                  <strong className="text-foreground">
                    {appointment.bed_id}
                  </strong>
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <span>
                الحالة الحالية:{" "}
                <strong className="text-primary">
                  {appointment.status === "Scheduled"
                    ? "مجدول"
                    : appointment.status}
                </strong>
              </span>
            </div>

            {appointment.cancellation_reason && (
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>
                  سبب الإلغاء:{" "}
                  <strong>{appointment.cancellation_reason}</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all cursor-pointer shadow-md"
          >
            حسناً، إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
