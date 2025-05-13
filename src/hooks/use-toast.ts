
import { type ToastProps } from "@/components/ui/toast";

export type ToastOptions = {
  title?: string
  description?: string
  action?: ToastActionElement
  variant?: "default" | "destructive"
}

// Re-export ToastActionElement type to resolve the import issue
export type ToastActionElement = React.ReactElement<{
  toast: {
    id: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
    variant?: "default" | "destructive";
  }
}>;

// Re-export from the implementation file
export { toast, useToast } from "./use-toast.tsx";
