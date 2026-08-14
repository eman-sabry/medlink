import { RotateCcw, CheckCircle2, X } from "lucide-react";
import { ARCHIVE_ENTITY_CONFIG } from "../../constants/archiveConstants";

export function RestoreConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  item,
  isLoading = false,
}) {
  if (!isOpen || !item) return null;

  const config = ARCHIVE_ENTITY_CONFIG[item.entity_type] || ARCHIVE_ENTITY_CONFIG.all;
  const singularLabel = config.singularLabel || "العنصر";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden p-6 text-right"
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
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              استعادة {singularLabel}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              سيتم إرجاع هذا العنصر إلى القائمة النشطة الخاصة به فوراً بكامل بياناته الأصلية.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-muted/40 border border-border mb-5">
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
            className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isLoading ? "جاري الاستعادة..." : "تأكيد الاستعادة"}
          </button>
        </div>
      </div>
    </div>
  );
}
