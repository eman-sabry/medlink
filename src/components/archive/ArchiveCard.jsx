import { RotateCcw, Trash2, Clock, User, FileText, Calendar, Tag } from "lucide-react";
import { ARCHIVE_ENTITY_CONFIG } from "../../constants/archiveConstants";
import { getDaysUntilExpiration, formatExpirationStatus, formatArchiveDate } from "../../helpers/archive.helpers";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../permissions/roles";

export function ArchiveCard({
  item,
  onRestore,
  onPermanentDelete,
  isRestoring = false,
  isDeleting = false,
}) {
  const { user } = useAuth();
  const isOwner = user?.role === ROLES.OWNER || user?.role === "owner" || user?.role === "مدير المركز";

  const config = ARCHIVE_ENTITY_CONFIG[item.entity_type] || ARCHIVE_ENTITY_CONFIG.all;
  const EntityIcon = config.icon || FileText;

  const daysLeft = getDaysUntilExpiration(item.archived_at, item.expires_at);
  const expirationInfo = formatExpirationStatus(daysLeft);

  return (
    <div
      id={`archive-card-${item.id}`}
      className="group relative flex flex-col justify-between bg-card border border-border hover:border-border/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 text-right"
      dir="rtl"
    >
      {/* Top Header: Entity Icon, Title, Category Badge */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2.5 rounded-xl ${config.bgColor || "bg-primary/10"} ${config.color || "text-primary"} shrink-0`}>
              <EntityIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">
                {item.title || "عنصر مؤرشف"}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground truncate">
                {item.subtitle && <span>{item.subtitle}</span>}
                {item.secondary_info && (
                  <>
                    <span className="text-border">•</span>
                    <span className="font-medium text-foreground/80">{item.secondary_info}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium border shrink-0 ${config.badgeColor || "bg-muted text-muted-foreground"}`}
          >
            {config.singularLabel || item.entity_type}
          </span>
        </div>

        {/* Reason Box */}
        {item.delete_reason && (
          <div className="my-3 p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs flex items-start gap-2 text-foreground/90">
            <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              <strong className="text-muted-foreground font-normal">السبب: </strong>
              {item.delete_reason}
            </span>
          </div>
        )}

        {/* Metadata Details */}
        <div className="grid grid-cols-2 gap-2 text-2xs sm:text-xs text-muted-foreground pt-1 pb-3">
          <div className="flex items-center gap-1.5 truncate">
            <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">بواسطة: {item.archived_by || "المسؤول"}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{formatArchiveDate(item.archived_at)}</span>
          </div>
        </div>
      </div>

      {/* Footer: Expiration Status & Action Buttons */}
      <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Expiration Badge */}
        <div
          className={`inline-flex items-center gap-1.5 text-2xs sm:text-xs px-2.5 py-1 rounded-xl border font-medium ${expirationInfo.badgeClass}`}
        >
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>{expirationInfo.text}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={() => onRestore(item)}
            disabled={isRestoring || isDeleting}
            className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRestoring ? "animate-spin" : ""}`} />
            <span>استعادة</span>
          </button>

          {isOwner && (
            <button
              type="button"
              onClick={() => onPermanentDelete(item)}
              disabled={isRestoring || isDeleting}
              className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              title="حذف نهائي"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف نهائي</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
