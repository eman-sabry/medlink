import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2, Lock, LogIn, User } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "../utils/toast";

const DEMO_ACCOUNTS = [
  { label: "مالك المركز", username: "owner" },
  { label: "سكرتارية", username: "secretary" },
  { label: "طبيب", username: "doctor" },
];

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname ?? "/dashboard"} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await login(username, password);
      toast.success("تم تسجيل الدخول بنجاح");
      navigate(location.state?.from?.pathname ?? "/dashboard", { replace: true });
    } catch (error) {
      toast.error(error.message || "فشل تسجيل الدخول");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 font-['Cairo',sans-serif]" dir="rtl">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-1">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
            <LogIn className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-foreground">MedLink OS</h1>
          <p className="text-sm text-muted-foreground">
            سجّل دخولك للوصول إلى لوحة تحكم المركز
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-primary" />
              اسم المستخدم
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="owner / secretary / doctor"
              required
              autoFocus
              className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground focus:outline-hidden focus:border-primary transition-all shadow-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-primary" />
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground focus:outline-hidden focus:border-primary transition-all shadow-xs"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>تسجيل الدخول</span>
          </button>
        </form>

        <div className="border-t border-border pt-4 space-y-2">
          <p className="text-xs font-bold text-muted-foreground text-center">
            حسابات تجريبية (كلمة المرور: 123456)
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.username}
                type="button"
                onClick={() => {
                  setUsername(account.username);
                  setPassword("123456");
                }}
                className="text-[11px] font-semibold py-2 rounded-xl bg-muted text-foreground hover:bg-muted/70 transition-all cursor-pointer"
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
