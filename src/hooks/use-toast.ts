
// Re-export toast components from the hooks implementation
import { toast, useToast } from "@/hooks/use-toast.tsx";

export type ToastOptions = {
  title?: string
  description?: string
  action?: React.ReactElement
  variant?: "default" | "destructive"
}

export { useToast, toast };
