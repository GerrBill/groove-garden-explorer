
// Re-export toast hooks from the hooks implementation
import { useToast, toast, ToastProvider } from "@/hooks/use-toast";
import type { ToastActionElement, ToastProps } from "@/hooks/use-toast";

export { useToast, toast, ToastProvider };
export type { ToastActionElement, ToastProps };
