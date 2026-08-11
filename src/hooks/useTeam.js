import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { toast } from "../utils/toast";
import { useAuth } from "./useAuth";
import { logActivity, ACTIVITY_ACTIONS } from "../helpers/activityLog.helpers";
import { enrichTeamMembers } from "../helpers/team.helpers";

const EMPTY_ARRAY = [];

async function assertEmailAvailable(email, excludeUserId) {
    if (!email) return;
    const matches = await apiRequest(`/users?email=${encodeURIComponent(email)}`);
    const clash = matches.find((u) => u.id !== excludeUserId);
    if (clash) {
        const error = new Error("هذا البريد الإلكتروني مستخدَم بالفعل");
        error.code = "DUPLICATE_EMAIL";
        throw error;
    }
}

async function assertUsernameAvailable(username, excludeUserId) {
    if (!username) return;
    const matches = await apiRequest(`/users?username=${encodeURIComponent(username)}`);
    const clash = matches.find((u) => u.id !== excludeUserId);
    if (clash) {
        const error = new Error("اسم المستخدم هذا مستخدَم بالفعل");
        error.code = "DUPLICATE_USERNAME";
        throw error;
    }
}

function buildStaffPayload({ fullName, staffType, specialty, gender, supervisorStaffId }) {
    return {
        full_name: fullName,
        staff_type: staffType,
        specialty: specialty || "",
        gender: gender || null,
        supervisor_staff_id: supervisorStaffId || null,
    };
}

function buildAccountErrorToast(error, fallback) {
    if (error.code === "DUPLICATE_EMAIL") return "هذا البريد الإلكتروني مستخدَم بالفعل";
    if (error.code === "DUPLICATE_USERNAME") return "اسم المستخدم هذا مستخدَم بالفعل";
    if (error.code === "ALREADY_HAS_ACCOUNT") return "يملك عضو الفريق هذا حساباً بالفعل";
    return error.message || fallback;
}

export function useTeam() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const staffQuery = useQuery({
        queryKey: ["staff"],
        queryFn: () => apiRequest("/staff"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
    const usersQuery = useQuery({
        queryKey: ["users"],
        queryFn: () => apiRequest("/users"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    const staffList = staffQuery.data ?? EMPTY_ARRAY;
    const usersList = usersQuery.data ?? EMPTY_ARRAY;

    const teamMembers = useMemo(() => enrichTeamMembers(staffList, usersList), [staffList, usersList]);

    function invalidateTeamQueries() {
        queryClient.invalidateQueries({ queryKey: ["staff"] });
        queryClient.invalidateQueries({ queryKey: ["users"] });
    }

    const addTeamMemberMutation = useMutation({
        mutationFn: async ({ role, email, phone, avatar, username, password, ...staffFields }) => {
            await assertEmailAvailable(email);
            await assertUsernameAvailable(username);

            const nowIso = new Date().toISOString();
            const staff = await apiRequest("/staff", {
                method: "POST",
                body: JSON.stringify({ ...buildStaffPayload(staffFields), created_at: nowIso }),
            });

            const account = await apiRequest("/users", {
                method: "POST",
                body: JSON.stringify({
                    username,
                    password,
                    full_name: staffFields.fullName,
                    email,
                    phone: phone || "",
                    avatar: avatar || "",
                    role,
                    status: "Active",
                    created_at: nowIso,
                    staff_id: staff.id,
                }),
            });

            logActivity({
                action: ACTIVITY_ACTIONS.TEAM_MEMBER_ADDED,
                actorUserId: user?.id,
                entityType: "staff",
                entityId: staff.id,
                details: `${staffFields.fullName} — ${role}`,
            });

            return { staff, account };
        },
        onSuccess: () => {
            invalidateTeamQueries();
            toast.success("تمت إضافة عضو الفريق وإنشاء حسابه بنجاح");
        },
        onError: (error) => toast.error(buildAccountErrorToast(error, "فشلت إضافة عضو الفريق")),
    });

    const updateTeamMemberMutation = useMutation({
        mutationFn: async ({ staffId, accountId, role, email, phone, avatar, ...staffFields }) => {
            if (accountId && email) await assertEmailAvailable(email, accountId);

            const staff = await apiRequest(`/staff/${staffId}`, {
                method: "PATCH",
                body: JSON.stringify(buildStaffPayload(staffFields)),
            });

            if (accountId) {
                await apiRequest(`/users/${accountId}`, {
                    method: "PATCH",
                    body: JSON.stringify({
                        full_name: staffFields.fullName,
                        role,
                        email,
                        phone: phone || "",
                        avatar: avatar || "",
                    }),
                });
            }

            logActivity({
                action: ACTIVITY_ACTIONS.TEAM_MEMBER_UPDATED,
                actorUserId: user?.id,
                entityType: "staff",
                entityId: staffId,
                details: staffFields.fullName,
            });

            return staff;
        },
        onSuccess: () => {
            invalidateTeamQueries();
            toast.success("تم تحديث بيانات عضو الفريق بنجاح");
        },
        onError: (error) => toast.error(buildAccountErrorToast(error, "فشل تحديث بيانات عضو الفريق")),
    });

    const createAccountMutation = useMutation({
        mutationFn: async ({ staffId, fullName, role, email, phone, avatar, username, password }) => {
            const existing = await apiRequest(`/users?staff_id=${staffId}`);
            if (existing.length > 0) {
                const error = new Error("يملك عضو الفريق هذا حساباً بالفعل");
                error.code = "ALREADY_HAS_ACCOUNT";
                throw error;
            }
            await assertEmailAvailable(email);
            await assertUsernameAvailable(username);

            const account = await apiRequest("/users", {
                method: "POST",
                body: JSON.stringify({
                    username,
                    password,
                    full_name: fullName,
                    email,
                    phone: phone || "",
                    avatar: avatar || "",
                    role,
                    status: "Active",
                    created_at: new Date().toISOString(),
                    staff_id: staffId,
                }),
            });

            logActivity({
                action: ACTIVITY_ACTIONS.TEAM_MEMBER_ADDED,
                actorUserId: user?.id,
                entityType: "staff",
                entityId: staffId,
                details: `إنشاء حساب دخول: ${fullName}`,
            });

            return account;
        },
        onSuccess: () => {
            invalidateTeamQueries();
            toast.success("تم إنشاء الحساب بنجاح");
        },
        onError: (error) => toast.error(buildAccountErrorToast(error, "فشل إنشاء الحساب")),
    });

    const toggleAccountStatusMutation = useMutation({
        mutationFn: async ({ accountId, nextStatus, staffId }) => {
            if (accountId === user?.id && nextStatus === "Inactive") {
                const error = new Error("لا يمكنك تعطيل حسابك الخاص");
                error.code = "CANNOT_DEACTIVATE_SELF";
                throw error;
            }
            const result = await apiRequest(`/users/${accountId}`, {
                method: "PATCH",
                body: JSON.stringify({ status: nextStatus }),
            });

            logActivity({
                action: ACTIVITY_ACTIONS.TEAM_MEMBER_ACCOUNT_STATUS_CHANGED,
                actorUserId: user?.id,
                entityType: "staff",
                entityId: staffId,
                details: nextStatus === "Active" ? "تفعيل الحساب" : "تعطيل الحساب",
            });

            return result;
        },
        onSuccess: (_, { nextStatus }) => {
            invalidateTeamQueries();
            toast.success(nextStatus === "Active" ? "تم تفعيل الحساب بنجاح" : "تم تعطيل الحساب بنجاح");
        },
        onError: (error) => toast.error(error.message || "فشل تحديث حالة الحساب"),
    });

    return {
        teamMembers,
        isLoading: staffQuery.isLoading || usersQuery.isLoading,
        isError: staffQuery.isError || usersQuery.isError,
        refetch: () => {
            staffQuery.refetch();
            usersQuery.refetch();
        },
        addTeamMember: addTeamMemberMutation.mutateAsync,
        isAdding: addTeamMemberMutation.isPending,
        updateTeamMember: updateTeamMemberMutation.mutateAsync,
        isUpdating: updateTeamMemberMutation.isPending,
        createAccount: createAccountMutation.mutateAsync,
        isCreatingAccount: createAccountMutation.isPending,
        toggleAccountStatus: toggleAccountStatusMutation.mutateAsync,
        isTogglingStatus: toggleAccountStatusMutation.isPending,
    };
}
