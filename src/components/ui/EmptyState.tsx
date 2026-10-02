'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { FolderOpen } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white/50 p-12 text-center dark:border-neutral-800 dark:bg-neutral-900/30',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
        {icon || <FolderOpen className="h-6 w-6" />}
      </div>
      <h3 className="mt-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-xs text-neutral-500 dark:text-neutral-400">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
