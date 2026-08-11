import { useState, useEffect } from "react";
import {
  X,
  Loader2,
  Calendar,
  User,
  Stethoscope,
  FileText,
  CheckCircle2,
  Package,
  Wallet,
  Receipt,
} from "lucide-react";
import { STATUS_OPTIONS } from "../constants/appointmentsConstants";
import { CustomSelect } from "./ui/CustomSelect";
import { useServices } from "../hooks/useServices";
import { useAuth } from "../hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { usePatientPackages, linkAppointmentToPackage, createIndividualBookingInvoice } from "../hooks/usePatientPackages";
import { useInvoices } from "../hooks/useInvoices";
import { usePayments } from "../hooks/usePayments";
import { findActivePackageForPatient, PACKAGE_STATUS_META } from "../helpers/patientPackages.helpers";
import { PAYMENT_METHOD_LABELS } from "../utils/billing";
import { formatDate } from "../utils/date";
import { toast } from "../utils/toast";

const METHOD_OPTIONS = Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({ value, label }));

export function AppointmentModal({
  isOpen,
  onClose,
  onSave,
  appointmentToEdit,
  patients = [],
  doctors = [],
}) {
  const { role, user } = useAuth();
  const queryClient = useQueryClient();
  const { services, isLoading: loadingServices } = useServices();
  const { patientPackages } = usePatientPackages();
  const { addInvoice } = useInvoices();
  const { addPayment } = usePayments();

  const [formData, setFormData] = useState({
    patient_id: "",
    patient_name: "",
    doctor_id: "",
    doctor_name: "",
    service_id: "",
    service_name: "",
    starts_at: new Date().toISOString().slice(0, 16),
    status: "Scheduled",
  });
  const [billingChoice, setBillingChoice] = useState("package");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (appointmentToEdit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the form when the modal opens/switches target, not a render-time derivation
      setFormData({
        patient_id: appointmentToEdit.patient_id || "",
        patient_name: appointmentToEdit.patient_name || "",
        doctor_id: appointmentToEdit.doctor_id || "",
        doctor_name: appointmentToEdit.doctor_name || "",
        service_id: appointmentToEdit.service_id || "",
        service_name: appointmentToEdit.service_name || "",
        created_at: appointmentToEdit.created_at
          ? appointmentToEdit.created_at.slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        starts_at: appointmentToEdit.starts_at
          ? appointmentToEdit.starts_at.slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        ends_at: appointmentToEdit.ends_at
          ? appointmentToEdit.ends_at.slice(0, 16)
          : "",
        status: appointmentToEdit.status || "Scheduled",
      });
    } else {
      setFormData({
        patient_id: "",
        patient_name: "",
        doctor_id: "",
        doctor_name: "",
        service_id: "",
        service_name: "",
        created_at: new Date().toISOString().slice(0, 16),
        starts_at: new Date().toISOString().slice(0, 16),
        ends_at: "",
        status: "Scheduled",
      });
      setBillingChoice("package");
      setPaymentMethod("Cash");
    }
  }, [isOpen, appointmentToEdit]);

  if (!isOpen) return null;

  const coveringPackage = formData.patient_id ? findActivePackageForPatient(patientPackages, formData.patient_id) : null;
  const packageStatusMeta = coveringPackage ? PACKAGE_STATUS_META[coveringPackage.computedStatus] ?? PACKAGE_STATUS_META.Active : null;

  const selectedService = services.find((s) => s.id === formData.service_id) ?? null;
  const servicePrice = selectedService?.default_price ?? 0;

  const isIndividualBilling = !coveringPackage || billingChoice === "individual";
  const showBookingBillingSection = !appointmentToEdit && Boolean(formData.patient_id);

  const handlePatientChange = (selectedId) => {
    const selectedPatient = patients.find((p) => p.id === selectedId);
    setFormData((prev) => ({
      ...prev,
      patient_id: selectedId,
      patient_name: selectedPatient ? selectedPatient.full_name : "",
    }));
    setBillingChoice("package");
  };

  const handleDoctorChange = (selectedId) => {
    const selectedDoctor = doctors.find((d) => d.id === selectedId);
    setFormData((prev) => ({
      ...prev,
      doctor_id: selectedId,
      doctor_name: selectedDoctor ? selectedDoctor.full_name : "",
    }));
  };

  const handleServiceChange = (selectedId) => {
    const selectedService = services.find((s) => s.id === selectedId);
    setFormData((prev) => ({
      ...prev,
      service_id: selectedId,
      service_name: selectedService ? selectedService.name : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (showBookingBillingSection && isIndividualBilling && !formData.service_id) {
      toast.error("اختر الخدمة أولاً لحساب سعر الفاتورة الفردية");
      return;
    }

    setIsSubmitting(true);
    try {
      const saved = await onSave(formData);

      if (showBookingBillingSection && saved?.id) {
        if (!isIndividualBilling && coveringPackage) {
          await linkAppointmentToPackage(queryClient, {
            appointmentId: saved.id,
            patientPackageId: coveringPackage.id,
          });
        } else {
          await createIndividualBookingInvoice(queryClient, {
            appointment: saved,
            addInvoice,
            addPayment,
            paymentMethod,
            role,
            actorUserId: user?.id,
          });
        }
      }

      onClose();
    } catch (err) {
      console.error("Save appointment error:", err);
      toast.error(err?.message || "فشل حجز الموعد");
    } finally {
      setIsSubmitting(false);
    }
  };

  const patientOptions = patients.map((p) => ({
    value: p.id,
    label: `${p.full_name} (${p.file_no || "بدون رقم ملف"})`,
    searchValue: `${p.full_name} ${p.file_no ?? ""} ${p.phone ?? ""}`,
  }));

  const doctorOptions = doctors.map((d) => ({
    value: d.id,
    label: `${d.full_name} (${d.specialty || "طبيب"})`,
  }));

  const serviceOptions = services.map((s) => ({
    value: s.id,
    label: `${s.name} (${s.default_price || 0} ج.م)`,
  }));

  const statusSelectOptions = STATUS_OPTIONS.filter(
    (opt) => opt.value !== "all",
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 text-right">
      <div className="bg-card border border-border w-full max-w-xl rounded-3xl shadow-2xl flex flex-col h-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6 md:px-8 pb-4 shrink-0">
          <h2 className="text-xl font-black text-foreground tracking-wide">
            {appointmentToEdit ? "تعديل بيانات الموعد" : "حجز موعد جديد"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-all cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto">
          <div className="p-6 md:p-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Patient Selection */}
              <div className="space-y-1.5 col-span-full sm:col-span-1">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span>المريض</span>
                </label>
                <CustomSelect
                  value={formData.patient_id}
                  onChange={handlePatientChange}
                  options={patientOptions}
                  placeholder="-- اختر المريض --"
                />
                {!formData.patient_id && (
                  <input
                    type="text"
                    placeholder="أو اكتب اسم مريض جديد..."
                    value={formData.patient_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        patient_name: e.target.value,
                      }))
                    }
                    className="w-full h-10 mt-1 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none"
                  />
                )}
              </div>

              {/* Doctor Selection */}
              <div className="space-y-1.5 col-span-full sm:col-span-1">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5 text-primary" />
                  <span>الطبيب المعالج</span>
                </label>
                <CustomSelect
                  value={formData.doctor_id}
                  onChange={handleDoctorChange}
                  options={doctorOptions}
                  placeholder="-- اختر الطبيب المعالج --"
                />
                {!formData.doctor_id && (
                  <input
                    type="text"
                    placeholder="أو اكتب اسم الطبيب..."
                    value={formData.doctor_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        doctor_name: e.target.value,
                      }))
                    }
                    className="w-full h-10 mt-1 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none"
                  />
                )}
              </div>

              {/* Service Selection */}
              <div className="space-y-1.5 col-span-full sm:col-span-1">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <span>نوع الخدمة / الجلسة</span>
                </label>
                {loadingServices ? (
                  <div className="h-12 flex items-center gap-2 px-4 rounded-2xl border border-border bg-background text-xs text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>جاري تحميل الخدمات...</span>
                  </div>
                ) : (
                  <CustomSelect
                    value={formData.service_id}
                    onChange={handleServiceChange}
                    options={serviceOptions}
                    placeholder="-- اختر الخدمة المطلوبة --"
                  />
                )}
                {!formData.service_id && (
                  <input
                    type="text"
                    placeholder="أو اكتب اسم الخدمة..."
                    value={formData.service_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        service_name: e.target.value,
                      }))
                    }
                    className="w-full h-10 mt-1 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none"
                  />
                )}
              </div>

              {/* Starts At */}
              <div className="space-y-1.5 col-span-full sm:col-span-1">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span>تاريخ ووقت الموعد</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.starts_at}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      starts_at: e.target.value,
                    }))
                  }
                  className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>

              {/* Status Selection */}
              <div className="space-y-1.5 col-span-full">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  <span>حالة الموعد</span>
                </label>
                <CustomSelect
                  value={formData.status}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, status: val }))
                  }
                  options={statusSelectOptions}
                  placeholder="اختر حالة الموعد..."
                />
              </div>
            </div>

            {showBookingBillingSection && (
              <div className="space-y-3 pt-2 border-t border-border">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5 text-primary" />
                  <span>فوترة الجلسة</span>
                </label>

                {coveringPackage && (
                  <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-primary min-w-0">
                        <Package className="h-4 w-4 shrink-0" />
                        <span className="font-bold text-sm truncate">باقة نشطة متاحة — {coveringPackage.templateName}</span>
                      </div>
                      <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold border ${packageStatusMeta?.badge ?? ""}`}>
                        {packageStatusMeta?.label ?? coveringPackage.computedStatus}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                      <div className="p-2 rounded-xl bg-card">
                        <p className="text-muted-foreground">الإجمالي</p>
                        <p className="font-black text-foreground">{coveringPackage.sessions_total}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-card">
                        <p className="text-muted-foreground">مستخدَم</p>
                        <p className="font-black text-amber-600">{coveringPackage.sessions_used_cache ?? 0}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-card">
                        <p className="text-muted-foreground">متبقي</p>
                        <p className="font-black text-emerald-600">{coveringPackage.remainingSessions}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-card">
                        <p className="text-muted-foreground">الانتهاء</p>
                        <p className="font-black text-foreground">{coveringPackage.end_date ? formatDate(coveringPackage.end_date) : "—"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setBillingChoice("package")}
                        className={`py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                          billingChoice === "package"
                            ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                            : "bg-card text-foreground border-border hover:bg-muted/50"
                        }`}
                      >
                        استخدام الباقة
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingChoice("individual")}
                        className={`py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                          billingChoice === "individual"
                            ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                            : "bg-card text-foreground border-border hover:bg-muted/50"
                        }`}
                      >
                        فاتورة فردية
                      </button>
                    </div>
                  </div>
                )}

                {isIndividualBilling && (
                  <div className="rounded-2xl bg-muted/40 border border-border p-4 space-y-3">
                    <div className="flex items-center gap-2 text-foreground">
                      <Receipt className="h-4 w-4 text-primary" />
                      <span className="font-bold text-sm">جلسة فردية</span>
                      <span className="mr-auto font-black text-primary text-sm">{servicePrice} ج.م</span>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">طريقة الدفع</label>
                      <CustomSelect value={paymentMethod} onChange={setPaymentMethod} options={METHOD_OPTIONS} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 p-6 md:px-8 pt-4 border-t border-border bg-card shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl bg-muted text-foreground font-bold text-sm hover:bg-muted/80 transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>حفظ الموعد</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
