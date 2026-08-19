import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { toast } from "../utils/toast";
import { useAuth } from "./useAuth";
import { useInvoices, findInvoiceByAppointment, DUPLICATE_INVOICE_ERROR } from "./useInvoices";
import { usePayments } from "./usePayments";
import { logActivity, ACTIVITY_ACTIONS } from "../helpers/activityLog.helpers";
import { enrichPackages } from "../helpers/patientProfile.helpers";
import { isPackageUsable, findActivePackageForPatient } from "../helpers/patientPackages.helpers";
import { hasPermission } from "../permissions/permissions";

const EMPTY_ARRAY = [];

// Shared billing engine: package coverage, session consumption, individual invoicing
export async function consumePackageSession(queryClient, { patientPackageId, treatmentSessionId, actorUserId, patientId }) {
    const existing = await apiRequest(`/package_session_usages?treatment_session_id=${treatmentSessionId}`);
    const activeExisting = existing.find((u) => !u.reversed_at);
    if (activeExisting) return activeExisting;

    const now = new Date().toISOString();
    const usage = await apiRequest("/package_session_usages", {
        method: "POST",
        body: JSON.stringify({
            patient_package_id: patientPackageId,
            treatment_session_id: treatmentSessionId,
            quantity: 1,
            consumed_at: now,
            reversed_at: null,
        }),
    });

    const pkg = await apiRequest(`/patient_packages/${patientPackageId}`);
    await apiRequest(`/patient_packages/${patientPackageId}`, {
        method: "PATCH",
        body: JSON.stringify({ sessions_used_cache: (pkg?.sessions_used_cache ?? 0) + 1 }),
    });

    logActivity({
        action: ACTIVITY_ACTIONS.PACKAGE_SESSION_DEDUCTED,
        actorUserId,
        patientId,
        entityType: "session",
        entityId: treatmentSessionId,
        details: "خصم جلسة من الباقة",
    });

    queryClient.invalidateQueries({ queryKey: ["package_session_usages"] });
    queryClient.invalidateQueries({ queryKey: ["patient_packages"] });

    return usage;
}

export async function linkAppointmentToPackage(queryClient, { appointmentId, patientPackageId }) {
    await apiRequest(`/appointments/${appointmentId}`, {
        method: "PATCH",
        body: JSON.stringify({ billing_type: "Package", package_subscription_id: patientPackageId }),
    });
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
    queryClient.invalidateQueries({ queryKey: ["doctor-sessions"] });
}

export async function resolvePackageCoverage(queryClient, { appointment, treatmentSession, actorUserId }) {
    if (!treatmentSession) return { coveredByPackage: false };

    const existingUsage = await apiRequest(`/package_session_usages?treatment_session_id=${treatmentSession.id}`);
    const activeUsage = existingUsage.find((u) => !u.reversed_at);
    if (activeUsage) {
        return { coveredByPackage: true, patientPackageId: activeUsage.patient_package_id };
    }

    const existingInvoice = await findInvoiceByAppointment(appointment.id);
    if (existingInvoice) return { coveredByPackage: false, invoice: existingInvoice };

    const linkedPackageId = appointment.package_subscription_id ?? treatmentSession.package_subscription_id;
    const [patientPackagesRaw, packageInvoices, packagePayments, packagePaymentRefunds] = await Promise.all([
        apiRequest(`/patient_packages?patient_id=${appointment.patient_id}`),
        apiRequest(`/invoices?patient_id=${appointment.patient_id}`),
        apiRequest("/payments"),
        apiRequest("/payment_refunds"),
    ]);
    const enrichedPatientPackages = enrichPackages(
        patientPackagesRaw,
        [],
        [],
        packageInvoices,
        packagePayments,
        packagePaymentRefunds,
    );

    let coveringPackage = null;
    if (appointment.billing_type === "Package" && linkedPackageId) {
        const linked = enrichedPatientPackages.find((p) => p.id === linkedPackageId);
        if (linked && isPackageUsable(linked)) coveringPackage = linked;
    } else if (!appointment.billing_type) {
        coveringPackage = findActivePackageForPatient(enrichedPatientPackages, appointment.patient_id);
    }

    console.debug("[Billing] patient_id:", appointment.patient_id, "| linked subscription:", linkedPackageId ?? "none", "| usable now:", Boolean(coveringPackage), "| remaining sessions:", coveringPackage?.remainingSessions ?? "-", "| decision:", coveringPackage ? "PACKAGE" : "INDIVIDUAL");

    if (coveringPackage) {
        await consumePackageSession(queryClient, {
            patientPackageId: coveringPackage.id,
            treatmentSessionId: treatmentSession.id,
            actorUserId,
            patientId: appointment.patient_id,
        });
        return { coveredByPackage: true, patientPackageId: coveringPackage.id };
    }

    return { coveredByPackage: false, invoice: null };
}

export async function createIndividualBookingInvoice(queryClient, { appointment, addInvoice, addPayment, paymentMethod, role, user, actorUserId }) {
    if (!hasPermission(user || role, "billing:create")) {
        const error = new Error("لا تملك صلاحية إنشاء فاتورة");
        error.code = "FORBIDDEN";
        throw error;
    }
    if (!appointment?.service_id) return null;

    const existingInvoice = await findInvoiceByAppointment(appointment.id);
    if (existingInvoice) return existingInvoice;

    const services = await apiRequest("/services");
    const svc = services.find((s) => s.id === appointment.service_id);
    if (!svc) return null;

    const unitPrice = svc.default_price ?? 0;
    const nowIso = new Date().toISOString();
    let invoice;
    try {
        invoice = await addInvoice({
            invoice: {
                patient_id: appointment.patient_id,
                appointment_id: appointment.id,
                doctor_id: appointment.doctor_id,
                issued_at: nowIso,
                due_at: nowIso,
                status: "Unpaid",
                subtotal_amount: unitPrice,
                discount_amount: 0,
                total_amount: unitPrice,
                payment_method: paymentMethod,
                notes: "",
            },
            items: [
                {
                    service_id: svc.id,
                    description: svc.name,
                    quantity: 1,
                    unit_price: unitPrice,
                    discount_amount: 0,
                    line_total: unitPrice,
                },
            ],
        });
    } catch (error) {
        if (error?.code === DUPLICATE_INVOICE_ERROR) return error.existingInvoice ?? null;
        throw error;
    }

    if (unitPrice > 0) {
        await addPayment({
            invoice_id: invoice.id,
            amount: unitPrice,
            remainingBalance: unitPrice,
            method: paymentMethod,
            paid_at: nowIso,
            received_by_user_id: actorUserId ?? null,
            patientId: appointment.patient_id,
        });
    }

    await apiRequest(`/appointments/${appointment.id}`, {
        method: "PATCH",
        body: JSON.stringify({ billing_type: "Individual" }),
    });
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
    queryClient.invalidateQueries({ queryKey: ["doctor-sessions"] });

    return invoice;
}

export function usePatientPackages() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { invoices, addInvoice } = useInvoices();
    const { addPayment } = usePayments();

    const patientPackagesQuery = useQuery({
        queryKey: ["patient_packages"],
        queryFn: () => apiRequest("/patient_packages"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
    const packageTemplatesQuery = useQuery({
        queryKey: ["package-templates"],
        queryFn: () => apiRequest("/package-templates"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
    const sessionUsagesQuery = useQuery({
        queryKey: ["package_session_usages"],
        queryFn: () => apiRequest("/package_session_usages"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
    const paymentsQuery = useQuery({
        queryKey: ["payments"],
        queryFn: () => apiRequest("/payments"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
    const paymentRefundsQuery = useQuery({
        queryKey: ["payment_refunds"],
        queryFn: () => apiRequest("/payment_refunds"),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    const patientPackagesRaw = patientPackagesQuery.data ?? EMPTY_ARRAY;
    const packageTemplates = packageTemplatesQuery.data ?? EMPTY_ARRAY;
    const packageSessionUsages = sessionUsagesQuery.data ?? EMPTY_ARRAY;
    const payments = paymentsQuery.data ?? EMPTY_ARRAY;
    const paymentRefunds = paymentRefundsQuery.data ?? EMPTY_ARRAY;

    const patientPackages = useMemo(
        () => enrichPackages(patientPackagesRaw, packageTemplates, packageSessionUsages, invoices, payments, paymentRefunds),
        [patientPackagesRaw, packageTemplates, packageSessionUsages, invoices, payments, paymentRefunds],
    );

    const assignPackageMutation = useMutation({
        mutationFn: async ({ patientId, packageTemplateId, paymentMethod = "Cash", startDate }) => {
            const existingForPatient = await apiRequest(`/patient_packages?patient_id=${patientId}`);
            if (existingForPatient.some((p) => isPackageUsable(p))) {
                const error = new Error("لدى هذا المريض باقة نشطة بالفعل");
                error.code = "ALREADY_HAS_ACTIVE_PACKAGE";
                throw error;
            }

            const template = await apiRequest(`/package-templates/${packageTemplateId}`);
            if (!template) throw new Error("لم يتم العثور على الباقة المختارة");

            const priceSnapshot = Math.round(template.price * (1 - (template.discount_percent ?? 0) / 100));
            const start = startDate ? new Date(startDate) : new Date();
            const endDateIso = template.validity_days
                ? new Date(start.getTime() + template.validity_days * 24 * 60 * 60 * 1000).toISOString()
                : null;
            const nowIso = new Date().toISOString();

            const patientPackage = await apiRequest("/patient_packages", {
                method: "POST",
                body: JSON.stringify({
                    patient_id: patientId,
                    package_template_id: packageTemplateId,
                    sessions_total: template.session_count,
                    sessions_used_cache: 0,
                    price_snapshot: priceSnapshot,
                    status: "Active",
                    start_date: start.toISOString(),
                    end_date: endDateIso,
                    payment_status: "Paid",
                    invoice_id: null,
                    created_at: nowIso,
                }),
            });

            const invoice = await addInvoice({
                invoice: {
                    patient_id: patientId,
                    patient_package_id: patientPackage.id,
                    appointment_id: null,
                    issued_at: nowIso,
                    due_at: nowIso,
                    status: "Unpaid",
                    subtotal_amount: priceSnapshot,
                    discount_amount: 0,
                    total_amount: priceSnapshot,
                    payment_method: paymentMethod,
                    notes: `اشتراك باقة: ${template.name}`,
                },
                items: [
                    {
                        service_id: null,
                        description: `اشتراك باقة — ${template.name}`,
                        quantity: 1,
                        unit_price: priceSnapshot,
                        discount_amount: 0,
                        line_total: priceSnapshot,
                    },
                ],
            });

            await apiRequest(`/patient_packages/${patientPackage.id}`, {
                method: "PATCH",
                body: JSON.stringify({ invoice_id: invoice.id }),
            });

            await addPayment({
                invoice_id: invoice.id,
                amount: priceSnapshot,
                remainingBalance: priceSnapshot,
                method: paymentMethod,
                paid_at: nowIso,
                received_by_user_id: user?.id ?? null,
                patientId,
            });

            logActivity({
                action: ACTIVITY_ACTIONS.PACKAGE_ASSIGNED,
                actorUserId: user?.id,
                patientId,
                entityType: "patient_package",
                entityId: patientPackage.id,
                details: `${template.name} — ${priceSnapshot} ج.م`,
            });

            return { patientPackage, invoice };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["patient_packages"] });
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            queryClient.invalidateQueries({ queryKey: ["invoice_items"] });
            queryClient.invalidateQueries({ queryKey: ["payments"] });
            queryClient.invalidateQueries({ queryKey: ["patients"] });
            toast.success("تم اشتراك المريض في الباقة بنجاح");
        },
        onError: (error) => {
            if (error.code === "ALREADY_HAS_ACTIVE_PACKAGE") {
                toast.error("لدى هذا المريض باقة نشطة بالفعل");
            } else {
                toast.error(error.message || "فشل الاشتراك في الباقة");
            }
        },
    });

    return {
        patientPackages,
        packageTemplates,
        packageSessionUsages,
        isLoading:
            patientPackagesQuery.isLoading ||
            packageTemplatesQuery.isLoading ||
            sessionUsagesQuery.isLoading ||
            paymentsQuery.isLoading ||
            paymentRefundsQuery.isLoading,
        assignPackage: assignPackageMutation.mutateAsync,
        isAssigning: assignPackageMutation.isPending,
    };
}
