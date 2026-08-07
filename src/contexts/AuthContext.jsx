import { useCallback, useEffect, useMemo, useState } from "react";
import * as authService from "../auth/authService";
import { toast } from "../utils/toast";
import { AuthContext } from "./authContextInstance";

export function AuthProvider({ children }) {
  // القراءة من localStorage متزامنة، لذا يمكن حساب الحالة الأولية مباشرة
  // بدل انتظار useEffect (يتجنب setState داخل effect وأي وميض لصفحة تسجيل الدخول)
  const [initialSession] = useState(() => authService.loadSession());
  const [user, setUser] = useState(initialSession?.user ?? null);

  useEffect(() => {
    if (initialSession?.expired) {
      toast.info("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى");
    }
  }, [initialSession]);

  const login = useCallback(async (username, password) => {
    const loggedInUser = await authService.login(username, password);
    authService.saveSession(loggedInUser);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(() => {
    authService.clearSession();
    setUser(null);
  }, []);

  // تحديث بيانات المستخدم الحالي محلياً (بعد نجاح تعديل الملف الشخصي) دون الحاجة لتسجيل الدخول من جديد
  const updateUser = useCallback((partialUser) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partialUser };
      authService.saveSession(updated);
      return updated;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      isAuthenticated: Boolean(user),
      login,
      logout,
      updateUser,
    }),
    [user, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
