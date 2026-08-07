import { toast as sonnerToast } from "sonner";

// طبقة موحّدة فوق sonner حتى لا يتكرر نفس التنسيق في كل هوك/صفحة،
// ولضمان استبدال إشعارات "جاري التحميل" تلقائياً بالنجاح أو الخطأ.
export const toast = {
  success: (message) => sonnerToast.success(message),
  error: (message) => sonnerToast.error(message),
  warning: (message) => sonnerToast.warning(message),
  info: (message) => sonnerToast.info(message),
  loading: (message) => sonnerToast.loading(message),
  dismiss: (id) => sonnerToast.dismiss(id),
};

// تنفيذ عملية غير متزامنة مع إشعار "جاري..." يتحول تلقائياً لنجاح أو خطأ.
export function toastPromise(promise, messages) {
  return sonnerToast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: (error) => messages.error ?? error?.message ?? "حدث خطأ غير متوقع",
  });
}
