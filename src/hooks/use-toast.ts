
// Re-export from the implementation file
import { useToast, toast } from "./use-toast.tsx";

export { useToast, toast };

// Export the type for compatibility
export type ToastActionElement = React.ReactElement<unknown>;
