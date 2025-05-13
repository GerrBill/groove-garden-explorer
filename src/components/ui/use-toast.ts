
// Re-export toast hooks from the hooks implementation
import { useToast, toast, ToastProvider } from "@/hooks/use-toast.tsx";
import type { ToastActionElement, ToastProps, Toast } from "@/hooks/use-toast.tsx";

export { useToast, toast, ToastProvider };
export type { ToastActionElement, ToastProps, Toast };
