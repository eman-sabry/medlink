import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useInvoices } from "./useInvoices";
import { usePayments } from "./usePayments";
import { usePatients } from "./usePatients";
import { useAppointments } from "./useAppointments";
import {
  computeNetPaid,
  computeRemainingBalance,
  computePaymentStatus,
} from "../utils/billing";

const EMPTY_ARRAY = [];

function useResource(key, endpoint) {
  return useQuery({
    queryKey: [key],
    queryFn: () => apiRequest(endpoint),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useInvoice(invoiceId) {
  const { invoices, updateInvoice, deleteInvoice, isUpdating, isDeleting } = useInvoices();
  const { payments: allPayments, addPayment, isAddingPayment } = usePayments();
  const { patients } = usePatients();
  const { appointments, doctors } = useAppointments();

  const itemsQuery = useResource("invoice_items", "/invoice_items");
  const refundsQuery = useResource("payment_refunds", "/payment_refunds");
  const servicesQuery = useResource("services", "/services");
  const staffQuery = useResource("staff", "/staff");
  const usersQuery = useResource("users", "/users");

  const itemsAll = itemsQuery.data ?? EMPTY_ARRAY;
  const refundsAll = refundsQuery.data ?? EMPTY_ARRAY;
  const servicesList = servicesQuery.data ?? EMPTY_ARRAY;
  const staffList = staffQuery.data ?? EMPTY_ARRAY;
  const usersList = usersQuery.data ?? EMPTY_ARRAY;

  const invoice = useMemo(() => invoices.find((i) => i.id === invoiceId) ?? null, [invoices, invoiceId]);

  const items = useMemo(() => {
    const servicesById = new Map(servicesList.map((s) => [s.id, s]));
    return itemsAll
      .filter((it) => it.invoice_id === invoiceId)
      .map((it) => ({ ...it, serviceName: servicesById.get(it.service_id)?.name ?? it.description }));
  }, [itemsAll, invoiceId, servicesList]);

  const payments = useMemo(() => {
    const usersById = new Map(usersList.map((u) => [u.id, u]));
    return allPayments
      .filter((p) => p.invoice_id === invoiceId)
      .map((p) => ({ ...p, receivedByName: usersById.get(p.received_by_user_id)?.full_name ?? "—" }))
      .sort((a, b) => new Date(b.paid_at ?? 0) - new Date(a.paid_at ?? 0));
  }, [allPayments, invoiceId, usersList]);

  const refunds = useMemo(
    () => refundsAll.filter((r) => payments.some((p) => p.id === r.payment_id)),
    [refundsAll, payments],
  );

  const relatedAppointment = useMemo(
    () => appointments.find((a) => a.id === invoice?.appointment_id) ?? null,
    [appointments, invoice],
  );

  const patient = useMemo(
    () => patients.find((p) => p.id === invoice?.patient_id) ?? null,
    [patients, invoice],
  );

  const doctorName = useMemo(() => {
    const doctorId = invoice?.doctor_id ?? relatedAppointment?.doctor_id;
    return staffList.find((s) => s.id === doctorId)?.full_name ?? relatedAppointment?.doctor_name ?? null;
  }, [invoice, relatedAppointment, staffList]);

  const enriched = useMemo(() => {
    if (!invoice) return null;
    const netPaid = computeNetPaid(payments, refunds);
    const balanceDue = computeRemainingBalance(invoice.total_amount ?? 0, netPaid);
    const computedStatus = computePaymentStatus({ total: invoice.total_amount ?? 0, netPaid });
    return {
      ...invoice,
      patient,
      doctorName,
      relatedAppointment,
      items,
      payments,
      netPaid,
      balanceDue,
      computedStatus,
    };
  }, [invoice, patient, doctorName, relatedAppointment, items, payments, refunds]);

  const isLoading =
    itemsQuery.isLoading || refundsQuery.isLoading || servicesQuery.isLoading || staffQuery.isLoading || usersQuery.isLoading;

  return {
    isLoading,
    invoice: enriched,
    doctors,
    updateInvoice,
    deleteInvoice,
    isUpdating,
    isDeleting,
    addPayment,
    isAddingPayment,
  };
}
