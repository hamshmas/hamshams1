"use client";
import { createContext, useState, useCallback, ReactNode } from "react";
import { Toast } from "./Toast";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  show: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message: string, type: ToastType = "info", duration?: number) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, message, duration }]);
    },
    []
  );

  const success = useCallback(
    (message: string, duration?: number) => show(message, "success", duration),
    [show]
  );

  const error = useCallback(
    (message: string, duration?: number) => show(message, "error", duration),
    [show]
  );

  const warning = useCallback(
    (message: string, duration?: number) => show(message, "warning", duration),
    [show]
  );

  const info = useCallback(
    (message: string, duration?: number) => show(message, "info", duration),
    [show]
  );

  return (
    <ToastContext.Provider value={{ show, success, error, warning, info }}>
      {children}
      {/* Toast Container */}
      <div
        className="fixed bottom-4 left-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              id={toast.id}
              type={toast.type}
              message={toast.message}
              duration={toast.duration}
              onClose={removeToast}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
