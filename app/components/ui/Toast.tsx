"use client";
import { useEffect } from "react";

export interface ToastProps {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({
  id,
  type,
  message,
  duration = 3000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const styles = {
    success: {
      bg: "bg-gradient-to-r from-green-500 to-emerald-500",
      icon: "✓",
    },
    error: {
      bg: "bg-gradient-to-r from-red-500 to-rose-500",
      icon: "✕",
    },
    warning: {
      bg: "bg-gradient-to-r from-amber-500 to-orange-500",
      icon: "⚠",
    },
    info: {
      bg: "bg-gradient-to-r from-blue-500 to-indigo-500",
      icon: "ℹ",
    },
  };

  const { bg, icon } = styles[type];

  return (
    <div
      className={`${bg} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slideUp`}
      role="alert"
    >
      <span className="text-lg flex-shrink-0">{icon}</span>
      <span className="text-sm font-medium leading-tight">{message}</span>
      <button
        onClick={() => onClose(id)}
        className="ml-auto text-white/80 hover:text-white transition-colors"
        aria-label="닫기"
      >
        ✕
      </button>
    </div>
  );
}
