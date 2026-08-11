import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Edit,
  CalendarPlus,
  PlayCircle,
  StickyNote,
  Phone,
  MessageCircle,
  FileText,
  Cake,
  ShieldCheck,
} from "lucide-react";
import { PermissionGuard } from "../../../guards/PermissionGuard";
import { useAuth } from "../../../hooks/useAuth";
import { EditPatientModal } from "../EditPatientModal";
import { AppointmentModal } from "../../AppointmentModal";
import { AddNoteModal } from "./AddNoteModal";

const STATUS_STYLES = {
  Active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Inactive: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Archived: "bg-muted text-muted-foreground border-border",
};

function initialsOf(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("");
}

export function PatientHeader({
  patient,
  age,
  appointments,
  doctors,
  updatePatient,
  addAppointment,
  addInternalNote,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  const nextStartableAppointment = useMemo(() => {
    if (!user?.staff_id) return null;
    return [...appointments]
      .filter(
        (a) =>
          a.doctor_id === user.staff_id && (a.status === "Scheduled" || a.status === "Waiting"),
      )
      .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))[0];
  }, [appointments, user]);

  const handleStartSession = () => {
    if (!nextStartableAppointment) return;
    navigate(`/sessions/${nextStartableAppointment.id}`);
  };

  const phoneNo = patient?.phone || "";
  const whatsappUrl = phoneNo
    ? `https://wa.me/${phoneNo}?text=${encodeURIComponent(`مرحباً ${patient.full_name}، نود التواصل معك بخصوص مركز MedLink OS.`)}`
    : null;

  if (!patient) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-primary/10 via-purple-500/5 to-transparent" />
      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-primary/30">
            {initialsOf(patient.full_name)}
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {patient.full_name}
              </h1>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[patient.status] ?? STATUS_STYLES.Active}`}
              >
                {patient.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-medium">
              <span className="inline-flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" />
                {patient.file_no}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                {patient.gender === "Male" ? "ذكر" : "أنثى"}
              </span>
              {age != null && (
                <span className="inline-flex items-center gap-1.5">
                  <Cake className="h-3.5 w-3.5 text-primary" />
                  {age} سنة
                </span>
              )}
              {phoneNo && (
                <span className="inline-flex items-center gap-1.5 font-mono" dir="ltr">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  {phoneNo}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {phoneNo && (
            <a
              href={`tel:${phoneNo}`}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-primary/15 hover:text-primary transition-all"
              title="اتصال هاتفي"
            >
              <Phone className="h-4 w-4" />
            </a>
          )}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all"
              title="مراسلة واتساب"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          )}

          <PermissionGuard permission="notes:add">
            <button
              type="button"
              onClick={() => setIsNoteOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted text-foreground hover:bg-muted/70 font-bold text-xs transition-all cursor-pointer"
            >
              <StickyNote className="h-4 w-4" />
              إضافة ملاحظة
            </button>
          </PermissionGuard>

          {nextStartableAppointment && (
            <PermissionGuard permission="sessions:start">
              <button
                type="button"
                onClick={handleStartSession}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20 font-bold text-xs transition-all cursor-pointer"
              >
                <PlayCircle className="h-4 w-4" />
                بدء الجلسة
              </button>
            </PermissionGuard>
          )}

          <PermissionGuard permission="appointments:add">
            <button
              type="button"
              onClick={() => setIsBookingOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 font-bold text-xs transition-all cursor-pointer"
            >
              <CalendarPlus className="h-4 w-4" />
              موعد جديد
            </button>
          </PermissionGuard>

          <PermissionGuard permission="patients:edit">
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 font-bold text-xs transition-all cursor-pointer"
            >
              <Edit className="h-4 w-4" />
              تعديل البيانات
            </button>
          </PermissionGuard>
        </div>
      </div>

      <EditPatientModal
        isOpen={isEditOpen}
        patient={patient}
        onClose={() => setIsEditOpen(false)}
        onUpdate={async (id, data) => {
          await updatePatient({ id, data });
        }}
      />

      <AppointmentModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSave={async (data) => {
          const saved = await addAppointment(data);
          setIsBookingOpen(false);
          return saved;
        }}
        appointmentToEdit={null}
        patients={[patient]}
        doctors={doctors}
      />

      <AddNoteModal
        isOpen={isNoteOpen}
        onClose={() => setIsNoteOpen(false)}
        onAdd={addInternalNote}
      />
    </motion.div>
  );
}
