import { useState } from "react";
import { X, Loader2, UserPlus, KeyRound } from "lucide-react";
import { CustomSelect } from "../ui/CustomSelect";
import { STAFF_TYPE_OPTIONS, TEAM_ROLE_OPTIONS, GENDER_OPTIONS } from "../../helpers/team.helpers";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildInitialState(member) {
  return {
    fullName: member?.full_name ?? "",
    staffType: member?.staff_type ?? "Doctor",
    specialty: member?.specialty ?? "",
    gender: member?.gender ?? "",
    role: member?.role ?? "Doctor",
    email: member?.email ?? "",
    phone: member?.phone ?? "",
    avatar: member?.avatar ?? "",
    username: member?.username ?? "",
    password: "",
    confirmPassword: "",
  };
}

export function TeamMemberModal({
  isOpen,
  mode = "add",
  member = null,
  defaultWantsAccount = false,
  isSubmitting = false,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(() => buildInitialState(member));
  const [wantsAccount, setWantsAccount] = useState(mode === "add" || defaultWantsAccount);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const isEdit = mode === "edit";
  const hasAccount = Boolean(member?.hasAccount);
  const showAccountFields = !isEdit || hasAccount || wantsAccount;
  const showPasswordFields = !isEdit || (!hasAccount && wantsAccount);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "الاسم الكامل مطلوب";
    if (!form.staffType) next.staffType = "الوظيفة مطلوبة";
    if (showAccountFields) {
      if (!form.email.trim()) next.email = "البريد الإلكتروني مطلوب";
      else if (!EMAIL_PATTERN.test(form.email.trim())) next.email = "صيغة البريد الإلكتروني غير صحيحة";
      if (!form.role) next.role = "دور النظام مطلوب";
    }
    if (showPasswordFields) {
      if (!form.username.trim()) next.username = "اسم المستخدم مطلوب";
      if (!form.password || form.password.length < 6) next.password = "كلمة المرور 6 أحرف على الأقل";
      if (form.password !== form.confirmPassword) next.confirmPassword = "كلمتا المرور غير متطابقتين";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !validate()) return;
    try {
      await onSubmit({ ...form, includeAccount: showPasswordFields, hasAccountFields: showAccountFields });
      onClose();
    } catch {
      // error toast shown by the mutation hook
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-card border border-border w-full max-w-xl rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-black text-foreground tracking-wide flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            {isEdit ? "تعديل عضو الفريق" : "إضافة عضو فريق جديد"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-full sm:col-span-1">
              <label className="text-xs font-bold text-muted-foreground">الاسم الكامل</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                placeholder="الاسم الكامل"
                className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm"
              />
              {errors.fullName && <p className="text-[11px] text-destructive font-bold">{errors.fullName}</p>}
            </div>

            <div className="space-y-1.5 col-span-full sm:col-span-1">
              <label className="text-xs font-bold text-muted-foreground">الوظيفة</label>
              <CustomSelect value={form.staffType} onChange={(v) => update("staffType", v)} options={STAFF_TYPE_OPTIONS} />
            </div>

            <div className="space-y-1.5 col-span-full sm:col-span-1">
              <label className="text-xs font-bold text-muted-foreground">التخصص (اختياري)</label>
              <input
                type="text"
                value={form.specialty}
                onChange={(e) => update("specialty", e.target.value)}
                placeholder="مثال: علاج طبيعي"
                className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm"
              />
            </div>

            <div className="space-y-1.5 col-span-full sm:col-span-1">
              <label className="text-xs font-bold text-muted-foreground">النوع (اختياري)</label>
              <CustomSelect
                value={form.gender}
                onChange={(v) => update("gender", v)}
                options={GENDER_OPTIONS}
                placeholder="غير محدد"
              />
            </div>

            <div className="space-y-1.5 col-span-full sm:col-span-1">
              <label className="text-xs font-bold text-muted-foreground">رقم الهاتف (اختياري)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="01xxxxxxxxx"
                className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm"
              />
            </div>

            <div className="space-y-1.5 col-span-full sm:col-span-1">
              <label className="text-xs font-bold text-muted-foreground">صورة الملف الشخصي — رابط (اختياري)</label>
              <input
                type="text"
                value={form.avatar}
                onChange={(e) => update("avatar", e.target.value)}
                placeholder="https://..."
                className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm"
              />
            </div>
          </div>

          {isEdit && !hasAccount && (
            <label className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-primary/5 border border-primary/10 cursor-pointer">
              <input
                type="checkbox"
                checked={wantsAccount}
                onChange={(e) => setWantsAccount(e.target.checked)}
                className="h-4 w-4 accent-primary cursor-pointer"
              />
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-primary" />
                إنشاء حساب دخول لهذا العضو
              </span>
            </label>
          )}

          {showAccountFields && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border">
              <div className="space-y-1.5 col-span-full sm:col-span-1">
                <label className="text-xs font-bold text-muted-foreground">دور النظام (الصلاحيات)</label>
                <CustomSelect value={form.role} onChange={(v) => update("role", v)} options={TEAM_ROLE_OPTIONS} />
                {errors.role && <p className="text-[11px] text-destructive font-bold">{errors.role}</p>}
              </div>

              <div className="space-y-1.5 col-span-full sm:col-span-1">
                <label className="text-xs font-bold text-muted-foreground">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="name@medlink.com"
                  className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm"
                />
                {errors.email && <p className="text-[11px] text-destructive font-bold">{errors.email}</p>}
              </div>

              {showPasswordFields && (
                <>
                  <div className="space-y-1.5 col-span-full sm:col-span-1">
                    <label className="text-xs font-bold text-muted-foreground">اسم المستخدم (لتسجيل الدخول)</label>
                    <input
                      type="text"
                      value={form.username}
                      onChange={(e) => update("username", e.target.value)}
                      placeholder="username"
                      className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm"
                    />
                    {errors.username && <p className="text-[11px] text-destructive font-bold">{errors.username}</p>}
                  </div>
                  <div />
                  <div className="space-y-1.5 col-span-full sm:col-span-1">
                    <label className="text-xs font-bold text-muted-foreground">كلمة المرور</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      placeholder="••••••"
                      className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm"
                    />
                    {errors.password && <p className="text-[11px] text-destructive font-bold">{errors.password}</p>}
                  </div>
                  <div className="space-y-1.5 col-span-full sm:col-span-1">
                    <label className="text-xs font-bold text-muted-foreground">تأكيد كلمة المرور</label>
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => update("confirmPassword", e.target.value)}
                      placeholder="••••••"
                      className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm"
                    />
                    {errors.confirmPassword && (
                      <p className="text-[11px] text-destructive font-bold">{errors.confirmPassword}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl bg-muted text-foreground font-bold text-sm hover:bg-muted/80 transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isEdit ? "حفظ التعديلات" : "إضافة العضو وإنشاء حسابه"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
