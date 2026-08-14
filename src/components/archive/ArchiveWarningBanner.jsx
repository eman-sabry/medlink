import { AlertCircle, Clock, ShieldCheck } from "lucide-react";
import { ARCHIVE_RETENTION_DAYS } from "../../constants/archiveConstants";

export function ArchiveWarningBanner() {
  return (
    <div
      id="archive-warning-banner"
      className="w-full rounded-2xl p-4.5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-right"
      dir="rtl"
    >
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0 border border-amber-500/20">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <span>لا شيء يُحذف فورًا من النظام</span>
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-medium">
              <Clock className="w-3 h-3" />
              مهلة {ARCHIVE_RETENTION_DAYS} يوم
            </span>
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            العناصر في الأرشيف يتم الاحتفاظ بها لمدة <strong>{ARCHIVE_RETENTION_DAYS} يوماً</strong> حيث يمكنك استعادتها بضغطة زر واحدة بكامل بياناتها، قبل أن تُحذف نهائياً تلقائياً.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-card/80 px-3 py-1.5 rounded-xl border border-border shrink-0 self-end sm:self-auto">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>أرشيف آمن ومشفر</span>
      </div>
    </div>
  );
}
