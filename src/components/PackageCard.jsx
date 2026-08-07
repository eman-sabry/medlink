import { memo } from "react";
import {
  Package,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
  Zap,
} from "lucide-react";

function PackageCardImpl({
  pkg,
  onEdit,
  onDelete,
  activeMenuId,
  onToggleMenu,
}) {
  const isMenuOpen = activeMenuId === pkg.id;

  return (
    <div
      className={`relative bg-card rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 border ${
        pkg.is_featured
          ? "border-primary ring-2 ring-primary/20 shadow-lg"
          : "border-border hover:border-primary/50"
      }`}
    >
      {/* شارة التمييز (الأكثر مبيعاً / مميز) */}
      {pkg.badge && (
        <div className="absolute -top-3 right-6 bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
          <Zap className="h-3 w-3 fill-current" />
          <span>{pkg.badge}</span>
        </div>
      )}

      {/* رأس الكارت */}
      <div className="flex items-center justify-between">
        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
          <Package className="h-5 w-5" />
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMenu(isMenuOpen ? null : pkg.id);
            }}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-all cursor-pointer"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {isMenuOpen && (
            <div
              className="absolute left-0 top-full mt-1 bg-card border border-border rounded-2xl shadow-xl p-1.5 z-20 min-w-[120px] space-y-1 text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => onEdit(pkg)}
                className="w-full text-right px-3 py-2 rounded-xl font-medium text-foreground hover:bg-muted flex items-center gap-2 cursor-pointer"
              >
                <Edit className="h-3.5 w-3.5 text-primary" />
                <span>تعديل</span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(pkg.id)}
                className="w-full text-right px-3 py-2 rounded-xl font-medium text-red-500 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>حذف</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* تفاصيل الباقة والأسعار */}
      <div className="space-y-2 text-center sm:text-right">
        <h3 className="font-black text-foreground text-lg">{pkg.name}</h3>
        <p className="text-xs text-muted-foreground">
          {pkg.session_count} جلسات •{" "}
          {pkg.session_count > 0
            ? (pkg.price / pkg.session_count).toFixed(0)
            : 0}{" "}
          ج.م / جلسة
        </p>

        <div className="pt-2 flex items-baseline justify-center sm:justify-start gap-2">
          <span className="text-2xl font-black text-foreground font-mono">
            {pkg.price} <span className="text-xs font-normal">ج.م</span>
          </span>
          {pkg.discount_percent > 0 && (
            <span className="text-xs text-muted-foreground line-through font-mono">
              {(pkg.price * (1 + pkg.discount_percent / 100)).toFixed(0)} ج.م
            </span>
          )}
        </div>
      </div>

      {/* قائمة المميزات */}
      <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
        {pkg.discount_percent > 0 && (
          <div className="flex items-center gap-2 text-emerald-600 font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>توفير {pkg.discount_percent}%</span>
          </div>
        )}

        {pkg.features && pkg.features.length > 0 ? (
          pkg.features.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-muted-foreground font-medium"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
              <span>{feature}</span>
            </div>
          ))
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
            <span>مرونة كاملة في المواعيد</span>
          </div>
        )}
      </div>
      {/* شريط التقدم السفلي */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
          <span>اشتراكات نشطة</span>
          <span className="font-bold text-foreground">١٢</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="bg-primary h-full rounded-full"
            style={{ width: "65%" }}
          />
        </div>
      </div>
    </div>
  );
}

export const PackageCard = memo(PackageCardImpl);
