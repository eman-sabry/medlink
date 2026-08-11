import { RefreshCw } from "lucide-react";

export function ErrorState({
  message = "حدث خطأ أثناء الاتصال بالسيرفر. تأكد من تشغيل JSON Server.",
  onRetry,
}) {
  return (
    <div className="p-16 text-center bg-card rounded-3xl border border-border space-y-4">
      <p className="text-destructive font-bold">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-destructive/10 text-destructive font-bold text-sm hover:bg-destructive/20 transition-all cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}
