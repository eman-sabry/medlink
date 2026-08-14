import { useState } from "react";
import { Archive, AlertTriangle, X } from "lucide-react";
import { ARCHIVE_RETENTION_DAYS, ARCHIVE_ENTITY_CONFIG } from "../../constants/archiveConstants";

export function MoveToArchiveModal({
  isOpen,
  onClose,
  onConfirm,
  entityType = "patient",
  entityName = "",
  entityIdentifier = "",
  isLoading = false,
}) {
  const [deleteReason, setDeleteReason] = useState("");

  if (!isOpen) return null;

  const entityConfig = ARCHIVE_ENTITY_CONFIG[entityType] || ARCHIVE_ENTITY_CONFIG.all;
  const EntityIcon = entityConfig.icon || Archive;
  const singularLabel = entityConfig.singularLabel || "العنصر";

  const handleClose = () => {
    setDeleteReason("");
    onClose?.();
  };

  const handleConfirm = () => {
    onConfirm(deleteReason.trim() || "طلب نقل للأرشيف");
    setDeleteReason("");
  };

  const quickReasons = [
    "طلب العميل / المريض",
    "سجل مكرر بالخطأ",
    "تحديث وإعادة إدخال",
    "إلغاء الخدمة أو المعاملة",
    "عدم الحاجة للسجل",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden p-6 text-right"
        dir="rtl"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Icon */}
        <div className="flex items-start gap-4 mb-5">
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">
              نقل {singularLabel} إلى سلة المحذوفات
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              لن يتم حذف البيانات فورياً، بل ستُنقل إلى الأرشيف لحمايتها من الفقدان.
            </p>
          </div>
        </div>

        {/* Entity Card Preview */}
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 flex items-center gap-3 mb-5">
          <div className={`p-2 rounded-lg ${entityConfig.bgColor || 'bg-primary/10'} ${entityConfig.color || 'text-primary'}`}>
            <EntityIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {entityName || "عنصر محدد"}
            </p>
            {entityIdentifier && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {entityIdentifier}
              </p>
            )}
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${entityConfig.badgeColor || 'bg-muted text-muted-foreground'}`}>
            {singularLabel}
          </span>
        </div>

        {/* Reason Input */}
        <div className="mb-5 space-y-2">
          <label className="block text-sm font-medium text-foreground">
            سبب النقل للأرشيف (اختياري)
          </label>
          <input
            type="text"
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            placeholder="مثال: طلب حذف الملف، خطأ في الإدخال، إلخ..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          
          {/* Quick Reasons Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {quickReasons.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => setDeleteReason(reason)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  deleteReason === reason
                    ? "bg-primary/10 text-primary border-primary/30 font-medium"
                    : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
        </div>

        {/* 30-Day Warning Callout */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 mb-6 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            يبقى العنصر في الأرشيف لمدة <strong>{ARCHIVE_RETENTION_DAYS} يوماً</strong> حيث يمكنك استعادته في أي وقت بكامل تفاصيله، وبعدها يُحذف تلقائياً نهائياً.
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Archive className="w-4 h-4" />
            {isLoading ? "جاري النقل..." : "نقل إلى الأرشيف"}
          </button>
        </div>
      </div>
    </div>
  );
}
