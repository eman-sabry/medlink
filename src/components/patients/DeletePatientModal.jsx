import { ConfirmModal } from "../ui/ConfirmModal"; 

export function DeletePatientModal({
  isOpen,
  onClose,
  onConfirm,
  patientName,
  isLoading = false,
}) {
  const description = patientName ? (
    <>
      سيتم إزالة بيانات المريض{" "}
      <strong className="text-foreground">{patientName}</strong> نهائياً من
      النظام.
    </>
  ) : (
    "لن يمكنك التراجع عن هذه الخطوة بعد إتمامها، سيتم إزالة بيانات المريض نهائياً من النظام."
  );

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="هل أنت متأكد من الحذف؟"
      description={description}
      confirmText="تأكيد الحذف"
      cancelText="إلغاء"
      variant="destructive"
      isLoading={isLoading}
    />
  );
}
