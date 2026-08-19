import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { toast } from "../utils/toast";
import { PAYMENT_STATUS } from "../utils/billing";
import { logActivity, ACTIVITY_ACTIONS } from "../helpers/activityLog.helpers";
import { useAuth } from "./useAuth";
import { hasPermission } from "../permissions/permissions";
import { createNotification } from "../services/notificationService";
import { NOTIFICATION_TYPES, NOTIFICATION_SEVERITIES } from "../constants/notificationTypes";
import { ROLES } from "../permissions/roles";

export function usePayments() {
  const queryClient = useQueryClient();
  const { user, role } = useAuth();

  const paymentsQuery = useQuery({
    queryKey: ["payments"],
    queryFn: () => apiRequest("/payments"),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const addPaymentMutation = useMutation({
    mutationFn: async ({ remainingBalance, amount, patientId, ...payment }) => {
      if (!hasPermission(user || role, "billing:record_payment")) {
        const error = new Error("لا تملك صلاحية تسجيل دفعة");
        error.code = "FORBIDDEN";
        throw error;
      }
      if (amount > remainingBalance + 0.01) {
        throw new Error("المبلغ المدخل أكبر من الرصيد المتبقي على الفاتورة");
      }
      const created = await apiRequest("/payments", {
        method: "POST",
        body: JSON.stringify({ ...payment, amount }),
      });

      if (payment.invoice_id) {
        const newStatus = amount >= remainingBalance - 0.01 ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PARTIAL;
        await apiRequest(`/invoices/${payment.invoice_id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: newStatus }),
        });
      }

      logActivity({
        action: ACTIVITY_ACTIONS.PAYMENT_RECORDED,
        actorUserId: user?.id,
        patientId,
        entityType: "payment",
        entityId: created.id,
        details: `${amount} ج.م — ${payment.method}`,
      });

      return created;
    },
    onSuccess: (created, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });

      if (created) {
        createNotification({
          type: NOTIFICATION_TYPES.PAYMENT_RECEIVED,
          title: "تحصيل دفعة مالية",
          message: `تم استلام دفعة بقيمة ${variables.amount ?? 0} ج.م (${variables.method || "نقدي"})`,
          severity: NOTIFICATION_SEVERITIES.SUCCESS,
          entityType: "payment",
          entityId: created.id,
          targetRoles: [ROLES.OWNER, ROLES.SECRETARY],
          metadata: {
            amount: variables.amount,
            invoice_id: variables.invoice_id,
            patient_id: variables.patientId,
          },
        });
      }

      toast.success("تم تسجيل الدفع بنجاح");
    },
    onError: (error) => toast.error(error.message || "فشل تسجيل الدفع"),
  });

  return {
    ...paymentsQuery,
    payments: paymentsQuery.data ?? [],
    addPayment: addPaymentMutation.mutateAsync,
    isAddingPayment: addPaymentMutation.isPending,
  };
}
