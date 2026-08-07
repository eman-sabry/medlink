import {
  Stethoscope,
  MoreVertical,
  Edit,
  Trash2,
  Clock,
  Tag,

} from "lucide-react";

export function ServiceCard({
  service,
  onEdit,
  onDelete,
  activeMenuId,
  onToggleMenu,
}) {
  const isMenuOpen = activeMenuId === service.id;

  return (
    <div className="relative bg-gradient-to-b from-card to-muted/20 border border-border hover:border-primary/60 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 group">
      {/* رأس الكارت (أيقونة مميزة مع إضاءة خفيفة، وشارة الحالة، وقائمة الخيارات) */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-emerald-500/30 rounded-2xl blur-sm opacity-50 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative p-3.5 rounded-2xl bg-card border border-border/80 text-primary shadow-sm flex items-center justify-center">
            <Stethoscope className="h-5 w-5" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* شارة الحالة */}
          <span
            className={`px-3 py-1 rounded-full font-bold text-[10px] tracking-wide shadow-xs ${
              service.status === "Active"
                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
            }`}
          >
            {service.status === "Active" ? "● نشطة" : "○ غير نشطة"}
          </span>

          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMenu(isMenuOpen ? null : service.id);
              }}
              className="p-2 rounded-xl hover:bg-muted/80 text-muted-foreground transition-all cursor-pointer border border-transparent hover:border-border"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {isMenuOpen && (
              <div
                className="absolute left-0 top-full mt-1 bg-card border border-border rounded-2xl shadow-2xl p-1.5 z-20 min-w-[130px] space-y-1 text-xs backdrop-blur-md"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => onEdit(service)}
                  className="w-full text-right px-3 py-2 rounded-xl font-medium text-foreground hover:bg-muted flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Edit className="h-3.5 w-3.5 text-primary" />
                  <span>تعديل الخدمة</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(service.id)}
                  className="w-full text-right px-3 py-2 rounded-xl font-medium text-red-500 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>حذف الخدمة</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* تفاصيل الخدمة (العنوان، الفئة، والوصف الغني) */}
      <div className="space-y-3 text-right">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs font-bold">
          <Tag className="h-3.5 w-3.5" />
          <span>{service.category || "عام"}</span>
        </div>

        <h3 className="font-black text-foreground text-lg group-hover:text-primary transition-colors leading-snug">
          {service.name}
        </h3>

        {/* صندوق الوصف لملء المساحة بشكل أنيق */}
        <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 min-h-[60px] flex items-center">
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {service.description ||
              "لا يوجد وصف إضافي لهذه الخدمة حالياً، يمكنك إضافته من خلال تعديل الخدمة."}
          </p>
        </div>
      </div>

      {/* قسم السعر والمدة الزمنية في أسفل الكارت */}
      <div className="pt-4 border-t border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-xl border border-border/40">
          <Clock className="h-4 w-4 text-primary shrink-0" />
          <span className="font-bold text-foreground">
            {service.duration_minutes || 0}
          </span>
          <span>دقيقة</span>
        </div>

        <div className="flex items-baseline gap-1 text-left">
          <span className="text-2xl font-black text-foreground font-mono tracking-tight">
            {service.default_price}
          </span>
          <span className="text-xs font-bold text-muted-foreground">ج.م</span>
        </div>
      </div>
    </div>
  );
}
