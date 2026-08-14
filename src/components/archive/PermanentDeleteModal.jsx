import { AlertTriangle, Trash2, X } from "lucide-react";

export function PermanentDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  item,
  isLoading = false,
}) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-card border border-rose-500/30 rounded-2xl shadow-2xl overflow-hidden p-6 text-right"
        dir="rtl"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3.5 mb-4">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              تأكيد الحذف النهائي
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              هذا الإجراء نهائي ولا يمكن التراجع عنه مطلقاً.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/15 mb-5">
          <p className="text-sm font-semibold text-foreground truncate">
            {item.title}
          </p>
          {item.subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {item.subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {isLoading ? "جاري الحذف..." : "نعم، احذف نهائياً"}
          </button>
        </div>
      </div>
    </div>
  );
}
