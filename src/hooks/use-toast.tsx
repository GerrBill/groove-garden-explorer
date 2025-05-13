
import * as React from "react";
import { createContext, useContext, useState } from "react";

// Types for toast related functionality
export interface ToastProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
  duration?: number;
  action?: React.ReactNode;
}

export type Toast = ToastProps & {
  id: string;
};

interface ToastContextType {
  toasts: Toast[];
  addToast: (props: ToastProps) => void;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
  toast: (props: ToastProps) => { id: string; dismiss: () => void }; // Added the toast function to the context type
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Define the toast function that will be included in the context
const createToast = (addToast: (props: ToastProps) => void, dismissToast: (id: string) => void) => {
  return (props: ToastProps) => {
    const id = Math.random().toString(36).slice(2, 10);
    
    addToast({ ...props, id });
    
    return {
      id,
      dismiss: () => dismissToast(id),
    };
  };
};

// Export the standalone toast function for direct imports
export const toast = (props: ToastProps) => {
  // Generate an ID for this toast
  const id = Math.random().toString(36).slice(2, 10);
  
  try {
    // Using a direct DOM event to add the toast
    window.dispatchEvent(
      new CustomEvent("add-toast", { 
        detail: { ...props, id } 
      })
    );
  } catch (e) {
    console.warn("Error showing toast:", e);
  }

  return {
    id,
    dismiss: () => {
      try {
        window.dispatchEvent(
          new CustomEvent("dismiss-toast", { 
            detail: { id } 
          })
        );
      } catch (e) {
        console.warn("Error dismissing toast:", e);
      }
    },
  };
};

// ToastProvider component
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Add event listeners for toast operations
  React.useEffect(() => {
    const handleAddToast = (event: Event) => {
      const toastEvent = event as CustomEvent<Toast>;
      const newToast = toastEvent.detail;
      setToasts((prev) => [...prev, newToast]);
      
      if (newToast.duration !== Infinity) {
        setTimeout(() => {
          dismissToast(newToast.id);
        }, newToast.duration || 5000);
      }
    };

    const handleDismissToast = (event: Event) => {
      const dismissEvent = event as CustomEvent<{ id: string }>;
      dismissToast(dismissEvent.detail.id);
    };

    window.addEventListener("add-toast", handleAddToast);
    window.addEventListener("dismiss-toast", handleDismissToast);

    return () => {
      window.removeEventListener("add-toast", handleAddToast);
      window.removeEventListener("dismiss-toast", handleDismissToast);
    };
  }, []);

  const addToast = (props: ToastProps) => {
    const id = Math.random().toString(36).slice(2, 10);
    const newToast = { ...props, id };
    setToasts((prev) => [...prev, newToast]);
    
    if (props.duration !== Infinity) {
      setTimeout(() => {
        dismissToast(id);
      }, props.duration || 5000);
    }
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const dismissAll = () => {
    setToasts([]);
  };

  // Create the toast function for the context
  const toastFn = createToast(addToast, dismissToast);

  const contextValue: ToastContextType = {
    toasts,
    addToast,
    dismissToast,
    dismissAll,
    toast: toastFn // Include the toast function in the context
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
};

export type ToastActionElement = React.ReactElement<unknown>;
