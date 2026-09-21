"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { CheckCircle2, AlertCircle, Info, Copy, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "copy";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    copy: (message: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration: number = 3200) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, type, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = useMemo(
    () => ({
      success: (msg: string, dur?: number) => addToast("success", msg, dur),
      error: (msg: string, dur?: number) => addToast("error", msg, dur),
      info: (msg: string, dur?: number) => addToast("info", msg, dur),
      copy: (msg: string, dur?: number) => addToast("copy", msg, dur),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Portal Container */}
      <aside
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => {
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 bg-[#171717] text-white border border-[#333333] rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.2)] animate-in fade-in slide-in-from-bottom-3 duration-200 transition-all text-[13.5px] font-medium"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {t.type === "success" && (
                  <CheckCircle2 size={17} className="text-emerald-400 shrink-0" />
                )}
                {t.type === "copy" && (
                  <Copy size={16} className="text-[#FF5A1F] shrink-0" />
                )}
                {t.type === "error" && (
                  <AlertCircle size={17} className="text-rose-400 shrink-0" />
                )}
                {t.type === "info" && (
                  <Info size={17} className="text-sky-400 shrink-0" />
                )}
                <span className="truncate leading-snug">{t.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-md shrink-0"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback safe dummy functions if rendered outside provider
    return {
      toast: {
        success: (msg: string) => console.log("[Toast success]", msg),
        error: (msg: string) => console.error("[Toast error]", msg),
        info: (msg: string) => console.info("[Toast info]", msg),
        copy: (msg: string) => console.log("[Toast copy]", msg),
      },
    };
  }
  return context;
}
