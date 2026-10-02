'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  linkText?: string;
  linkHref?: string;
  onLinkClick?: () => void;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  linkText = 'Ver detalle',
  linkHref,
  onLinkClick,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col justify-between rounded-xl border border-neutral-200/90 bg-white p-5 shadow-2xs transition-shadow hover:shadow-xs dark:border-neutral-800 dark:bg-neutral-900',
        className
      )}
    >
      <div>
        <p className="text-xs font-normal text-neutral-600 dark:text-neutral-400 line-clamp-2 min-h-[32px]">
          {title}
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">{subtitle}</p>
        )}
      </div>

      <div className="mt-4 pt-2">
        {linkHref ? (
          <Link
            href={linkHref}
            className="inline-flex items-center text-xs font-normal text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white group"
          >
            <span>{linkText}</span>
            <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : onLinkClick ? (
          <button
            type="button"
            onClick={onLinkClick}
            className="inline-flex items-center text-xs font-normal text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white group cursor-pointer"
          >
            <span>{linkText}</span>
            <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        ) : (
          <span className="inline-flex items-center text-xs font-normal text-neutral-600 group cursor-default">
            <span>{linkText}</span>
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </div>
  );
}
