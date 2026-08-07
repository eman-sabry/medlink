import { CheckCircle2, Calendar, User } from "lucide-react";

export function PatientSummaryCard({ sessionData }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-black text-foreground">
            {sessionData?.patient_name || "مريم أحمد صلاح"}
          </h1>
          <span className="text-xs font-bold bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> حضر
          </span>
          <span className="text-xs font-bold bg-muted text-muted-foreground px-3 py-1 rounded-full">
            {sessionData?.patient_file_no || sessionData?.file_no || "ع هـ - 1045"}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-primary" />{" "}
            {sessionData?.starts_at
              ? new Date(sessionData.starts_at).toLocaleString("ar-EG")
              : "الثلاثاء، 14 يوليو 2026"}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 font-semibold text-foreground">
            <User className="h-3.5 w-3.5 text-primary" /> المعالج:{" "}
            {sessionData?.doctor_name || "د. محمد أحمد"}
          </span>
          {sessionData?.room_name && (
            <>
              <span>•</span>
              <span className="text-muted-foreground">
                الغرفة: {sessionData.room_name}{" "}
                {sessionData.bed_name ? `| السرير: ${sessionData.bed_name}` : ""}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="bg-muted/50 border border-border px-5 py-3 rounded-2xl flex items-center gap-4">
        <div className="text-left">
          <span className="text-xs text-muted-foreground block font-medium">
            حالة البرنامج العلاجي
          </span>
          <span className="text-sm font-black text-foreground">الجلسة 6 من 15</span>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
          33%
        </div>
      </div>
    </div>
  );
}
