'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  width?: 'md' | 'lg' | 'xl' | '2xl';
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  width = 'lg',
}: DrawerProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className={cn(
            'w-screen transform border-l border-neutral-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:border-neutral-800 dark:bg-neutral-900',
            widthClasses[width]
          )}
        >
          <div className="flex h-full flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                  {title}
                </h2>
                {description && (
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Cerrar</span>
              </button>
            </div>

            {/* Body */}
            <div className="relative flex-1 overflow-y-auto px-6 py-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
