
// Re-export toast components from the ui component
import { toast, useToast } from "@/components/ui/toast";

export type ToastOptions = {
  title?: string
  description?: string
  action?: React.ReactElement
  variant?: "default" | "destructive"
}

export { useToast, toast };
