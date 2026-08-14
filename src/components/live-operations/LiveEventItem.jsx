import { useNavigate } from "react-router-dom";
import {
  Activity,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  DoorOpen,
  Sparkles,
  ChevronLeft,
  Check,
} from "lucide-react";

export function LiveEventItem({ event, onAcknowledge }) {
  const navigate = useNavigate();
  const {
    id,
    type,
    category,
    priority,
    title,
    patientName,
    patientId,
    appointmentId,
    doctorName,
    roomName,
    bedName,
    timerDisplay,
    timeLabel,
    scheduledTime,
    durationMinutes,
    specialty,
    isOccupied,
    activeDoctorName,
    activePatientName,
    isNew,
  } = event;

  const handleCardClick = () => {
    if (onAcknowledge && isNew) {
      onAcknowledge(id);
    }

    // Direct navigation to relevant section based on event
    if (category === "session") {
      navigate("/sessions");
    } else if (category === "waiting" || category === "now" || category === "delayed") {
      if (appointmentId) {
        navigate("/appointments");
      }
    } else if (patientId) {
      navigate(`/patients/${patientId}`);
    } else if (category === "room") {
      navigate("/rooms");
    } else if (category === "doctor") {
      navigate("/team");
    }
  };

  const handleAcknowledgeClick = (e) => {
    e.stopPropagation();
    if (onAcknowledge) {
      onAcknowledge(id);
    }
  };

  // Render Category Specific Details
  const renderDetails = () => {
    switch (type) {
      case "SESSION_ACTIVE":
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground truncate">{patientName}</span>
              <span className="font-medium text-muted-foreground">{doctorName}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5 border-t border-border/20">
              <span className="truncate">{roomName}{bedName ? ` • ${bedName}` : ""}</span>
              <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {timerDisplay}
              </span>
            </div>
          </div>
        );

      case "PATIENT_WAITING":
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground truncate">{patientName}</span>
              <span className="font-medium text-muted-foreground">{doctorName}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5 border-t border-border/20">
              <span>الموعد: {scheduledTime}</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                انتظار: {timerDisplay}
              </span>
            </div>
          </div>
        );

      case "APPOINTMENT_NOW":
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground truncate">{patientName}</span>
              <span className="font-medium text-muted-foreground">{doctorName}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5 border-t border-border/20">
              <span>{roomName || "غرفة الكشف"}</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-md">
                {timeLabel || scheduledTime}
              </span>
            </div>
          </div>
        );

      case "DELAYED":
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground truncate">{patientName}</span>
              <span className="font-medium text-muted-foreground">{doctorName}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5 border-t border-border/20">
              <span>الموعد: {scheduledTime}</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md">
                {timerDisplay}
              </span>
            </div>
          </div>
        );

      case "SESSION_COMPLETED":
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground truncate">{patientName}</span>
              <span className="font-medium text-muted-foreground">{doctorName}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5 border-t border-border/20">
              <span>{roomName || "العيادة"}</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                المدة: {durationMinutes} دقيقة
              </span>
            </div>
          </div>
        );

      case "DOCTOR_AVAILABLE":
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground truncate">{doctorName}</span>
              <span className="text-[11px] text-muted-foreground">{specialty}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5 border-t border-border/20">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                جاهز لاستقبال المريض التالي
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
          </div>
        );

      case "ROOM_STATUS":
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground truncate">{roomName}</span>
              <span className={`text-[11px] font-bold ${isOccupied ? "text-rose-500" : "text-emerald-500"}`}>
                {isOccupied ? "مشغولة حالياً" : "متاحة"}
              </span>
            </div>
            {isOccupied && activePatientName && (
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5 border-t border-border/20">
                <span className="truncate">{activePatientName}</span>
                <span className="truncate">{activeDoctorName}</span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Category Theme Badges
  const getCategoryTheme = () => {
    if (priority === "critical") {
      return {
        bgClass: "bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/40 hover:border-rose-500",
        iconClass: "text-rose-600 dark:text-rose-400 bg-rose-500/15 border-rose-500/30",
        tagClass: "bg-rose-500 text-white",
        Icon: AlertTriangle,
      };
    }
    if (category === "session") {
      return {
        bgClass: "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/40 hover:border-emerald-500",
        iconClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
        tagClass: "bg-emerald-600 text-white",
        Icon: Activity,
      };
    }
    if (category === "waiting") {
      return {
        bgClass: "bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/40 hover:border-amber-500",
        iconClass: "text-amber-600 dark:text-amber-400 bg-amber-500/15 border-amber-500/30",
        tagClass: "bg-amber-600 text-white",
        Icon: Clock,
      };
    }
    if (category === "now") {
      return {
        bgClass: "bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/40 hover:border-blue-500",
        iconClass: "text-blue-600 dark:text-blue-400 bg-blue-500/15 border-blue-500/30",
        tagClass: "bg-blue-600 text-white",
        Icon: Calendar,
      };
    }
    if (category === "completed") {
      return {
        bgClass: "bg-teal-500/10 dark:bg-teal-500/20 border-teal-500/40 hover:border-teal-500",
        iconClass: "text-teal-600 dark:text-teal-400 bg-teal-500/15 border-teal-500/30",
        tagClass: "bg-teal-600 text-white",
        Icon: CheckCircle2,
      };
    }
    if (category === "doctor") {
      return {
        bgClass: "bg-cyan-500/10 dark:bg-cyan-500/20 border-cyan-500/40 hover:border-cyan-500",
        iconClass: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/15 border-cyan-500/30",
        tagClass: "bg-cyan-600 text-white",
        Icon: UserCheck,
      };
    }
    return {
      bgClass: "bg-card hover:bg-card/80 border-border/60 hover:border-border",
      iconClass: "text-primary bg-primary/10 border-primary/20",
      tagClass: "bg-muted text-foreground",
      Icon: DoorOpen,
    };
  };

  const theme = getCategoryTheme();
  const IconComponent = theme.Icon;

  return (
    <div
      onClick={handleCardClick}
      className={`group relative rounded-xl p-2.5 border transition-all duration-200 cursor-pointer text-right shadow-xs ${
        theme.bgClass
      } ${isNew ? "ring-1 ring-primary/40" : ""}`}
      dir="rtl"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${theme.iconClass}`}
          >
            <IconComponent className="h-3.5 w-3.5" />
          </div>
          <span className="text-[11px] font-black tracking-wide text-foreground truncate">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isNew && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-primary text-white text-[9px] font-black animate-pulse shadow-xs">
              <Sparkles className="h-2.5 w-2.5" />
              جديد
            </span>
          )}

          {isNew && (
            <button
              type="button"
              onClick={handleAcknowledgeClick}
              title="تحديد كمقروء"
              className="p-0.5 rounded hover:bg-muted/80 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <Check className="h-3 w-3" />
            </button>
          )}

          <ChevronLeft className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-transform group-hover:-translate-x-0.5" />
        </div>
      </div>

      {/* Body content */}
      {renderDetails()}
    </div>
  );
}
