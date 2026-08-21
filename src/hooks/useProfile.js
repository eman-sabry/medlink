import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useAuth } from "./useAuth";
import { toast } from "../utils/toast";
import {
  changePassword as authChangePassword,
  getSessions as authGetSessions,
  deleteSession as authDeleteSession,
  logoutAll as authLogoutAll,
} from "../auth/authService";

export function useProfile() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const userRes = await apiRequest(`/users/${user?.id || "current"}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });

      const staffId = user?.staffId || user?.staff_id;
      if (staffId) {
        try {
          await apiRequest(`/staff/${staffId}`, {
            method: "PATCH",
            body: JSON.stringify({
              full_name: data.full_name,
              phone: data.phone,
              email_normalized: data.email,
            }),
          });
        } catch {
          // ignore staff update failure
        }
      }

      return userRes;
    },
    onSuccess: (_, variables) => {
      updateUser(variables);
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("تم تحديث الملف الشخصي بنجاح");
    },
    onError: () => toast.error("فشل تحديث الملف الشخصي"),
  });

  const changePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }) => {
      return authChangePassword(currentPassword, newPassword);
    },
    onSuccess: () => toast.success("تم تغيير كلمة المرور بنجاح"),
    onError: (error) => toast.error(error.message || "فشل تغيير كلمة المرور"),
  });

  const sessionsQuery = useQuery({
    queryKey: ["auth-sessions"],
    queryFn: authGetSessions,
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId) => authDeleteSession(sessionId),
    onMutate: async (sessionId) => {
      await queryClient.cancelQueries({ queryKey: ["auth-sessions"] });
      const previousSessions = queryClient.getQueryData(["auth-sessions"]);
      const normId = String(sessionId).trim().toLowerCase();
      queryClient.setQueryData(["auth-sessions"], (old = []) => {
        if (!Array.isArray(old)) return [];
        return old.filter((s) => String(s.sessionId || s.id || "").trim().toLowerCase() !== normId);
      });
      return { previousSessions };
    },
    onSuccess: (_, sessionId) => {
      toast.success("تم إنهاء الجلسة بنجاح");
      const normId = String(sessionId).trim().toLowerCase();
      queryClient.setQueryData(["auth-sessions"], (old = []) => {
        if (!Array.isArray(old)) return [];
        return old.filter((s) => String(s.sessionId || s.id || "").trim().toLowerCase() !== normId);
      });
      queryClient.invalidateQueries({ queryKey: ["auth-sessions"] });
    },
    onError: (err, _sessionId, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(["auth-sessions"], context.previousSessions);
      }
      toast.error(err.message || "فشل إنهاء الجلسة");
    },
  });

  const logoutAllMutation = useMutation({
    mutationFn: async () => {
      return authLogoutAll();
    },
    onSuccess: () => {
      toast.success("تم تسجيل الخروج من جميع الأجهزة");
      queryClient.setQueryData(["auth-sessions"], (old = []) => {
        if (!Array.isArray(old)) return [];
        return old.filter((s) => Boolean(s.current || s.isCurrent));
      });
      queryClient.invalidateQueries({ queryKey: ["auth-sessions"] });
    },
    onError: (err) => toast.error(err.message || "فشل تسجيل الخروج من الأجهزة"),
  });

  return {
    user,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    sessions: sessionsQuery.data || [],
    isLoadingSessions: sessionsQuery.isLoading,
    refetchSessions: sessionsQuery.refetch,
    deleteSession: deleteSessionMutation.mutateAsync,
    isDeletingSession: deleteSessionMutation.isPending,
    logoutAll: logoutAllMutation.mutateAsync,
    isLoggingOutAll: logoutAllMutation.isPending,
  };
}

