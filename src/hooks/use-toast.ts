
// Export toast components and types
import { toast, useToast } from "@/hooks/use-toast.tsx";

export type ToastOptions = {
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

export { toast, useToast };
