'use client';

import * as React from 'react';
import { Activity } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { Phone, Mail, Users, FileText, ArrowRightLeft, CheckSquare, File, Laptop } from 'lucide-react';

interface ActivityTimelineProps {
  activities: Activity[];
  className?: string;
}

export function ActivityTimeline({ activities, className }: ActivityTimelineProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-neutral-400">
        No hay registros de actividad todavía.
      </div>
    );
  }

  const getIcon = (type: Activity['activity_type']) => {
    switch (type) {
      case 'llamada':
        return <Phone className="h-3.5 w-3.5" />;
      case 'email':
        return <Mail className="h-3.5 w-3.5" />;
      case 'reunion':
        return <Users className="h-3.5 w-3.5" />;
      case 'nota':
        return <FileText className="h-3.5 w-3.5" />;
      case 'cambio_fase':
        return <ArrowRightLeft className="h-3.5 w-3.5" />;
      case 'tarea':
        return <CheckSquare className="h-3.5 w-3.5" />;
      case 'documento':
        return <File className="h-3.5 w-3.5" />;
      default:
        return <Laptop className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className={`relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-800 ${className || ''}`}>
      {activities.map((act) => (
        <div key={act.id} className="relative group">
          <div className="absolute -left-6 mt-1 flex h-5 w-5 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-600 shadow-xs dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
            {getIcon(act.activity_type)}
          </div>
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-neutral-900 dark:text-neutral-200">
                {act.title}
              </span>
              <span className="text-[11px] text-neutral-400">
                {formatDateTime(act.created_at)}
              </span>
            </div>
            {act.description && (
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {act.description}
              </p>
            )}
            {act.user_name && (
              <p className="mt-1 text-[11px] text-neutral-400">
                Por: <span className="font-medium text-neutral-600 dark:text-neutral-300">{act.user_name}</span>
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
