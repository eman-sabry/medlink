import { useState } from "react";
import {
  Loader2,
  Mail,
  Phone,
  Save,
  User,
  Lock,
  Bell,
  Volume2,
  VolumeX,
  Volume1,
  Laptop,
  Smartphone,
  Globe,
  ShieldAlert,
  LogOut,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useProfile } from "../hooks/useProfile";
import { ROLE_LABELS } from "../permissions/roles";
import { toast } from "../utils/toast";
import { useNotifications } from "../hooks/useNotifications";
import { playNotificationChime } from "../utils/notificationSound";

export default function ProfilePage() {
  const {
    user,
    updateProfile,
    isUpdatingProfile,
    changePassword,
    isChangingPassword,
    sessions,
    isLoadingSessions,
    refetchSessions,
    deleteSession,
    isDeletingSession,
    logoutAll,
    isLoggingOutAll,
  } = useProfile();
  const { isSoundEnabled, toggleSound } = useNotifications();

  const [formOverrides, setFormOverrides] = useState({});

  const fullNameValue = formOverrides.full_name ?? user?.full_name ?? "";
  const emailValue = formOverrides.email ?? user?.email ?? "";
  const phoneValue = formOverrides.phone ?? user?.phone ?? "";

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    await updateProfile({
      full_name: fullNameValue,
      email: emailValue,
      phone: phoneValue,
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.warning("كلمة المرور الجديدة وتأكيدها غير متطابقين");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.warning("يجب أن تكون كلمة المرور 6 أحرف على الأقل");
      return;
    }
    await changePassword(passwordForm);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto" dir="rtl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          الملف الشخصي
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {user?.full_name} — {ROLE_LABELS[user?.role] ?? user?.role}
        </p>
      </div>

      <form
        onSubmit={handleProfileSubmit}
        className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-sm"
      >
        <h2 className="font-extrabold text-foreground text-sm">البيانات الأساسية</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-primary" /> الاسم الكامل
            </label>
            <input
              type="text"
              value={fullNameValue}
              onChange={(e) =>
                setFormOverrides((prev) => ({ ...prev, full_name: e.target.value }))
              }
              required
              className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground focus:outline-hidden focus:border-primary transition-all shadow-xs"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-primary" /> البريد الإلكتروني
            </label>
            <input
              type="email"
              value={emailValue}
              onChange={(e) =>
                setFormOverrides((prev) => ({ ...prev, email: e.target.value }))
              }
              required
              className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground focus:outline-hidden focus:border-primary transition-all shadow-xs"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-primary" /> رقم الهاتف
            </label>
            <input
              type="text"
              value={phoneValue}
              onChange={(e) =>
                setFormOverrides((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="مثال: 010907887"
              className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground focus:outline-hidden focus:border-primary transition-all shadow-xs"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isUpdatingProfile}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
        >
          {isUpdatingProfile ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>حفظ البيانات</span>
        </button>
      </form>

      <form
        onSubmit={handlePasswordSubmit}
        className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-sm"
      >
        <h2 className="font-extrabold text-foreground text-sm">تغيير كلمة المرور</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { key: "currentPassword", label: "كلمة المرور الحالية" },
            { key: "newPassword", label: "كلمة المرور الجديدة" },
            { key: "confirmPassword", label: "تأكيد كلمة المرور" },
          ].map((field) => (
            <div key={field.key} className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-primary" /> {field.label}
              </label>
              <input
                type="password"
                value={passwordForm[field.key]}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                required
                className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground focus:outline-hidden focus:border-primary transition-all shadow-xs"
              />
            </div>
          ))}
        </div>
        <button
          type="submit"
          disabled={isChangingPassword}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-muted text-foreground font-bold text-xs hover:bg-muted/80 transition-all cursor-pointer disabled:opacity-50"
        >
          {isChangingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>تغيير كلمة المرور</span>
        </button>
      </form>

      {/* Active Sessions Card */}
      <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-foreground text-sm">الجلسات والأجهزة المتصلة</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                إدارة الجلسات المفتوحة بحسابك على مختلف الأجهزة
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetchSessions()}
              disabled={isLoadingSessions}
              className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title="تحديث الجلسات"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingSessions ? "animate-spin" : ""}`} />
            </button>
            {sessions.length > 1 && (
              <button
                type="button"
                onClick={() => logoutAll()}
                disabled={isLoggingOutAll}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-bold transition-all cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>إنهاء كل الجلسات</span>
              </button>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-border/50 space-y-3">
          {isLoadingSessions ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground gap-2 text-xs">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>جاري تحميل الجلسات...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-4">
              لا توجد جلسات أخرى مسجلة
            </div>
          ) : (
            sessions.map((sess, idx) => {
              const id = sess.sessionId || sess.id || `sess_${idx}`;
              const isCurrent = Boolean(sess.current || sess.isCurrent);
              const formatSafeDate = (d) => {
                if (!d) return null;
                try {
                  const normalized = String(d).trim().replace(" ", "T");
                  const dateObj = new Date(normalized);
                  return isNaN(dateObj.getTime()) ? String(d) : dateObj.toLocaleString("ar-EG");
                } catch {
                  return String(d);
                }
              };

              const formattedCreated = formatSafeDate(sess.createdAt);
              const formattedExpires = formatSafeDate(sess.expiresAt);

              return (
                <div
                  key={id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? "bg-primary/5 border-primary/30"
                      : sess.compromised
                      ? "bg-amber-500/5 border-amber-500/30"
                      : sess.revoked
                      ? "bg-muted/30 border-border/40 opacity-75"
                      : "bg-muted/40 border-border/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-background border border-border flex items-center justify-center text-primary shrink-0">
                      {sess.userAgent?.toLowerCase().includes("mobile") ? (
                        <Smartphone className="h-4 w-4" />
                      ) : (
                        <Laptop className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-foreground">
                          {isCurrent ? "الجلسة الحالية" : `جلسة #${String(id).slice(0, 8)}`}
                        </span>
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" /> نشط الآن
                          </span>
                        )}
                        {sess.compromised && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            <ShieldAlert className="h-3 w-3" /> مشبوهة
                          </span>
                        )}
                        {sess.revoked && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20">
                            <ShieldAlert className="h-3 w-3" /> ملغاة
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                        {formattedCreated && (
                          <span>بدأت: {formattedCreated}</span>
                        )}
                        {formattedExpires && !sess.revoked && (
                          <span className="text-[10px] opacity-75">تنتهي: {formattedExpires}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isCurrent && !sess.revoked && (
                    <button
                      type="button"
                      onClick={() => deleteSession(id)}
                      disabled={isDeletingSession}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {isDeletingSession ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <LogOut className="h-3.5 w-3.5" />
                      )}
                      <span>إنهاء الجلسة</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Notification Preferences Card */}
      <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-foreground text-sm">تفضيلات الإشعارات</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                التحكم في أصوات التنبيهات ونظام الإشعارات الفورية
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition-all ${
                isSoundEnabled
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border bg-muted text-muted-foreground"
              }`}
            >
              {isSoundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">
                صوت تنبيه الإشعارات الجديدة
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                تشغيل نغمة لطيفة عند وصول إشعار جديد يخص حسابك أو عيادتك
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSoundEnabled && (
              <button
                type="button"
                onClick={() => playNotificationChime("info")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-border bg-background hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-xs"
              >
                <Volume1 className="h-3.5 w-3.5 text-primary" />
                <span>تجربة الصوت</span>
              </button>
            )}

            <button
              type="button"
              onClick={toggleSound}
              className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                isSoundEnabled
                  ? "bg-primary text-primary-foreground shadow-xs hover:opacity-90"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {isSoundEnabled ? "مفعّل" : "معطّل"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

