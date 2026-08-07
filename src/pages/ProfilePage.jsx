import { useState } from "react";
import { Loader2, Lock, Mail, Phone, Save, User } from "lucide-react";
import { useProfile } from "../hooks/useProfile";
import { ROLE_LABELS } from "../permissions/roles";
import { toast } from "../utils/toast";

export default function ProfilePage() {
  const { user, updateProfile, isUpdatingProfile, changePassword, isChangingPassword } =
    useProfile();

  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(profileForm);
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
              value={profileForm.full_name}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, full_name: e.target.value }))
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
              value={profileForm.email}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, email: e.target.value }))
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
              value={profileForm.phone}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
              }
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
    </div>
  );
}
