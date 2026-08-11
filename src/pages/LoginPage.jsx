import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Loader2,
  Lock,
  LogIn,
  User,
  ShieldCheck,
  Stethoscope,
  Activity,
  HeartPulse,
  Pill,
  PlusCircle,
  FileText,
  Syringe,
  ActivitySquare,
  Cross,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "../utils/toast";

const DEMO_ACCOUNTS = [
  { label: "مالك المركز", username: "owner", icon: ShieldCheck },
  { label: "سكرتارية", username: "secretary", icon: User },
  { label: "طبيب", username: "doctor", icon: Stethoscope },
];
const floatingIcons = [
  {
    Icon: Activity,
    top: "8%",
    left: "6%",
    size: 48,
    duration: 9,
    delay: 0,
    opacity: 0.25,
  },
  {
    Icon: HeartPulse,
    top: "15%",
    left: "82%",
    size: 54,
    duration: 11,
    delay: 1.5,
    opacity: 0.2,
  },
  {
    Icon: Pill,
    top: "72%",
    left: "10%",
    size: 36,
    duration: 8.5,
    delay: 0.8,
    opacity: 0.3,
  },
  {
    Icon: PlusCircle,
    top: "85%",
    left: "75%",
    size: 44,
    duration: 10,
    delay: 2,
    opacity: 0.2,
  },
  {
    Icon: Stethoscope,
    top: "40%",
    left: "3%",
    size: 60,
    duration: 13,
    delay: 1,
    opacity: 0.15,
  },
  {
    Icon: ShieldCheck,
    top: "30%",
    left: "91%",
    size: 42,
    duration: 7.5,
    delay: 0.4,
    opacity: 0.25,
  },
  {
    Icon: FileText,
    top: "12%",
    left: "35%",
    size: 34,
    duration: 9.5,
    delay: 2.5,
    opacity: 0.2,
  },
  {
    Icon: Syringe,
    top: "60%",
    left: "88%",
    size: 46,
    duration: 10.5,
    delay: 1.2,
    opacity: 0.2,
  },
  {
    Icon: ActivitySquare,
    top: "80%",
    left: "42%",
    size: 50,
    duration: 12,
    delay: 3,
    opacity: 0.15,
  },
  {
    Icon: Cross,
    top: "25%",
    left: "18%",
    size: 30,
    duration: 8,
    delay: 0.5,
    opacity: 0.35,
  },
];

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Always land on the role dashboard after login — never restore the page the user was on
  // before logging out or before their session expired. DashboardRedirect resolves the actual
  // role-specific route, so no role logic is duplicated here.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await login(username, password);
      toast.success("تم تسجيل الدخول بنجاح");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(error.message || "فشل تسجيل الدخول");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-background p-4 font-['Cairo',sans-serif] relative overflow-hidden"
      dir="rtl"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--primary),0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

      {floatingIcons.map((item, index) => {
        const IconComponent = item.Icon;
        return (
          <motion.div
            key={index}
            initial={{ y: 0 }}
            animate={{
              y: [-20, 20, -20],
              rotate: [-8, 8, -8],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: item.delay,
            }}
            style={{ top: item.top, left: item.left }}
            className="absolute text-primary pointer-events-none select-none z-0"
          >
            <IconComponent size={item.size} style={{ opacity: item.opacity }} />
          </motion.div>
        );
      })}

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg bg-card/95 backdrop-blur-md border border-border/80 rounded-[2.5rem] shadow-2xl p-10 md:p-12 space-y-8 relative z-10"
      >
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-inner shrink-0"
          >
            <LogIn className="h-8 w-8" />
          </motion.div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
              MedLink OS
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-0.5">
              نظام إدارة العيادات والمراكز الطبية الذكي
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground/80 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              اسم المستخدم
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="owner / secretary / doctor"
              required
              autoFocus
              className="w-full h-14 rounded-2xl border border-border bg-background px-5 text-sm text-foreground focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground/80 flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-14 rounded-2xl border border-border bg-background px-5 text-sm text-foreground focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-primary-foreground font-extrabold text-base hover:opacity-95 shadow-xl shadow-primary/20 transition-all cursor-pointer disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span>تسجيل الدخول</span>
            )}
          </button>
        </form>

        <div className="border-t border-border/60 pt-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground">
              حسابات تجريبية سريعة
            </p>
            <span className="text-xs font-mono bg-muted px-2.5 py-1 rounded-lg text-muted-foreground border border-border/50">
              كلمة المرور: 123456
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {DEMO_ACCOUNTS.map((account) => {
              const IconComponent = account.icon;
              return (
                <button
                  key={account.username}
                  type="button"
                  onClick={() => {
                    setUsername(account.username);
                    setPassword("123456");
                  }}
                  className="text-xs font-bold py-3 px-4 rounded-2xl bg-muted/40 border border-border/60 text-foreground transition-all cursor-pointer flex items-center justify-center gap-2.5 hover:bg-card hover:border-primary/50 hover:shadow-md hover:text-primary group"
                >
                  <IconComponent className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  <span className="truncate">{account.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
