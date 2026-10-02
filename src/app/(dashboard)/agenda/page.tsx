'use client';

import * as React from 'react';
import { useStore } from '@/hooks/useStore';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Trash2,
  Users,
  Phone,
  Briefcase,
  FileCheck,
} from 'lucide-react';
import { CalendarEvent } from '@/types';

export default function AgendaPage() {
  const store = useStore();
  const { success } = useToast();

  const events = store.getEvents();
  const clients = store.getClients();
  const assets = store.getAssets();
  const operations = store.getOperations();

  const [typeFilter, setTypeFilter] = React.useState<string>('todos');
  const [viewMode, setViewMode] = React.useState<'lista' | 'semanal'>('lista');

  // Modal state
  const [isNewEventModalOpen, setIsNewEventModalOpen] = React.useState(false);
  const [formTitle, setFormTitle] = React.useState('');
  const [formDescription, setFormDescription] = React.useState('');
  const [formStartAt, setFormStartAt] = React.useState('2026-10-06T10:00');
  const [formEndAt, setFormEndAt] = React.useState('2026-10-06T11:00');
  const [formLocation, setFormLocation] = React.useState('Oficina Central ORBANIX');
  const [formType, setFormType] = React.useState<CalendarEvent['event_type']>('reunion');
  const [formClientId, setFormClientId] = React.useState('');
  const [formAssetId, setFormAssetId] = React.useState('');

  const filteredEvents = events.filter((e) => {
    return typeFilter === 'todos' || e.event_type === typeFilter;
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return;

    const cli = clients.find((c) => c.id === formClientId);
    const ast = assets.find((a) => a.id === formAssetId);

    store.addEvent({
      title: formTitle,
      description: formDescription,
      start_at: new Date(formStartAt).toISOString(),
      end_at: new Date(formEndAt).toISOString(),
      all_day: false,
      location: formLocation,
      event_type: formType,
      client_id: cli?.id,
      client_name: cli?.legal_name,
      asset_id: ast?.id,
      asset_reference: ast?.reference,
      status: 'programado',
    });

    setIsNewEventModalOpen(false);
    setFormTitle('');
    setFormDescription('');
    success('Cita programada', 'El evento ha sido registrado en la agenda.');
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm('¿Eliminar esta cita de la agenda?')) {
      store.deleteEvent(id);
      success('Evento eliminado', 'La cita ha sido borrada.');
    }
  };

  const getEventIcon = (type: CalendarEvent['event_type']) => {
    switch (type) {
      case 'reunion':
        return <Users className="h-4 w-4" />;
      case 'llamada':
        return <Phone className="h-4 w-4" />;
      case 'visita':
        return <MapPin className="h-4 w-4" />;
      case 'firma':
        return <FileCheck className="h-4 w-4" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Calendario & Actividad"
        title="Agenda"
        description="Planificación de reuniones de comité, visitas técnicas a inmuebles y firmas notariales."
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setIsNewEventModalOpen(true)} className="text-xs">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Nueva cita
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-2">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs h-9 w-44"
          >
            <option value="todos">Todos los eventos</option>
            <option value="reunion">Reuniones</option>
            <option value="visita">Visitas técnicas</option>
            <option value="llamada">Llamadas</option>
            <option value="firma">Firmas notariales</option>
            <option value="subasta">Subastas</option>
          </Select>
        </div>

        <span className="text-xs text-neutral-500">
          {filteredEvents.length} eventos programados
        </span>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          title="No hay citas programadas"
          description="No tienes eventos o reuniones agendadas con los filtros actuales."
          actionLabel="Agendar nueva reunión"
          onAction={() => setIsNewEventModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-neutral-200/90 bg-white hover:border-neutral-300 shadow-2xs transition-all dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {getEventIcon(evt.event_type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                      {evt.title}
                    </h4>
                    <Badge variant="outline" className="capitalize text-[10px]">
                      {evt.event_type}
                    </Badge>
                  </div>
                  {evt.description && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {evt.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(evt.start_at)}
                    </span>
                    {evt.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {evt.location}
                      </span>
                    )}
                    {evt.client_name && <span>Cliente: {evt.client_name}</span>}
                    {evt.asset_reference && <span>Activo: {evt.asset_reference}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteEvent(evt.id)}
                  className="h-8 px-2 text-xs text-neutral-400 hover:text-red-600 border-neutral-200"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Event Modal */}
      <Modal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        title="Agendar Cita / Evento"
        description="Programa una reunión, visita a inmueble o trámite notarial."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1">Título del Evento *</label>
            <Input
              type="text"
              required
              placeholder="Ej: Visita técnica Santa Engracia"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Tipo de Evento</label>
              <Select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
              >
                <option value="reunion">Reunión</option>
                <option value="visita">Visita técnica</option>
                <option value="llamada">Llamada</option>
                <option value="firma">Firma notarial</option>
                <option value="subasta">Subasta judicial</option>
              </Select>
            </div>
            <div>
              <label className="block font-medium mb-1">Lugar / Enlace</label>
              <Input
                type="text"
                placeholder="Dirección o Microsoft Teams"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Inicio *</label>
              <Input
                type="datetime-local"
                required
                value={formStartAt}
                onChange={(e) => setFormStartAt(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Fin *</label>
              <Input
                type="datetime-local"
                required
                value={formEndAt}
                onChange={(e) => setFormEndAt(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Cliente Vinculado</label>
              <Select
                value={formClientId}
                onChange={(e) => setFormClientId(e.target.value)}
              >
                <option value="">Opcional / Ninguno</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.legal_name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block font-medium mb-1">Activo Vinculado</label>
              <Select
                value={formAssetId}
                onChange={(e) => setFormAssetId(e.target.value)}
              >
                <option value="">Opcional / Ninguno</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.reference} — {a.title}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Descripción / Orden del Día</label>
            <textarea
              rows={2}
              className="w-full rounded-md border border-neutral-300 bg-white p-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewEventModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Guardar evento</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
