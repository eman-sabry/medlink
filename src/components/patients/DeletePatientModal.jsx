import { MoveToArchiveModal } from "../archive/MoveToArchiveModal";

export function DeletePatientModal({
  isOpen,
  onClose,
  onConfirm,
  patientName,
  patientFileNo,
  isLoading = false,
}) {
  return (
    <MoveToArchiveModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={(reason) => onConfirm(reason)}
      entityType="patient"
      entityName={patientName || "مريض"}
      entityIdentifier={patientFileNo ? `رقم الملف: ${patientFileNo}` : ""}
      isLoading={isLoading}
    />
  );
}
