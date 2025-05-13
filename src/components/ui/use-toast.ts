
import { useToast, toast } from "@/hooks/use-toast.tsx";

export type ToastOptions = {
  title?: string
  description?: string
  action?: React.ReactElement
  variant?: "default" | "destructive"
}

export { useToast, toast };
