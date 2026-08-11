import { useCallback, useEffect, useMemo, useState } from "react";
import * as authService from "../auth/authService";
import { toast } from "../utils/toast";
import { AuthContext } from "./authContextInstance";

export function AuthProvider({ children }) {
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
