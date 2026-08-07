import { useState, useEffect } from "react";
import {
  X,
  Loader2,
  Calendar,
  User,
  Stethoscope,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { STATUS_OPTIONS } from "../constants/appointmentsConstants";
import { CustomSelect } from "./ui/CustomSelect";
import { useServices } from "../hooks/useServices";

export function AppointmentModal({
  isOpen,
  onClose,
  onSave,
  appointmentToEdit,
  patients = [],
  doctors = [],
}) {
  const { services, isLoading: loadingServices } = useServices();

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

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (appointmentToEdit) {
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
    }
  }, [isOpen, appointmentToEdit]);

  if (!isOpen) return null;

  const handlePatientChange = (selectedId) => {
    const selectedPatient = patients.find((p) => p.id === selectedId);
    setFormData((prev) => ({
      ...prev,
      patient_id: selectedId,
      patient_name: selectedPatient ? selectedPatient.full_name : "",
    }));
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

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error("Save appointment error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const patientOptions = patients.map((p) => ({
    value: p.id,
    label: `${p.full_name} (${p.file_no || "بدون رقم ملف"})`,
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
      {/* تم إزالة قيود الطول وشريط التمرير ليطول المودال حسب المحتوى تماماً */}
      <div className="bg-card border border-border w-full max-w-xl rounded-3xl shadow-2xl flex flex-col h-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6 md:px-8 pb-4">
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

        {/* Form Body - بدون سكرول وبطول تلقائي */}
        <form onSubmit={handleSubmit} className="flex flex-col">
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
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 p-6 md:px-8 pt-4 border-t border-border bg-card">
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
