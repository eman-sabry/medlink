import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useAuth } from "./useAuth";
import { toast } from "../utils/toast";

export function useProfile() {
  const { user, updateUser } = useAuth();

  const updateProfileMutation = useMutation({
    mutationFn: (data) =>
      apiRequest(`/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      updateUser(variables);
      toast.success("تم تحديث الملف الشخصي بنجاح");
    },
    onError: () => toast.error("فشل تحديث الملف الشخصي"),
  });

  const changePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }) => {
      const freshUser = await apiRequest(`/users/${user.id}`);
      if (freshUser.password !== currentPassword) {
        throw new Error("كلمة المرور الحالية غير صحيحة");
      }
      return apiRequest(`/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ password: newPassword }),
      });
    },
    onSuccess: () => toast.success("تم تغيير كلمة المرور بنجاح"),
    onError: (error) => toast.error(error.message || "فشل تغيير كلمة المرور"),
  });

  return {
    user,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
  };
}
