import { useCallback, useEffect, useMemo, useState } from "react";
import * as authService from "../auth/authService";
import { toast } from "../utils/toast";
import { AuthContext } from "./authContextInstance";

export function AuthProvider({ children }) {
  const [initialSession] = useState(() => authService.loadSession());
  const [user, setUser] = useState(initialSession?.user ?? null);
  const [isInitializing, setIsInitializing] = useState(() => {
    return Boolean(
      localStorage.getItem("medlink_token") && !initialSession?.expired,
    );
  });

  useEffect(() => {
    let isMounted = true;

    async function syncCurrentUser() {
      const token = localStorage.getItem("medlink_token");
      if (!token) {
        if (isMounted) setIsInitializing(false);
        return;
      }

      try {
        const freshUser = await authService.getMe();
        if (isMounted && freshUser) {
          setUser(freshUser);
          authService.saveSession(freshUser, token);
        }
      } catch {
        try {
          await authService.refreshToken();
          const freshUserAfterRefresh = await authService.getMe();
          if (isMounted && freshUserAfterRefresh) {
            setUser(freshUserAfterRefresh);
          }
        } catch {
          // Session expired or invalid
        }
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    }

    if (initialSession?.expired) {
      toast.info("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى");
    } else if (localStorage.getItem("medlink_token")) {
      syncCurrentUser();
    }

    let refreshTimeout = null;

    function scheduleAutoRefresh() {
      const currentToken = localStorage.getItem("medlink_token");
      if (!currentToken) return;

      let delayMs = 10 * 60 * 1000;
      try {
        if (currentToken.includes(".")) {
          const payloadPart = currentToken.split(".")[1];
          const payload = JSON.parse(atob(payloadPart));
          if (payload.exp) {
            const expTimeMs = payload.exp * 1000;
            const timeUntilExp = expTimeMs - Date.now();
            delayMs = Math.max(30 * 1000, timeUntilExp - 2 * 60 * 1000);
          }
        }
      } catch {
        delayMs = 10 * 60 * 1000;
      }

      if (refreshTimeout) clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(async () => {
        if (!isMounted) return;
        try {
          await authService.refreshToken();
        } catch {
          // background refresh fallback
        }
        scheduleAutoRefresh();
      }, delayMs);
    }

    scheduleAutoRefresh();

    return () => {
      isMounted = false;
      if (refreshTimeout) clearTimeout(refreshTimeout);
    };
  }, [initialSession]);

  const login = useCallback(async (username, password) => {
    const loggedInUser = await authService.login(username, password);
    setUser(loggedInUser);

    try {
      const serverUser = await authService.getMe();
      if (serverUser) {
        const combined = { ...loggedInUser, ...serverUser };
        setUser(combined);
        authService.saveSession(combined);
        return combined;
      }
    } catch {
      // ignore
    }

    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      await authService.refreshToken();
      const freshUser = await authService.getMe();
      if (freshUser) {
        setUser(freshUser);
        toast.success("تم تجديد الجلسة بنجاح");
      }
    } catch (err) {
      toast.error(err.message || "فشل تجديد الجلسة");
    }
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
      isInitializing,
      login,
      logout,
      refreshSession,
      updateUser,
    }),
    [user, isInitializing, login, logout, refreshSession, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
