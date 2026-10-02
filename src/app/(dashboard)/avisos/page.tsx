'use client';

import * as React from 'react';
import { useStore } from '@/hooks/useStore';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime } from '@/lib/utils';
import { Bell, CheckCheck, AlertTriangle, Info, Clock, Briefcase } from 'lucide-react';
import { NotificationItem } from '@/types';

export default function AvisosPage() {
  const store = useStore();
  const { success } = useToast();

  const notifications = store.getNotifications();
  const [filterType, setFilterType] = React.useState('todos');

  const filtered = notifications.filter(
    (n) => filterType === 'todos' || n.type === filterType
  );

  const handleMarkAllRead = () => {
    store.markAllNotificationsAsRead();
    success('Avisos actualizados', 'Todas las notificaciones han sido marcadas como leídas.');
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'alerta':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'vencimiento':
        return <Clock className="h-4 w-4 text-rose-500" />;
      case 'operacion':
        return <Briefcase className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-neutral-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Centro de Alertas"
        title="Avisos"
        description="Notificaciones de sistema, plazos procesales urgentes y actualizaciones de operaciones."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-xs"
          >
            <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
            Marcar todas como leídas
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        {['todos', 'alerta', 'info', 'vencimiento', 'operacion'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`text-xs font-semibold capitalize pb-2 border-b-2 cursor-pointer ${
              filterType === t
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Sin avisos pendientes"
          description="No tienes notificaciones en este filtro."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className={`p-4 flex items-start gap-3.5 transition-colors ${
                !item.read_at
                  ? 'border-l-4 border-l-neutral-900 bg-white dark:border-l-white dark:bg-neutral-900'
                  : 'bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-500'
              }`}
            >
              <div className="mt-0.5">{getIcon(item.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    {item.title}
                  </h4>
                  <span className="text-[11px] text-neutral-400">
                    {formatDateTime(item.created_at)}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
                  {item.message}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
