// src/components/AppointmentCard.jsx
import { memo } from "react";
import {
  Clock,
  Calendar,
  UserCheck,
  Activity,
  CheckCircle2,
  UserX,
  Edit,
  Eye,
  XCircle,
} from "lucide-react";
import { PermissionGuard } from "../guards/PermissionGuard";

export const AppointmentCard = memo(function AppointmentCard({
  app,
  onUpdateStatus,
  onEdit,
  onDelete,
  onViewDetails,
  formatDate,
  formatTime,
}) {
  const isCompleted = app.status === "Completed";

 const getStatusBadge = (status) => {
   switch (status) {
     case "Completed":
       return (
         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
           <CheckCircle2 className="h-3.5 w-3.5" />
           مكتمل
         </span>
       );
     case "InSession":
       return (
         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
           <Activity className="h-3.5 w-3.5" />
           قيد الجلسة
         </span>
       );
     case "Arrived":
       return (
         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
           <UserCheck className="h-3.5 w-3.5" />
           تم تسجيل الوصول
         </span>
       );
     case "Waiting":
       return (
         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
           <Clock className="h-3.5 w-3.5" />
           في الانتظار
         </span>
       );
     case "NoShow":
       return (
         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
           <UserX className="h-3.5 w-3.5" />
           لم يحضر
         </span>
       );
     case "Scheduled":
       return (
         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
           <Calendar className="h-3.5 w-3.5" />
           مجدول
         </span>
       );
     case "Cancelled":
       return (
         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20">
           <XCircle className="h-3.5 w-3.5" />
           ملغي
         </span>
       );
     default:
       return (
         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
           <Clock className="h-3.5 w-3.5" />
           مجدول
         </span>
       );
   }
 };
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col gap-4 group">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="flex flex-col items-center justify-center bg-primary/10 text-primary px-4 py-3 rounded-2xl shrink-0 min-w-[95px] border border-primary/15">
            <Clock className="h-4 w-4 mb-1" />
            <span className="text-xs font-black">
              {formatTime(app.starts_at)}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="font-extrabold text-foreground text-sm sm:text-base">
                {app.patient_name || app.patient_id || "مريض بدون اسم"}
              </h3>
              {getStatusBadge(app.status)}
            </div>
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-2 flex-wrap">
              <span className="text-primary font-bold bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">
                {app.service_name || app.service_id || "جلسة علاج"}
              </span>
              <span className="text-border">•</span>
              <span>
                {app.doctor_name || app.doctor_id || "الطبيب المعالج"}
              </span>
              <span className="text-border">•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(app.created_at)}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Actions bar */}
      <div className="flex items-center gap-2 flex-wrap pt-3.5 border-t border-border/60">
        <button
          type="button"
          disabled={isCompleted}
          onClick={() => onUpdateStatus(app, "Arrived")}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            isCompleted
              ? "bg-muted/40 text-muted-foreground/30 cursor-not-allowed"
              : "bg-blue-500/10 text-blue-600 hover:bg-blue-500/25 cursor-pointer"
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" />
          <span>وصول</span>
        </button>

        <button
          type="button"
          disabled={isCompleted}
          onClick={() => onUpdateStatus(app, "InSession")}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            isCompleted
              ? "bg-muted/40 text-muted-foreground/30 cursor-not-allowed"
              : "bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/25 cursor-pointer"
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>قيد الجلسة</span>
        </button>

        <button
          type="button"
          disabled={isCompleted}
          onClick={() => onUpdateStatus(app, "Completed")}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            isCompleted
              ? "bg-emerald-500/15 text-emerald-700 cursor-default"
              : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/25 cursor-pointer"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{isCompleted ? "مكتمل" : "إكمال"}</span>
        </button>

        <button
          type="button"
          disabled={isCompleted}
          onClick={() => onUpdateStatus(app, "NoShow")}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            isCompleted
              ? "bg-muted/40 text-muted-foreground/30 cursor-not-allowed"
              : "bg-rose-500/10 text-rose-600 hover:bg-rose-500/25 cursor-pointer"
          }`}
        >
          <UserX className="h-3.5 w-3.5" />
          <span>لم يحضر</span>
        </button>

        <PermissionGuard permission="appointments:edit">
          <button
            type="button"
            disabled={isCompleted}
            onClick={() => onEdit(app)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              isCompleted
                ? "bg-muted/40 text-muted-foreground/30 cursor-not-allowed"
                : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/25 cursor-pointer"
            }`}
          >
            <Edit className="h-3.5 w-3.5" />
            <span>تعديل</span>
          </button>
        </PermissionGuard>

        <button
          type="button"
          onClick={() => onViewDetails(app)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-muted/60 text-foreground hover:bg-muted transition-all cursor-pointer border border-border"
        >
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          <span>التفاصيل</span>
        </button>

        <PermissionGuard permission="appointments:cancel">
          <button
            type="button"
            disabled={isCompleted}
            onClick={() => onDelete(app.id)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ms-auto ${
              isCompleted
                ? "bg-muted/40 text-muted-foreground/30 cursor-not-allowed"
                : "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 cursor-pointer border border-rose-500/20"
            }`}
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>حذف</span>
          </button>
        </PermissionGuard>
      </div>
    </div>
  );
});
