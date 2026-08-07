import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-6">
      <div className="h-16 w-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="text-xl font-black text-foreground">غير مصرح لك بالوصول</h1>
      <p className="text-sm text-muted-foreground max-w-md">
        لا تملك الصلاحية اللازمة لعرض هذه الصفحة. تواصل مع مالك المركز إذا كنت
        تعتقد أن هذا خطأ.
      </p>
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer"
      >
        العودة للوحة التحكم
      </button>
    </div>
  );
}
