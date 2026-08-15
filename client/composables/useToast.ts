import { ref } from "vue";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const toasts = ref<Toast[]>([]);

export const useToast = () => {
  const addToast = (
    message: string,
    type: ToastType = "info",
    duration = 3000,
  ) => {
    const id = crypto.randomUUID();
    toasts.value.push({ id, message, type });

    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const success = (message: string, duration?: number) =>
    addToast(message, "success", duration);
  const error = (message: string, duration?: number) =>
    addToast(message, "error", duration);
  const info = (message: string, duration?: number) =>
    addToast(message, "info", duration);

  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  return {
    toasts,
    addToast,
    success,
    error,
    info,
    removeToast,
  };
};
