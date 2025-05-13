
import { type ToastActionElement, type ToastProps } from "@/components/ui/toast";

export type ToastOptions = {
  title?: string
  description?: string
  action?: ToastActionElement
  variant?: "default" | "destructive"
}

// Re-export from the implementation file
export { toast, useToast } from "./use-toast.tsx";
