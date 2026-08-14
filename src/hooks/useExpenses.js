import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { toast } from "../utils/toast";
import { logActivity, ACTIVITY_ACTIONS } from "../helpers/activityLog.helpers";
import { EXPENSE_STATUS } from "../helpers/expense.helpers";
import { useAuth } from "./useAuth";
import { createNotification } from "../services/notificationService";
import { NOTIFICATION_TYPES, NOTIFICATION_SEVERITIES } from "../constants/notificationTypes";
import { ROLES } from "../permissions/roles";

export const DUPLICATE_EXPENSE_ERROR = "DUPLICATE_EXPENSE";

export async function findExpenseBySource(sourceType, sourceId) {
  if (!sourceType || !sourceId || sourceType === "Manual") return null;
  const matches = await apiRequest(`/expenses?source_type=${sourceType}&source_id=${sourceId}`);
  return matches[0] ?? null;
}

const REAL_EXPENSE_FIELDS = [
  "description",
  "category",
  "source_type",
  "source_id",
  "amount",
  "date",
  "payment_method",
  "status",
  "notes",
  "created_by_user_id",
];

function pickExpenseFields(data) {
  return REAL_EXPENSE_FIELDS.reduce((acc, field) => {
    if (data[field] !== undefined) acc[field] = data[field];
    return acc;
  }, {});
}

export function useExpenses() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const expensesQuery = useQuery({
    queryKey: ["expenses"],
    queryFn: () => apiRequest("/expenses"),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const archivedItemsQuery = useQuery({
    queryKey: ["archived_items"],
    queryFn: () => apiRequest("/archived_items"),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const archivedExpenseIds = useMemo(
    () =>
      new Set(
        (archivedItemsQuery.data ?? [])
          .filter((item) => item.entity_type === "expense")
          .map((item) => item.entity_id),
      ),
    [archivedItemsQuery.data],
  );

  const addExpenseMutation = useMutation({
    mutationFn: async (expense) => {
      if (!(Number(expense.amount) > 0)) {
        throw new Error("قيمة المصروف يجب أن تكون أكبر من صفر");
      }
      if (expense.source_id) {
        const existing = await findExpenseBySource(expense.source_type, expense.source_id);
        if (existing) {
          const error = new Error("يوجد مصروف بالفعل مرتبط بهذا المصدر");
          error.code = DUPLICATE_EXPENSE_ERROR;
          error.existingExpense = existing;
          throw error;
        }
      }

      const now = new Date().toISOString();
      const created = await apiRequest("/expenses", {
        method: "POST",
        body: JSON.stringify({
          ...pickExpenseFields(expense),
          created_by_user_id: expense.created_by_user_id ?? user?.id ?? null,
          created_at: now,
          updated_at: now,
        }),
      });

      logActivity({
        action: ACTIVITY_ACTIONS.EXPENSE_CREATED,
        actorUserId: user?.id,
        entityType: "expense",
        entityId: created.id,
        details: `${created.description ?? "—"} — ${created.amount} ج.م`,
      });

      return created;
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      if (created) {
        const isHigh = Number(created.amount) >= 2000;
        createNotification({
          type: isHigh ? NOTIFICATION_TYPES.EXPENSE_HIGH_ALERT : NOTIFICATION_TYPES.EXPENSE_CREATED,
          title: isHigh ? "تنبيه: مصروف مالي مرتفع" : "تسجيل مصروف جديد",
          message: `تم تسجيل مصروف "${created.description || "—"}" بمبلغ ${created.amount} ج.م`,
          severity: isHigh ? NOTIFICATION_SEVERITIES.WARNING : NOTIFICATION_SEVERITIES.INFO,
          entityType: "expense",
          entityId: created.id,
          targetRoles: [ROLES.OWNER],
        });
      }
      toast.success("تمت إضافة المصروف بنجاح");
    },
    onError: (error) => {
      if (error?.code === DUPLICATE_EXPENSE_ERROR) {
        toast.error("لا يمكن إضافة مصروف جديد — يوجد مصروف بالفعل مرتبط بهذا المصدر");
      } else {
        toast.error(error.message || "فشلت إضافة المصروف");
      }
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      if (data.amount !== undefined && !(Number(data.amount) > 0)) {
        throw new Error("قيمة المصروف يجب أن تكون أكبر من صفر");
      }
      const updated = await apiRequest(`/expenses/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ ...pickExpenseFields(data), updated_at: new Date().toISOString() }),
      });

      logActivity({
        action: ACTIVITY_ACTIONS.EXPENSE_UPDATED,
        actorUserId: user?.id,
        entityType: "expense",
        entityId: id,
        details: `${updated.description ?? "—"} — ${updated.amount} ج.م`,
      });

      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("تم تحديث المصروف بنجاح");
    },
    onError: (error) => toast.error(error.message || "فشل تحديث المصروف"),
  });

  const archiveExpenseMutation = useMutation({
    mutationFn: async (payload) => {
      const id = typeof payload === "object" && payload !== null ? payload.id : payload;
      const deleteReason = typeof payload === "object" && payload !== null ? payload.deleteReason : "طلب حذف المصروف";
      const expenseData = typeof payload === "object" && payload !== null ? payload.expense : (expensesQuery.data ?? []).find((e) => e.id === id);

      return await apiRequest("/archive/move", {
        method: "POST",
        body: JSON.stringify({
          entity_type: "expense",
          entity_id: String(id),
          delete_reason: deleteReason || "طلب حذف المصروف",
          archived_by: user?.full_name || "المسؤول",
          archived_by_user_id: user?.id || null,
          title: expenseData?.description || expenseData?.title || "مصروف إداري / عيادي",
          subtitle: expenseData?.category ? `تصنيف: ${expenseData.category}` : "مصروف",
          secondary_info: `${Number(expenseData?.amount || 0).toLocaleString("en-US")} ج.م`,
          original_data: expenseData,
        }),
      });
    },
    onSuccess: (archivedRecord, variables) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["archived_items"] });
      const id = typeof variables === "object" ? variables.id : variables;
      logActivity({
        action: ACTIVITY_ACTIONS.EXPENSE_ARCHIVED,
        actorUserId: user?.id,
        entityType: "expense",
        entityId: id,
        details: `نقل المصروف إلى سلة المحذوفات: ${archivedRecord?.title || id}`,
      });
      toast.success("تم نقل المصروف إلى سلة المحذوفات بنجاح");
    },
    onError: () => toast.error("فشل نقل المصروف إلى سلة المحذوفات"),
  });

  const restoreExpenseMutation = useMutation({
    mutationFn: async (expense) => {
      return await apiRequest(`/archive/${expense.id}/restore`, {
        method: "POST",
        body: JSON.stringify({ id: expense.id }),
      });
    },
    onSuccess: (_, expense) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["archived_items"] });
      logActivity({
        action: ACTIVITY_ACTIONS.EXPENSE_RESTORED,
        actorUserId: user?.id,
        entityType: "expense",
        entityId: expense.id,
        details: `استعادة المصروف من الأرشيف: ${expense.description || expense.id}`,
      });
      toast.success("تمت استعادة المصروف بنجاح");
    },
    onError: () => toast.error("فشلت استعادة المصروف"),
  });

  const ensureExpenseForMaintenance = async ({ maintenance, actorUserId }) => {
    if (!maintenance?.id || maintenance.status !== "Completed" || !(Number(maintenance.cost) > 0)) {
      return null;
    }

    const existing = await findExpenseBySource("Maintenance", maintenance.id);
    const actor = actorUserId ?? user?.id ?? null;

    if (existing) {
      if (Number(existing.amount) === Number(maintenance.cost)) return existing;

      const updated = await apiRequest(`/expenses/${existing.id}`, {
        method: "PATCH",
        body: JSON.stringify({ amount: Number(maintenance.cost), updated_at: new Date().toISOString() }),
      });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      logActivity({
        action: ACTIVITY_ACTIONS.MAINTENANCE_EXPENSE_UPDATED,
        actorUserId: actor,
        entityType: "expense",
        entityId: existing.id,
        details: `تحديث تكلفة الصيانة: ${existing.amount} → ${maintenance.cost} ج.م`,
      });
      toast.success("تم تحديث مصروف الصيانة المرتبط تلقائياً");
      return updated;
    }

    const now = new Date().toISOString();
    const created = await apiRequest("/expenses", {
      method: "POST",
      body: JSON.stringify({
        description: maintenance.reason || "تكلفة صيانة",
        category: "Maintenance",
        source_type: "Maintenance",
        source_id: maintenance.id,
        amount: Number(maintenance.cost),
        date: maintenance.completed_at || now,
        payment_method: "Cash",
        status: EXPENSE_STATUS.PAID,
        notes: null,
        created_by_user_id: actor,
        created_at: now,
        updated_at: now,
      }),
    });
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
    logActivity({
      action: ACTIVITY_ACTIONS.MAINTENANCE_EXPENSE_CREATED,
      actorUserId: actor,
      entityType: "expense",
      entityId: created.id,
      details: `${created.description} — ${created.amount} ج.م`,
    });
    toast.success("تم إنشاء مصروف صيانة تلقائياً وربطه بالسجل");
    return created;
  };

  return {
    ...expensesQuery,
    expenses: expensesQuery.data ?? [],
    archivedExpenseIds,
    addExpense: addExpenseMutation.mutateAsync,
    updateExpense: (id, data) => updateExpenseMutation.mutateAsync({ id, data }),
    archiveExpense: archiveExpenseMutation.mutateAsync,
    restoreExpense: restoreExpenseMutation.mutateAsync,
    ensureExpenseForMaintenance,
    isAdding: addExpenseMutation.isPending,
    isUpdating: updateExpenseMutation.isPending,
    isArchiving: archiveExpenseMutation.isPending,
    isRestoring: restoreExpenseMutation.isPending,
  };
}
