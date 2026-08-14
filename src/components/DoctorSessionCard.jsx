import { memo } from "react";
import { Play, CheckCircle2, Clock, User, Eye, ArrowLeft, Calendar, Hash, Home, BedDouble, Loader2, Package, Receipt, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { STATUS_FILTER_OPTIONS, isInProgressStatus, isCompletedStatus } from "../helpers/appointmentStatus.helpers";
import { useLiveSessionTimer } from "../hooks/useLiveSessionTimer";
import { formatDurationSeconds } from "../utils/date";
import { computeDelayMinutes, formatDelayMinutes, delayBadgeClass } from "../helpers/sessionTiming.helpers";
import { INVOICE_STATUS_FILTER_OPTIONS } from "../helpers/invoices.helpers";

function SessionBillingBadge({ billing }) {
  if (!billing) return null;

  if (billing.type === "Package") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-primary/10 text-primary border-primary/20">
        <Package className="h-3 w-3" />
        مغطاة بالباقة — {billing.packageName}
      </span>
    );
  }

  if (!billing.invoiceNo) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-amber-500/10 text-amber-600 border-amber-500/30">
        <AlertTriangle className="h-3 w-3" />
        بانتظار الفوترة
      </span>
    );
  }

  const statusConfig = INVOICE_STATUS_FILTER_OPTIONS.find((o) => o.key === billing.paymentStatus);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusConfig?.style ?? ""}`}>
      <Receipt className="h-3 w-3" />
      {billing.invoiceNo} — {statusConfig?.label ?? billing.paymentStatus}
    </span>
  );
}

function formatSessionDate(dateString) {
  if (!dateString) return "—";
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) return dateString;
  return dateObj.toLocaleDateString("ar-EG-u-nu-latn", { weekday: "short", month: "numeric", day: "numeric" });
}

function DoctorSessionCardImpl({
  appointment = {},
  onStart = () => {},
  onComplete = () => {},
  isStarting = false,
  isCompleting = false,
}) {
  const navigate = useNavigate();

  const isInSession = isInProgressStatus(appointment?.status);
  const isCompleted = isCompletedStatus(appointment?.status);
  const statusConfig = STATUS_FILTER_OPTIONS.find((o) => o.key === appointment?.status);

  const liveSeconds = useLiveSessionTimer(appointment?.actual_started_at, isInSession);
  const timerDisplay = isInSession
    ? formatDurationSeconds(liveSeconds)
    : isCompleted && appointment?.durationSeconds != null
      ? formatDurationSeconds(appointment.durationSeconds)
      : "—";

  const delayMinutes = computeDelayMinutes(appointment?.starts_at, appointment?.actual_started_at);
  const showDelay = (isInSession || isCompleted) && appointment?.actual_started_at;

  const sessionId =
    appointment?.activeSession?.id || appointment?.active_session_id || appointment?.session_id || appointment?.id;

  return (
    <div
      dir="rtl"
      className={`group relative bg-card border rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row items-center justify-between gap-4 w-full text-right ${
        isInSession ? "border-cyan-500/40 ring-1 ring-cyan-500/15" : "border-border hover:border-primary/40"
      }`}
    >
      {isInSession && (
        <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-cyan-500 animate-ping md:hidden" />
      )}

      <div className="flex items-center gap-3.5 w-full md:w-3/12">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl font-bold shrink-0 border ${
            isInSession ? "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" : "bg-primary/10 text-primary border-primary/20"
          }`}
        >
          <User className="h-5 w-5" />
        </div>
        <div className="min-w-0 space-y-1">
          <h4 className="font-bold text-sm text-foreground truncate">{appointment?.patient_name || "مريض غير معروف"}</h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-mono">
              <Hash className="h-3 w-3" />
              {appointment?.patient_file_no || "—"}
            </span>
            <span>•</span>
            <span className="truncate text-primary font-medium">{appointment?.service_name || "جلسة علاجية"}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto md:flex-1 justify-start md:px-4 text-xs text-muted-foreground border-y md:border-y-0 md:border-x border-border py-2.5 md:py-0">
        <div className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1 rounded-lg border border-border">
          <Home className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold text-foreground">{appointment?.room_name || "غرفة غير محددة"}</span>
        </div>

        {appointment?.bed_name && (
          <div className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1 rounded-lg border border-border">
            <BedDouble className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-foreground">{appointment.bed_name}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1 rounded-lg border border-border">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium text-foreground">{formatSessionDate(appointment?.created_at || appointment?.appointment_date)}</span>
        </div>

        {statusConfig && (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusConfig.style}`}>
            {isInSession && <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-ping" />}
            {statusConfig.label}
          </span>
        )}

        {isCompleted && (
          <SessionBillingBadge billing={appointment?.billing} />
        )}
      </div>

      <div className="flex items-center justify-between md:justify-end gap-2.5 w-full md:w-auto shrink-0">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
            isInSession ? "bg-cyan-500/10 border-cyan-500/20" : "bg-muted/60 border-border"
          }`}
        >
          <Clock className={`h-3.5 w-3.5 ${isInSession ? "text-cyan-600 animate-pulse" : "text-primary"}`} />
          <span className="font-mono font-bold text-xs text-foreground tracking-wider">{timerDisplay}</span>
        </div>

        {showDelay && (
          <span
            className={`hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold whitespace-nowrap ${delayBadgeClass(delayMinutes)}`}
            title="تأخر بدء الجلسة عن وقت الموعد المجدول"
          >
            {formatDelayMinutes(delayMinutes)}
          </span>
        )}

        <button
          type="button"
          onClick={() => navigate(`/sessions/${sessionId || appointment?.id}`)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground font-medium text-xs transition-colors cursor-pointer border border-border"
          title="تفاصيل الجلسة"
        >
          <Eye className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">التفاصيل</span>
          <ArrowLeft className="h-3 w-3 rotate-180" />
        </button>

        <div className="flex items-center gap-1.5">
          {!isCompleted && !isInSession && (
            <button
              type="button"
              onClick={() => onStart(appointment)}
              disabled={isStarting}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium text-xs hover:bg-emerald-500/20 transition-colors cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStarting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3 fill-current" />}
              <span>بدء</span>
            </button>
          )}

          {isInSession && (
            <button
              type="button"
              onClick={() =>
                onComplete(sessionId, appointment?.id, {
                  status: "Completed",
                  diagnosis: "تم إتمام الفحص الطبي والجلسة العلاجية بنجاح",
                  notes: appointment?.activeSession?.notes || "لا توجد ملاحظات إضافية",
                })
              }
              disabled={isCompleting}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-rose-500 text-white font-medium text-xs hover:bg-rose-600 transition-colors cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              title="إنهاء الجلسة"
            >
              {isCompleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              <span>إنهاء</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const DoctorSessionCard = memo(DoctorSessionCardImpl);
export default DoctorSessionCard;
