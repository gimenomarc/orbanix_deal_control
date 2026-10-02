'use client';

import * as React from 'react';
import Link from 'next/link';
import { useStore } from '@/hooks/useStore';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowRight, RefreshCw, Calendar, Clock } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function InicioPage() {
  const store = useStore();
  const { success } = useToast();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Period state
  const [periodType, setPeriodType] = React.useState('Mensual');
  const [periodYear, setPeriodYear] = React.useState('2026');
  const [periodMonth, setPeriodMonth] = React.useState('octubre');

  const systemConnections = store.getSystemConnections();
  const leads = store.getLeads();
  const clients = store.getClients();
  const prescriptions = store.getPrescriptions();
  const events = store.getEvents();

  // Metrics calculation
  const pendingContactLeads = leads.filter((l) => l.status === 'nuevo').length;
  const unassignedLeads = leads.filter((l) => !l.assigned_user_id && !l.assigned_user_name).length;
  const clientsWithoutContact = clients.filter((c) => c.status === 'prospecto').length;
  const overduePrescriptions = prescriptions.filter((p) => p.status === 'vencido' || p.status === 'proximo').length;

  // Filter next 7 days events
  const now = new Date();
  const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingEvents = events.filter((e) => {
    try {
      const eventDate = new Date(e.start_at);
      return eventDate >= now && eventDate <= next7Days;
    } catch {
      return false;
    }
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      success('Datos actualizados', 'El estado del sistema y métricas se han actualizado correctamente.');
    }, 600);
  };

  const getStatusColor = (status: 'Conectado' | 'Pendiente' | 'Sin conexión') => {
    switch (status) {
      case 'Conectado':
        return 'text-emerald-700 dark:text-emerald-400';
      case 'Pendiente':
        return 'text-amber-700 dark:text-amber-400';
      case 'Sin conexión':
        return 'text-neutral-500 dark:text-neutral-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        category="Administración"
        title="Control de la plataforma"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            loading={isRefreshing}
            className="rounded-md border-neutral-300 dark:border-neutral-700 text-xs px-3"
          >
            {!isRefreshing && <RefreshCw className="mr-1.5 h-3.5 w-3.5" />}
            Actualizar
          </Button>
        }
      />

      {/* Period Filter Card */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
          Período
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
          <div>
            <label className="block text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
              Tipo de período
            </label>
            <Select
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value)}
              className="text-xs h-9 bg-neutral-100/60 border-neutral-200"
            >
              <option value="Mensual">Mensual</option>
              <option value="Trimestral">Trimestral</option>
              <option value="Anual">Anual</option>
            </Select>
          </div>

          <div>
            <label className="block text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
              Año
            </label>
            <Input
              type="text"
              value={periodYear}
              onChange={(e) => setPeriodYear(e.target.value)}
              className="text-xs h-9 bg-neutral-100/60 border-neutral-200"
            />
          </div>

          <div>
            <label className="block text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
              Mes o trimestre
            </label>
            <Select
              value={periodMonth}
              onChange={(e) => setPeriodMonth(e.target.value)}
              className="text-xs h-9 bg-neutral-100/60 border-neutral-200"
            >
              <option value="enero">enero</option>
              <option value="febrero">febrero</option>
              <option value="marzo">marzo</option>
              <option value="abril">abril</option>
              <option value="mayo">mayo</option>
              <option value="junio">junio</option>
              <option value="julio">julio</option>
              <option value="agosto">agosto</option>
              <option value="septiembre">septiembre</option>
              <option value="octubre">octubre</option>
              <option value="noviembre">noviembre</option>
              <option value="diciembre">diciembre</option>
            </Select>
          </div>
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 pt-1">
          El período se aplica a actividad y objetivos. Las citas, avisos, operaciones abiertas y saldos muestran la situación actual.
        </p>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Left Column: Conexiones y servicios */}
        <div className="lg:col-span-7">
          <Card className="rounded-xl border border-neutral-200/90 shadow-2xs">
            <div className="flex items-center justify-between p-5 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Conexiones y servicios
              </h3>
              <Link
                href="/configuracion"
                className="inline-flex items-center text-xs text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
              >
                <span>Abrir</span>
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </div>

            <CardContent className="p-0 divide-y divide-neutral-100 dark:divide-neutral-800">
              {systemConnections.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 px-5 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  <div className="pr-4">
                    <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                      {item.display_name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Metric Cards & Mi agenda */}
        <div className="lg:col-span-5 space-y-6">
          {/* 4 Metric Cards in 2x2 grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard
              title="Consultas pendientes de contacto"
              value={pendingContactLeads}
              linkHref="/leads"
            />
            <MetricCard
              title="Consultas sin responsable"
              value={unassignedLeads}
              linkHref="/leads"
            />
            <MetricCard
              title="Clientes sin contacto registrado"
              value={clientsWithoutContact}
              linkHref="/clientes"
            />
            <MetricCard
              title="Próximas acciones vencidas"
              value={overduePrescriptions}
              linkHref="/prescripciones"
            />
          </div>

          {/* Mi agenda Card */}
          <Card className="rounded-xl border border-neutral-200/90 shadow-2xs">
            <div className="flex items-center justify-between p-5 pb-2">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Mi agenda
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Próximos siete días
                </p>
              </div>
              <Link
                href="/agenda"
                className="inline-flex items-center text-xs text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
              >
                <span>Abrir</span>
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </div>

            <CardContent className="p-5 pt-4">
              {upcomingEvents.length === 0 ? (
                <div className="py-6 text-xs text-neutral-500 dark:text-neutral-400">
                  No tienes citas en los próximos siete días.
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800"
                    >
                      <Calendar className="h-4 w-4 text-neutral-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {evt.title}
                        </p>
                        <p className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(evt.start_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
