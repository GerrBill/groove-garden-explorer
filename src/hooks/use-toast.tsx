
import * as React from "react";
import { createContext, useContext, useState } from "react";

// Types for toast related functionality
export type ToastProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
  duration?: number;
  action?: React.ReactNode;
};

export type Toast = ToastProps & {
  id: string;
};

type ToastContextType = {
  toasts: Toast[];
  addToast: (props: ToastProps) => void;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Define the toast function
export function toast(props: ToastProps) {
  // Generate an ID for this toast
  const id = Math.random().toString(36).slice(2, 10);
  
  // Get the current toast context if available
  try {
    const context = useContext(ToastContext);
    if (context) {
      context.addToast({ ...props, id });
    } else {
      console.warn("Toast context not available, toast may not appear");
    }
  } catch (e) {
    console.warn("Error showing toast:", e);
  }

  return {
    id,
    dismiss: () => {
      try {
        const context = useContext(ToastContext);
        if (context) {
          context.dismissToast(id);
        }
      } catch (e) {
        console.warn("Error dismissing toast:", e);
      }
    },
  };
}

// ToastProvider component
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (props: ToastProps) => {
    const id = Math.random().toString(36).slice(2, 10);
    const toast = { ...props, id };
    setToasts((prev) => [...prev, toast]);
    
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

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismissToast, dismissAll }}>
      {children}
    </ToastContext.Provider>
  );
};

export type ToastActionElement = React.ReactElement<unknown>;
