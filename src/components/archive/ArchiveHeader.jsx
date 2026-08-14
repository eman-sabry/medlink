import { Trash2, Archive, RefreshCw } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../permissions/roles";

export function ArchiveHeader({
  totalCount = 0,
  onEmptyArchive,
  onRefresh,
  isLoading = false,
}) {
  const { user } = useAuth();
  const isOwner = user?.role === ROLES.OWNER || user?.role === "owner" || user?.role === "مدير المركز";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-right" dir="rtl">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              سلة المحذوفات
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              كل عنصر محذوف ينتقل هنا بدلًا من الحذف النهائي، ويمكنك استعادته في أي وقت.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-start sm:self-auto">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          title="تحديث البيانات"
          className="p-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>

        {isOwner && (
          <button
            type="button"
            onClick={onEmptyArchive}
            disabled={isLoading || totalCount === 0}
            className="px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            <span>إفراغ سلة المحذوفات</span>
            {totalCount > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300">
                {totalCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
