import { ConfirmModal } from "./ui/ConfirmModal"; // تأكدي من مسار الاستيراد الصحيح

export function DeleteAppointmentModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="حذف الموعد"
      description="هل أنت متأكد من رغبتك في حذف هذا الموعد؟ لا يمكن التراجع عن هذا الإجراء بعد تأكيده."
      confirmText="تأكيد الحذف"
      cancelText="تراجع"
      variant="destructive"
      isLoading={isDeleting}
    />
  );
}
