import {
  CalendarPlus,
  CalendarCheck,
  PlayCircle,
  CheckCircle2,
  FileText,
  PhoneCall,
  Receipt,
  Wallet,
  UserPlus,
  CalendarDays,
  Clock,
  XCircle,
  UserCheck,
  Activity,
  Timer,
} from "lucide-react";
import { computeNetPaid, computeRemainingBalance, computePaymentStatus } from "../utils/billing";
import { computePackageStatus } from "./patientPackages.helpers";

function toValidDate(raw) {
  if (!raw) return null;
  const date = new Date(raw);
  return isNaN(date.getTime()) ? null : date;
}

function buildStaffMap(staffList) {
  return new Map(staffList.map((s) => [s.id, s]));
}

export function calculateAge(dateOfBirth) {
  const dob = toValidDate(dateOfBirth);
  if (!dob) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

export function getSessionActualRange(session) {
  const start = toValidDate(session.actual_started_at) || toValidDate(session.starts_at);
  const end =
    toValidDate(session.actual_ended_at) || toValidDate(session.ends_at) || toValidDate(session.completed_at);
  return { start, end };
}

export function sessionDurationMinutes(session) {
  const { start, end } = getSessionActualRange(session);
  if (!start || !end) return null;
  const minutes = (end - start) / (1000 * 60);
  return minutes > 0 ? Math.round(minutes) : null;
}

export function sessionDurationSeconds(session) {
  const { start, end } = getSessionActualRange(session);
  if (!start || !end) return null;
  const seconds = Math.floor((end - start) / 1000);
  return seconds > 0 ? seconds : null;
}

export function enrichSessions(sessions, staffList, servicesList, roomsList) {
  const staffById = buildStaffMap(staffList);
  const servicesById = new Map(servicesList.map((s) => [s.id, s]));
  const roomsById = new Map(roomsList.map((r) => [r.id, r]));

  return sessions.map((session) => ({
    ...session,
    doctorName: staffById.get(session.doctor_id)?.full_name ?? "طبيب غير محدد",
    serviceName: servicesById.get(session.service_id)?.name ?? "خدمة غير محددة",
    roomName: roomsById.get(session.room_id)?.name ?? "غرفة غير محددة",
    durationMinutes: sessionDurationMinutes(session),
  }));
}

export function buildPrescriptions(enrichedSessions, appointments) {
  const fromSessions = enrichedSessions
    .filter((s) => s.prescription && (s.prescription.diagnosis || s.prescription.medicines?.length))
    .map((s) => ({
      id: `session-${s.id}`,
      date: s.completed_at || s.starts_at,
      doctorName: s.doctorName,
      serviceName: s.serviceName,
      diagnosis: s.prescription.diagnosis ?? "",
      notes: s.prescription.notes ?? "",
      medicines: s.prescription.medicines ?? [],
      source: "session",
      sourceId: s.id,
    }));

  const fromAppointments = appointments
    .filter((a) => a.prescription && a.prescription.diagnosis)
    .map((a) => ({
      id: `appointment-${a.id}`,
      date: a.actual_ended_at || a.ends_at || a.starts_at,
      doctorName: a.doctor_name,
      serviceName: a.service_name,
      diagnosis: a.prescription.diagnosis ?? "",
      notes: a.prescription.notes ?? "",
      medicines: [],
      source: "appointment",
      sourceId: a.id,
    }));

  return [...fromSessions, ...fromAppointments].sort(
    (a, b) => new Date(b.date ?? 0) - new Date(a.date ?? 0),
  );
}

export function enrichFollowUps(followUps, staffList) {
  const staffById = buildStaffMap(staffList);
  return followUps
    .map((f) => ({
      ...f,
      doctorName: staffById.get(f.doctor_id)?.full_name ?? "غير محدد",
      assigneeName: staffById.get(f.assignee_staff_id)?.full_name ?? "غير محدد",
      currentStatus: f.follow_up_status || f.status,
    }))
    .sort((a, b) => new Date(b.updated_at ?? 0) - new Date(a.updated_at ?? 0));
}

export function enrichInternalNotes(notes, staffList) {
  const staffById = buildStaffMap(staffList);
  return notes.map((n) => ({
    ...n,
    authorName: staffById.get(n.author_staff_id)?.full_name ?? "غير محدد",
  }));
}

export function enrichReassessments(reassessments, staffList) {
  const staffById = buildStaffMap(staffList);
  return reassessments
    .map((r) => ({ ...r, doctorName: staffById.get(r.doctor_id)?.full_name ?? "غير محدد" }))
    .sort((a, b) => new Date(a.due_at ?? 0) - new Date(b.due_at ?? 0));
}

const BILLING_TO_PACKAGE_PAYMENT_STATUS = { Paid: "Paid", Partial: "PartiallyPaid", Unpaid: "Unpaid" };

export function enrichPackages(packages, packageTemplates, sessionUsages, invoices = [], payments = [], paymentRefunds = []) {
  const templatesById = new Map(packageTemplates.map((t) => [t.id, t]));
  return packages.map((pkg) => {
    const template = templatesById.get(pkg.package_template_id);
    const usagesCount = sessionUsages.filter(
      (u) => u.patient_package_id === pkg.id && !u.reversed_at,
    ).length;

    const invoice = pkg.invoice_id ? invoices.find((inv) => inv.id === pkg.invoice_id) ?? null : null;
    const totalAmount = invoice?.total_amount ?? pkg.price_snapshot ?? 0;

    let paidAmount;
    let derivedPaymentStatus;
    if (invoice) {
      paidAmount = computeNetPaid(payments.filter((p) => p.invoice_id === invoice.id), paymentRefunds);
      derivedPaymentStatus = BILLING_TO_PACKAGE_PAYMENT_STATUS[computePaymentStatus({ total: totalAmount, netPaid: paidAmount })];
    } else {
      const storedStatus = ["Paid", "PartiallyPaid", "Unpaid"].includes(pkg.payment_status)
        ? pkg.payment_status
        : "Unpaid";
      derivedPaymentStatus = storedStatus;
      paidAmount = storedStatus === "Paid" ? totalAmount : 0;
    }
    const remainingAmount = computeRemainingBalance(totalAmount, paidAmount);

    return {
      ...pkg,
      templateName: template?.name ?? "باقة غير معروفة",
      usagesCount,
      remainingSessions: Math.max(0, (pkg.sessions_total ?? 0) - (pkg.sessions_used_cache ?? 0)),
      totalAmount,
      paidAmount,
      remainingAmount,
      paymentMethod: invoice?.payment_method ?? null,
      payment_status: derivedPaymentStatus,
      computedStatus: computePackageStatus({ ...pkg, payment_status: derivedPaymentStatus }),
    };
  });
}

export function enrichInvoices(invoices, payments, paymentRefunds) {
  return invoices.map((invoice) => {
    const invoicePayments = payments.filter((p) => p.invoice_id === invoice.id);
    const netPaid = computeNetPaid(invoicePayments, paymentRefunds);
    return {
      ...invoice,
      payments: invoicePayments,
      netPaid,
      balanceDue: computeRemainingBalance(invoice.total_amount ?? 0, netPaid),
      computedStatus: computePaymentStatus({ total: invoice.total_amount ?? 0, netPaid }),
    };
  });
}

export function getDistinctServiceNames(appointments, enrichedSessions) {
  const names = new Set();
  appointments.forEach((a) => a.service_name && names.add(a.service_name));
  enrichedSessions.forEach((s) => s.serviceName && names.add(s.serviceName));
  return [...names];
}

export function computeOutstandingBalance(enrichedInvoices) {
  return enrichedInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
}

export function buildPatientStats({ patient, appointments, enrichedSessions, prescriptions, enrichedInvoices }) {
  const now = new Date();

  const completedAppointments = appointments.filter((a) => a.status === "Completed");
  const upcomingAppointments = appointments.filter(
    (a) => (a.status === "Scheduled" || a.status === "Waiting") && new Date(a.starts_at) > now,
  );
  const cancelledAppointments = appointments.filter((a) => a.status === "Cancelled");
  const completedSessions = enrichedSessions.filter((s) => s.status === "Completed");

  const durations = enrichedSessions.map((s) => s.durationMinutes).filter((d) => d != null);
  const avgSessionDurationMinutes = durations.length
    ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
    : null;

  const lastCompleted = [...completedAppointments].sort(
    (a, b) => new Date(b.starts_at) - new Date(a.starts_at),
  )[0];
  const nextAppointment = [...upcomingAppointments].sort(
    (a, b) => new Date(a.starts_at) - new Date(b.starts_at),
  )[0];

  return {
    totalAppointments: appointments.length,
    completedSessionsCount: completedSessions.length,
    upcomingAppointmentsCount: upcomingAppointments.length,
    cancelledAppointmentsCount: cancelledAppointments.length,
    totalVisits: completedAppointments.length,
    totalTreatmentSessions: enrichedSessions.length,
    avgSessionDurationMinutes,
    lastVisit: lastCompleted?.starts_at ?? patient.last_appointment ?? null,
    nextAppointment: nextAppointment ?? null,
    totalPrescriptions: prescriptions.length,
    outstandingBalance: computeOutstandingBalance(enrichedInvoices),
  };
}

export function buildOverviewStatItems(stats) {
  return [
    { key: "total", label: "إجمالي المواعيد", value: stats.totalAppointments, icon: CalendarDays, iconWrapperClassName: "bg-blue-500/10 text-blue-600" },
    { key: "completed", label: "جلسات مكتملة", value: stats.completedSessionsCount, icon: CheckCircle2, valueClassName: "text-emerald-600", iconWrapperClassName: "bg-emerald-500/10 text-emerald-600" },
    { key: "upcoming", label: "مواعيد قادمة", value: stats.upcomingAppointmentsCount, icon: Clock, valueClassName: "text-amber-600", iconWrapperClassName: "bg-amber-500/10 text-amber-600" },
    { key: "cancelled", label: "مواعيد ملغاة", value: stats.cancelledAppointmentsCount, icon: XCircle, valueClassName: "text-rose-600", iconWrapperClassName: "bg-rose-500/10 text-rose-600" },
    { key: "visits", label: "إجمالي الزيارات", value: stats.totalVisits, icon: UserCheck, iconWrapperClassName: "bg-purple-500/10 text-purple-600" },
    { key: "sessions", label: "إجمالي الجلسات العلاجية", value: stats.totalTreatmentSessions, icon: Activity, iconWrapperClassName: "bg-cyan-500/10 text-cyan-600" },
    { key: "duration", label: "متوسط مدة الجلسة", value: stats.avgSessionDurationMinutes ?? "—", suffix: stats.avgSessionDurationMinutes != null ? "دقيقة" : "", icon: Timer, iconWrapperClassName: "bg-indigo-500/10 text-indigo-600" },
    { key: "prescriptions", label: "إجمالي الروشتات", value: stats.totalPrescriptions, icon: FileText, iconWrapperClassName: "bg-teal-500/10 text-teal-600" },
  ];
}

export function buildActivityTimeline({ patient, appointments, enrichedSessions, enrichedInvoices, followUps }) {
  const events = [];

  if (patient.joined_date) {
    events.push({
      id: `reg-${patient.id}`,
      type: "registered",
      icon: UserPlus,
      label: "تم تسجيل المريض في المركز",
      date: patient.joined_date,
    });
  }

  appointments.forEach((a) => {
    if (a.created_at) {
      events.push({
        id: `apt-created-${a.id}`,
        type: "appointment_created",
        icon: CalendarPlus,
        label: `تم حجز موعد مع ${a.doctor_name}`,
        date: a.created_at,
        meta: a.service_name,
      });
    }
    if (a.status === "Completed" && (a.actual_ended_at || a.starts_at)) {
      events.push({
        id: `apt-completed-${a.id}`,
        type: "appointment_completed",
        icon: CalendarCheck,
        label: `اكتمل الموعد مع ${a.doctor_name}`,
        date: a.actual_ended_at || a.starts_at,
        meta: a.service_name,
      });
    }
  });

  enrichedSessions.forEach((s) => {
    if (s.actual_started_at || s.starts_at) {
      events.push({
        id: `session-start-${s.id}`,
        type: "session_started",
        icon: PlayCircle,
        label: `بدأت جلسة مع ${s.doctorName}`,
        date: s.actual_started_at || s.starts_at,
        meta: s.serviceName,
      });
    }
    if (s.status === "Completed" && (s.completed_at || s.starts_at)) {
      events.push({
        id: `session-complete-${s.id}`,
        type: "session_completed",
        icon: CheckCircle2,
        label: `اكتملت الجلسة مع ${s.doctorName}`,
        date: s.completed_at || s.starts_at,
        meta: s.serviceName,
      });
    }
    if (s.prescription?.diagnosis) {
      events.push({
        id: `prescription-${s.id}`,
        type: "prescription_added",
        icon: FileText,
        label: `تمت إضافة روشتة بواسطة ${s.doctorName}`,
        date: s.completed_at || s.starts_at,
        meta: s.prescription.diagnosis,
      });
    }
  });

  followUps.forEach((f) => {
    if (f.updated_at) {
      events.push({
        id: `followup-${f.id}`,
        type: "followup_updated",
        icon: PhoneCall,
        label: `تحديث متابعة: ${f.currentStatus ?? f.status}`,
        date: f.updated_at,
      });
    }
  });

  enrichedInvoices.forEach((inv) => {
    if (inv.issued_at) {
      events.push({
        id: `invoice-${inv.id}`,
        type: "invoice_issued",
        icon: Receipt,
        label: `تم إصدار فاتورة ${inv.invoice_no}`,
        date: inv.issued_at,
        meta: `${inv.total_amount} ج.م`,
      });
    }
    inv.payments.forEach((p) => {
      if (p.paid_at && !p.voided_at) {
        events.push({
          id: `payment-${p.id}`,
          type: "payment_recorded",
          icon: Wallet,
          label: "تم تسجيل دفعة",
          date: p.paid_at,
          meta: `${p.amount} ج.م (${p.method})`,
        });
      }
    });
  });

  return events
    .filter((e) => toValidDate(e.date))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}
