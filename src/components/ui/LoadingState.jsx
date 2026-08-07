import { Loader2 } from "lucide-react";

export function LoadingState({
  message = "جاري تحميل البيانات...",
  rounded = "rounded-2xl",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-16 space-y-3 bg-card ${rounded} border border-border`}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
