import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { toast } from "../utils/toast";
import { generateInvoiceNumber } from "../utils/billing";
import { logActivity, ACTIVITY_ACTIONS } from "../helpers/activityLog.helpers";
import { useAuth } from "./useAuth";
import { hasPermission } from "../permissions/permissions";

export const DUPLICATE_INVOICE_ERROR = "DUPLICATE_INVOICE";

export async function findInvoiceByAppointment(appointmentId) {
  if (!appointmentId) return null;
  const matches = await apiRequest(`/invoices?appointment_id=${appointmentId}`);
  return matches[0] ?? null;
}

async function generateUniqueInvoiceNumber() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const currentInvoices = await apiRequest("/invoices");
    const candidate = generateInvoiceNumber(currentInvoices);
    const clash = await apiRequest(`/invoices?invoice_no=${encodeURIComponent(candidate)}`);
    if (clash.length === 0) return candidate;
  }
  return `${generateInvoiceNumber(await apiRequest("/invoices"))}-${Date.now().toString().slice(-4)}`;
}

export function useInvoices() {
  const queryClient = useQueryClient();
  const { user, role } = useAuth();

  const invoicesQuery = useQuery({
    queryKey: ["invoices"],
    queryFn: () => apiRequest("/invoices"),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const archivedItemsQuery = useQuery({
    queryKey: ["archived_items"],
    queryFn: () => apiRequest("/archived_items"),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const archivedInvoiceIds = useMemo(
    () =>
      new Set(
        (archivedItemsQuery.data ?? [])
          .filter((item) => item.entity_type === "invoice")
          .map((item) => item.entity_id),
      ),
    [archivedItemsQuery.data],
  );

  const addInvoiceMutation = useMutation({
    mutationFn: async ({ invoice, items = [] }) => {
      if (!hasPermission(role, "billing:create")) {
        const error = new Error("لا تملك صلاحية إنشاء فاتورة");
        error.code = "FORBIDDEN";
        throw error;
      }
      if (invoice.appointment_id) {
        const existing = await findInvoiceByAppointment(invoice.appointment_id);
        if (existing) {
          const error = new Error("توجد فاتورة بالفعل لهذا العنصر");
          error.code = DUPLICATE_INVOICE_ERROR;
          error.existingInvoice = existing;
          throw error;
        }
      }

      const invoiceNo = invoice.invoice_no || (await generateUniqueInvoiceNumber());

      const createdInvoice = await apiRequest("/invoices", {
        method: "POST",
        body: JSON.stringify({ ...invoice, invoice_no: invoiceNo }),
      });

      await Promise.all(
        items.map((item) =>
          apiRequest("/invoice_items", {
            method: "POST",
            body: JSON.stringify({ ...item, invoice_id: createdInvoice.id }),
          }),
        ),
      );

      logActivity({
        action: ACTIVITY_ACTIONS.INVOICE_CREATED,
        actorUserId: user?.id,
        patientId: createdInvoice.patient_id,
        entityType: "invoice",
        entityId: createdInvoice.id,
        details: `${createdInvoice.invoice_no} — ${createdInvoice.total_amount} ج.م`,
      });

      return createdInvoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice_items"] });
      toast.success("تم إنشاء الفاتورة بنجاح");
    },
    onError: (error) => {
      if (error?.code === DUPLICATE_INVOICE_ERROR) {
        toast.error("لا يمكن إنشاء فاتورة جديدة — توجد فاتورة بالفعل لهذا العنصر");
      } else if (error?.code === "FORBIDDEN") {
        toast.error(error.message);
      } else {
        toast.error("فشل إنشاء الفاتورة");
      }
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const previous = (invoicesQuery.data ?? []).find((inv) => inv.id === id);
      const updated = await apiRequest(`/invoices/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      const methodChanged =
        previous && data.payment_method !== undefined && previous.payment_method !== data.payment_method;

      logActivity({
        action: methodChanged ? ACTIVITY_ACTIONS.PAYMENT_METHOD_CHANGED : ACTIVITY_ACTIONS.INVOICE_UPDATED,
        actorUserId: user?.id,
        patientId: data.patient_id ?? previous?.patient_id,
        entityType: "invoice",
        entityId: id,
        details: methodChanged ? `${previous?.payment_method ?? "—"} → ${data.payment_method ?? "—"}` : null,
      });

      return updated;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      const previous = (invoicesQuery.data ?? []).find((inv) => inv.id === variables.id);
      const methodChanged =
        previous && variables.data.payment_method !== undefined && previous.payment_method !== variables.data.payment_method;
      toast.success(methodChanged ? "تم تحديث طريقة الدفع بنجاح" : "تم تحديث الفاتورة بنجاح");
    },
    onError: () => toast.error("فشل تحديث الفاتورة"),
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id) => {
      const [items, payments] = await Promise.all([
        apiRequest(`/invoice_items?invoice_id=${id}`),
        apiRequest(`/payments?invoice_id=${id}`),
      ]);
      await Promise.all(items.map((item) => apiRequest(`/invoice_items/${item.id}`, { method: "DELETE" })));
      await Promise.all(payments.map((p) => apiRequest(`/payments/${p.id}`, { method: "DELETE" })));
      return apiRequest(`/invoices/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice_items"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("تم حذف الفاتورة بنجاح");
    },
    onError: () => toast.error("فشل حذف الفاتورة"),
  });

  const archiveInvoiceMutation = useMutation({
    mutationFn: async (invoice) =>
      apiRequest("/archived_items", {
        method: "POST",
        body: JSON.stringify({
          entity_type: "invoice",
          entity_id: invoice.id,
          archived_by_user_id: user?.id ?? null,
          archived_at: new Date().toISOString(),
        }),
      }),
    onSuccess: (_, invoice) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["archived_items"] });
      logActivity({
        action: ACTIVITY_ACTIONS.INVOICE_ARCHIVED,
        actorUserId: user?.id,
        patientId: invoice.patient_id,
        entityType: "invoice",
        entityId: invoice.id,
      });
      toast.success("تم أرشفة الفاتورة بنجاح");
    },
    onError: () => toast.error("فشلت أرشفة الفاتورة"),
  });

  const restoreInvoiceMutation = useMutation({
    mutationFn: async (invoice) => {
      const matches = await apiRequest(`/archived_items?entity_type=invoice&entity_id=${invoice.id}`);
      await Promise.all(matches.map((m) => apiRequest(`/archived_items/${m.id}`, { method: "DELETE" })));
    },
    onSuccess: (_, invoice) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["archived_items"] });
      logActivity({
        action: ACTIVITY_ACTIONS.INVOICE_RESTORED,
        actorUserId: user?.id,
        patientId: invoice.patient_id,
        entityType: "invoice",
        entityId: invoice.id,
      });
      toast.success("تمت استعادة الفاتورة بنجاح");
    },
    onError: () => toast.error("فشلت استعادة الفاتورة"),
  });

  return {
    ...invoicesQuery,
    invoices: invoicesQuery.data ?? [],
    archivedInvoiceIds,
    addInvoice: addInvoiceMutation.mutateAsync,
    updateInvoice: updateInvoiceMutation.mutateAsync,
    deleteInvoice: deleteInvoiceMutation.mutateAsync,
    archiveInvoice: archiveInvoiceMutation.mutateAsync,
    restoreInvoice: restoreInvoiceMutation.mutateAsync,
    isAdding: addInvoiceMutation.isPending,
    isUpdating: updateInvoiceMutation.isPending,
    isDeleting: deleteInvoiceMutation.isPending,
    isArchiving: archiveInvoiceMutation.isPending,
    isRestoring: restoreInvoiceMutation.isPending,
  };
}
