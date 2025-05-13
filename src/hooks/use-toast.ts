
import {
  Toast,
  ToastActionElement,
  ToastProps,
  useToast as useToastOriginal
} from "@/components/ui/toast"

export type ToastOptions = {
  title?: string
  description?: string
  action?: ToastActionElement
  variant?: "default" | "destructive"
}

export const useToast = useToastOriginal;

export const toast = ({ title, description, action, variant }: ToastOptions) => {
  const { toast } = useToastOriginal();
  return toast({ title, description, action, variant });
}
