import { MoveToArchiveModal } from "./archive/MoveToArchiveModal";

export function DeleteAppointmentModal({
  isOpen,
  onClose,
  onConfirm,
  appointment,
  isDeleting = false,
}) {
  return (
    <MoveToArchiveModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={(reason) => onConfirm(reason)}
      entityType="appointment"
      entityName={appointment?.patient_name ? `موعد المريض: ${appointment.patient_name}` : "موعد عيادة"}
      entityIdentifier={appointment ? `${appointment.date || ""} ${appointment.time || ""}` : ""}
      isLoading={isDeleting}
    />
  );
}
