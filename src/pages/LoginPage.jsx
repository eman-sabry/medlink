import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  KeyRound,
  X,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { forgotPassword } from "../auth/authService";
import { toast } from "../utils/toast";
import { DASHBOARD_BY_ROLE } from "../permissions/roles";

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
  const { isAuthenticated, login, role } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isSendingForgot, setIsSendingForgot] = useState(false);
  const [forgotSentSuccess, setForgotSentSuccess] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={DASHBOARD_BY_ROLE[role] ?? "/dashboard"} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const loggedInUser = await login(username, password);
      toast.success("تم تسجيل الدخول بنجاح");
      const targetDashboard = DASHBOARD_BY_ROLE[loggedInUser?.role] ?? "/dashboard";
      navigate(targetDashboard, { replace: true });
    } catch (error) {
      toast.error(error.message || "فشل تسجيل الدخول");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (isSendingForgot) return;

    setIsSendingForgot(true);
    try {
      await forgotPassword(forgotEmail);
      setForgotSentSuccess(true);
      toast.success("تم إرسال رابط استعادة كلمة المرور بنجاح");
    } catch (error) {
      toast.error(error.message || "تعذر إرسال طلب استعادة كلمة المرور");
    } finally {
      setIsSendingForgot(false);
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
              اسم المستخدم أو البريد الإلكتروني
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="أدخل اسم المستخدم أو البريد الإلكتروني"
              required
              autoFocus
              className="w-full h-14 rounded-2xl border border-border bg-background px-5 text-sm text-foreground focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground/80 flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                كلمة المرور
              </label>
              
            </div>
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

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setForgotSentSuccess(false);
                setShowForgotModal(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer py-1 px-3 rounded-xl hover:bg-primary/5"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>هل نسيت كلمة المرور؟ اضغط هنا لاستعادتها</span>
            </button>
          </div>
        </form>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-card border border-border rounded-3xl p-6 space-y-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">استعادة كلمة المرور</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      أدخل بريدك الإلكتروني لإرسال تعليمات الاستعادة
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {forgotSentSuccess ? (
                <div className="text-center py-4 space-y-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">تم إرسال الطلب بنجاح</p>
                    <p className="text-xs text-muted-foreground">
                      تم إرسال تعليمات استعادة كلمة المرور إلى البريد: <br />
                      <span className="font-bold text-foreground">{forgotEmail}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-full py-3 rounded-2xl bg-muted text-foreground text-xs font-bold hover:bg-muted/80 transition-all cursor-pointer"
                  >
                    إغلاق والعودة لتسجيل الدخول
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-primary" /> البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground focus:outline-hidden focus:border-primary transition-all shadow-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isSendingForgot}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSendingForgot ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <span>إرسال الرابط</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="px-4 py-3 rounded-2xl border border-border hover:bg-muted text-xs font-bold text-muted-foreground transition-all cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

