'use client';

import * as React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  showToast: (title: string, message?: string, type?: ToastType) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = React.useCallback(
    (title: string, message?: string, type: ToastType = 'info') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, title, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = React.useCallback(
    (title: string, message?: string) => showToast(title, message, 'success'),
    [showToast]
  );
  const error = React.useCallback(
    (title: string, message?: string) => showToast(title, message, 'error'),
    [showToast]
  );
  const info = React.useCallback(
    (title: string, message?: string) => showToast(title, message, 'info'),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-lg transition-all animate-in slide-in-from-bottom-5 dark:border-neutral-800 dark:bg-neutral-900"
          >
            {toast.type === 'success' && (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            )}
            {toast.type === 'info' && (
              <Info className="h-5 w-5 text-neutral-500 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) {
    return {
      showToast: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
    };
  }
  return context;
}
