import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as authService from "../auth/authService";
import { apiRequest } from "../api/client";
import { toast } from "../utils/toast";
import { AuthContext } from "./authContextInstance";

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [initialSession] = useState(() => authService.loadSession());
  const [user, setUser] = useState(initialSession?.user ?? null);
  const [isInitializing, setIsInitializing] = useState(() => {
    return Boolean(
      localStorage.getItem("medlink_token") && !initialSession?.expired,
    );
  });

  // Ref to hold the auto-refresh timer so logout() can cancel it from outside the effect.
  const refreshTimeoutRef = useRef(null);

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

      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = setTimeout(async () => {
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
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, [initialSession]);

  const login = useCallback(async (username, password) => {
    // Clear any stale React Query cache from a previous session so the
    // dashboard queries will fetch fresh data after navigation.
    queryClient.removeQueries();

    const loggedInUser = await authService.login(username, password);
    setUser(loggedInUser);
    return loggedInUser;
  }, [queryClient]);

  const logout = useCallback(async () => {
    // 1. Cancel any pending auto-refresh timer to prevent it from
    //    restoring state after we clear it.
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    // 2. Clear React state and localStorage synchronously FIRST,
    //    so the very next render sees isAuthenticated === false.
    //    This prevents the dashboard flash.
    setUser(null);
    authService.clearSession();

    // Purge all React Query cached data from this session so a
    // subsequent login starts with a clean slate.
    queryClient.removeQueries();

    // 3. Fire-and-forget the server-side logout (best-effort).
    //    We don't await this because the local state is already clean.
    try {
      await apiRequest("/api/v1/auth/logout", {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      // Server-side logout is best-effort; local session is already cleared.
    }
  }, [queryClient]);

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
