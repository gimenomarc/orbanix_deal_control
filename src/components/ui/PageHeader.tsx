'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  category?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  category,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div>
        {category && (
          <p className="text-xs font-normal text-neutral-500 dark:text-neutral-400 mb-1">
            {category}
          </p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 max-w-3xl">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 self-start">{actions}</div>}
    </div>
  );
}
