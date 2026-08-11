import { toast as sonnerToast } from "sonner";

export const toast = {
  success: (message) => sonnerToast.success(message),
  error: (message) => sonnerToast.error(message),
  warning: (message) => sonnerToast.warning(message),
  info: (message) => sonnerToast.info(message),
  loading: (message) => sonnerToast.loading(message),
  dismiss: (id) => sonnerToast.dismiss(id),
};

export function toastPromise(promise, messages) {
  return sonnerToast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: (error) => messages.error ?? error?.message ?? "حدث خطأ غير متوقع",
  });
}
