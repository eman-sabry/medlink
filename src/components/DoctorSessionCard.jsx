import { memo } from "react";
import {
  Play,
  Pause,
  CheckCircle2,
  Clock,
  User,
  Eye,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function DoctorSessionCardImpl({
  appointment = {},
  timerState = {},
  formatTimer = () => "٠٠:٠٠",
  onStart = () => {},
  onPause = () => {},
  onComplete = () => {},
}) {
  const navigate = useNavigate();

  if (!appointment) return null;

  const isRunning = timerState?.isActive || false;
  const currentSeconds = timerState?.seconds || 0;

  const sessionId =
    appointment?.activeSession?.id ||
    appointment?.active_session_id ||
    appointment?.session_id ||
    appointment?.id;

  const cleanStatus = appointment?.status?.trim()?.toLowerCase();
  const isCompleted =
    cleanStatus === "completed" ||
    cleanStatus === "منتهي" ||
    cleanStatus === "مكتمل" ||
    cleanStatus === "مكتملة" ||
    appointment?.isCompleted === true;

  // تنسيق التاريخ فقط
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) return dateString;
      return dateObj.toLocaleDateString("ar-EG", {
        weekday: "short",
        month: "numeric",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // 1. تاريخ الموعد (تاريخ إنشاء أو موعد الحجز الأساسي)
  const appointmentDate = formatDate(
    appointment?.created_at || appointment?.appointment_date,
  );

  const getStatusBadge = (status) => {
    const s = status?.trim()?.toLowerCase();
    switch (s) {
      case "in-progress":
      case "insession":
      case "in_progress":
      case "active":
      case "ongoing":
      case "قيد الجلسة":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping"></span>
            قيد الجلسة
          </span>
        );
      case "completed":
      case "منتهي":
      case "مكتمل":
      case "مكتملة":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
            مكتمل
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted/60 text-muted-foreground border border-border">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50"></span>
            {appointment?.status || "مجدول"}
          </span>
        );
    }
  };

  return (
    <div
      className="group relative bg-card border border-border hover:border-primary/40 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row items-center justify-between gap-4 w-full text-right"
      dir="rtl"
    >
      {/* القسم الأيمن: بيانات المريض واسم الخدمة */}
      <div className="flex items-center gap-3.5 w-full md:w-3/12">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold shrink-0 border border-primary/20">
          <User className="h-5 w-5" />
        </div>
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-foreground truncate">
              {appointment?.patient_name || "مريض غير معروف"}
            </h4>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono text-muted-foreground">
              ملف: {appointment?.patient_file_no || "—"}
            </span>
            <span>•</span>
            <span className="truncate text-primary font-medium">
              {appointment?.service_name || "جلسة علاجية"}
            </span>
          </div>
        </div>
      </div>

      {/* القسم الأوسط: الغرفة + التاريخ والبداية والنهاية + الحالة */}
      <div className="flex flex-wrap items-center gap-4 w-full md:w-auto md:flex-1 justify-start md:px-4 text-xs text-muted-foreground border-y md:border-y-0 md:border-x border-border py-2.5 md:py-0">
        {/* الغرفة */}
        <div className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1 rounded-lg border border-border">
          <span className="text-muted-foreground text-[11px]">الغرفة:</span>
          <span className="font-semibold text-foreground">
            {appointment?.room_id || "غير محددة"}
          </span>
        </div>

        {/* تاريخ الموعد ووقتي البداية والنهاية */}
        <div className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1 rounded-lg border border-border">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium text-foreground">{appointmentDate}</span>
        </div>

        {/* شارة الحالة */}
        <div>{getStatusBadge(appointment?.status)}</div>
      </div>

      {/* القسم الأيسر: العداد والتحكم */}
      <div className="flex items-center justify-between md:justify-end gap-2.5 w-full md:w-auto shrink-0">
        {/* العداد الزمني (يحفظ وقت الجلسة ويثبت بعد الانتهاء) */}
        <div className="flex items-center gap-2 bg-muted/60 px-3 py-1.5 rounded-xl border border-border">
          <Clock
            className={`h-3.5 w-3.5 text-primary ${isRunning ? "animate-pulse" : ""}`}
          />
          <span className="font-mono font-bold text-xs text-foreground tracking-wider">
            {formatTimer(currentSeconds)}
          </span>
        </div>

        {/* زر التفاصيل */}
        <button
          type="button"
          onClick={() => {
            const targetId = sessionId || appointment?.id;
            navigate(`/sessions/${targetId}`);
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground font-medium text-xs transition-colors cursor-pointer border border-border"
          title="تفاصيل الجلسة"
        >
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="hidden sm:inline">التفاصيل</span>
          <ArrowLeft className="h-3 w-3 rotate-180" />
        </button>

        {/* أزرار التحكم */}
        <div className="flex items-center gap-1.5">
          {!isCompleted && !isRunning && (
            <button
              type="button"
              onClick={() => onStart(appointment)}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium text-xs hover:bg-emerald-500/20 transition-colors cursor-pointer shadow-2xs active:scale-95"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>بدء</span>
            </button>
          )}

          {!isCompleted && isRunning && (
            <button
              type="button"
              onClick={() => onPause(appointment?.id)}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-amber-500 text-white font-medium text-xs hover:bg-amber-600 transition-colors cursor-pointer shadow-2xs active:scale-95"
            >
              <Pause className="h-3 w-3 fill-current" />
              <span>إيقاف</span>
            </button>
          )}

          {!isCompleted && (
            <button
              type="button"
              onClick={() => {
                onComplete(sessionId, appointment?.id, {
                  status: "Completed",
                  diagnosis: "تم إتمام الفحص الطبي والجلسة العلاجية بنجاح",
                  notes:
                    appointment?.activeSession?.notes ||
                    "لا توجد ملاحظات إضافية",
                });
              }}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-rose-500 text-white font-medium text-xs hover:bg-rose-600 transition-colors cursor-pointer shadow-2xs active:scale-95"
              title="إنهاء الجلسة"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
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
