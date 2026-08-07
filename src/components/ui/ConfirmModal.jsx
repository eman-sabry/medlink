import { AlertTriangle, Loader2 } from "lucide-react";

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "هل أنت متأكد؟",
  description,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  variant = "destructive", // 'destructive' | 'primary' | 'warning'
  isLoading = false,
}) {
  if (!isOpen) return null;

  const isDestructive = variant === "destructive";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 text-center">
        {/* أيقونة التحذير */}
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl mx-auto ${
            isDestructive
              ? "bg-destructive/10 text-destructive"
              : "bg-primary/10 text-primary"
          }`}
        >
          <AlertTriangle className="h-8 w-8" />
        </div>

        {/* العنوان والوصف */}
        <div className="space-y-2">
          <h3 className="text-xl font-black text-foreground">{title}</h3>
          {description && (
            <div className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </div>
          )}
        </div>

        {/* الأزرار */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3.5 rounded-2xl bg-muted text-foreground font-bold text-sm hover:bg-muted/80 transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer shadow-lg disabled:opacity-50 ${
              isDestructive
                ? "bg-red-500 text-white hover:opacity-90 shadow-destructive/20"
                : "bg-primary text-primary-foreground hover:opacity-90 shadow-primary/20"
            }`}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
