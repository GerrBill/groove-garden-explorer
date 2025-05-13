
import {
  Toast,
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

import {
  useToast as useToastBase
} from "@/components/ui/use-toast"

export const useToast = useToastBase;

type ToastOptions = {
  title?: string
  description?: string
  action?: ToastActionElement
  variant?: "default" | "destructive"
}

export const toast = ({ title, description, action, variant }: ToastOptions) => {
  const { toast } = useToastBase()
  return toast({ title, description, action, variant })
}
