
// Re-export from the implementation file
import { useToast } from "@/hooks/use-toast.tsx";

export { useToast };

// No-op toast function that doesn't actually show toasts
export const toast = () => {};

// Export the type for compatibility
export type ToastActionElement = React.ReactElement<unknown>;
