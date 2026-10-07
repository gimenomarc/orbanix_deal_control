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
  ChevronLeft,
  ChevronRight,
  Gavel,
  X,
} from 'lucide-react';
import { CalendarEvent } from '@/types';

type ViewMode = 'semanal' | 'mensual' | 'lista';

const HOURS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

const WEEKDAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function AgendaPage() {
  const store = useStore();
  const { success } = useToast();

  const events = store.getEvents();
  const clients = store.getClients();
  const assets = store.getAssets();
  const profiles = store.getProfiles();

  // State
  const [viewMode, setViewMode] = React.useState<ViewMode>('semanal');
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date(2026, 9, 5)); // 5 Octubre 2026
  const [typeFilter, setTypeFilter] = React.useState<string>('todos');
  const [commercialFilter, setCommercialFilter] = React.useState<string>('todos');

  // Selected event modal
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);

  // New Event Modal state
  const [isNewEventModalOpen, setIsNewEventModalOpen] = React.useState(false);
  const [formTitle, setFormTitle] = React.useState('');
  const [formDescription, setFormDescription] = React.useState('');
  const [formStartAt, setFormStartAt] = React.useState('2026-10-06T10:00');
  const [formEndAt, setFormEndAt] = React.useState('2026-10-06T11:00');
  const [formLocation, setFormLocation] = React.useState('Oficina Central ORBANIX');
  const [formType, setFormType] = React.useState<CalendarEvent['event_type']>('reunion');
  const [formAssignedId, setFormAssignedId] = React.useState('');
  const [formClientId, setFormClientId] = React.useState('');
  const [formAssetId, setFormAssetId] = React.useState('');

  const teamMembers = profiles.filter((p) => p.active);

  // Filtered Events
  const filteredEvents = events.filter((e) => {
    const matchesType = typeFilter === 'todos' || e.event_type === typeFilter;
    const matchesCommercial =
      commercialFilter === 'todos' ||
      e.assigned_user_id === commercialFilter ||
      e.assigned_user_name?.toLowerCase().includes(commercialFilter.toLowerCase());
    return matchesType && matchesCommercial;
  });

  const handlePrev = () => {
    if (viewMode === 'semanal') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else if (viewMode === 'mensual') {
      const d = new Date(currentDate);
      d.setMonth(d.getMonth() - 1);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    if (viewMode === 'semanal') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else if (viewMode === 'mensual') {
      const d = new Date(currentDate);
      d.setMonth(d.getMonth() + 1);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 9, 5));
  };

  const getWeekDates = (baseDate: Date) => {
    const curr = new Date(baseDate);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(curr.setDate(diff));

    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      week.push(nextDay);
    }
    return week;
  };

  const weekDates = getWeekDates(currentDate);

  const getMonthMatrix = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const matrix: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];

    let startDayOfWeek = firstDay.getDay();
    if (startDayOfWeek === 0) startDayOfWeek = 7;

    for (let i = 1; i < startDayOfWeek; i++) {
      const prevDate = new Date(year, month, 1 - (startDayOfWeek - i));
      currentWeek.push(prevDate);
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      currentWeek.push(date);
      if (currentWeek.length === 7) {
        matrix.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      let nextMonthDay = 1;
      while (currentWeek.length < 7) {
        currentWeek.push(new Date(year, month + 1, nextMonthDay++));
      }
      matrix.push(currentWeek);
    }

    return matrix;
  };

  const monthMatrix = getMonthMatrix(currentDate);

  const getEventBadgeStyle = (type: CalendarEvent['event_type']) => {
    switch (type) {
      case 'visita':
        return 'border-blue-300 bg-blue-50/95 text-blue-900 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-800';
      case 'reunion':
        return 'border-emerald-300 bg-emerald-50/95 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800';
      case 'firma':
        return 'border-purple-300 bg-purple-50/95 text-purple-900 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-800';
      case 'llamada':
        return 'border-amber-300 bg-amber-50/95 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800';
      case 'subasta':
        return 'border-rose-300 bg-rose-50/95 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800';
      default:
        return 'border-neutral-300 bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700';
    }
  };

  const getEventIcon = (type: CalendarEvent['event_type']) => {
    switch (type) {
      case 'reunion':
        return <Users className="h-3.5 w-3.5" />;
      case 'llamada':
        return <Phone className="h-3.5 w-3.5" />;
      case 'visita':
        return <MapPin className="h-3.5 w-3.5" />;
      case 'firma':
        return <FileCheck className="h-3.5 w-3.5" />;
      case 'subasta':
        return <Gavel className="h-3.5 w-3.5" />;
      default:
        return <Briefcase className="h-3.5 w-3.5" />;
    }
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const handleOpenCreateAtSlot = (date: Date, hourStr: string) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hourNum = parseInt(hourStr.split(':')[0], 10);
    const nextHourNum = Math.min(hourNum + 1, 23);

    const startIso = `${yyyy}-${mm}-${dd}T${hourStr}`;
    const endIso = `${yyyy}-${mm}-${dd}T${pad(nextHourNum)}:00`;

    setFormStartAt(startIso);
    setFormEndAt(endIso);
    setFormTitle('');
    setFormDescription('');
    setFormClientId(clients[0]?.id || '');
    setFormAssetId('');
    setFormAssignedId(teamMembers[0]?.id || '');
    setIsNewEventModalOpen(true);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return;

    const cli = clients.find((c) => c.id === formClientId);
    const ast = assets.find((a) => a.id === formAssetId);
    const user = profiles.find((p) => p.id === formAssignedId);

    store.addEvent({
      title: formTitle,
      description: formDescription,
      start_at: formStartAt,
      end_at: formEndAt,
      all_day: false,
      location: formLocation,
      event_type: formType,
      assigned_user_id: user?.id,
      assigned_user_name: user ? `${user.first_name} ${user.last_name}` : undefined,
      client_id: cli?.id,
      client_name: cli?.legal_name,
      asset_id: ast?.id,
      asset_reference: ast?.reference,
      status: 'programado',
    });

    setIsNewEventModalOpen(false);
    setFormTitle('');
    setFormDescription('');
    success('Cita programada', 'El evento ha sido registrado en la agenda corporativa.');
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm('¿Deseas eliminar permanentemente esta cita de la agenda?')) {
      store.deleteEvent(id);
      setSelectedEvent(null);
      success('Evento eliminado', 'La cita ha sido borrada.');
    }
  };

  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const currentMonthName = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  return (
    <div className="space-y-6">
      <PageHeader
        category="Calendario Comercial & Actividad"
        title="Agenda Visual de Operaciones"
        description="Planificación semanal con franjas horarias y calendario mensual para el equipo comercial y dirección."
        actions={
          <Button
            size="sm"
            onClick={() => {
              handleOpenCreateAtSlot(new Date(2026, 9, 6), '10:00');
            }}
            className="text-xs cursor-pointer shadow-xs"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nueva cita
          </Button>
        }
      />

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-3.5 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-lg p-0.5 bg-neutral-50 dark:bg-neutral-800">
            <button
              onClick={handlePrev}
              className="p-1.5 hover:bg-white dark:hover:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
              title="Periodo anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold hover:bg-white dark:hover:bg-neutral-700 rounded text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
            >
              Hoy
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 hover:bg-white dark:hover:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
              title="Periodo siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            {viewMode === 'semanal' && (
              <span>
                Semana del {weekDates[0]?.getDate()} al {weekDates[6]?.getDate()} de{' '}
                {monthNames[weekDates[6]?.getMonth()] || currentMonthName} {currentYear}
              </span>
            )}
            {viewMode === 'mensual' && (
              <span>
                {currentMonthName} {currentYear}
              </span>
            )}
            {viewMode === 'lista' && (
              <span>Listado Cronológico · {currentMonthName} {currentYear}</span>
            )}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={commercialFilter}
            onChange={(e) => setCommercialFilter(e.target.value)}
            className="text-xs h-8.5 w-44 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
          >
            <option value="todos">Todos los responsables</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.first_name} {m.last_name}
              </option>
            ))}
          </Select>

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs h-8.5 w-38 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
          >
            <option value="todos">Todos los tipos</option>
            <option value="visita">Visitas técnicas</option>
            <option value="reunion">Reuniones</option>
            <option value="firma">Firmas notariales</option>
            <option value="llamada">Llamadas</option>
            <option value="subasta">Subastas BOE</option>
          </Select>

          <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-lg p-0.5 bg-neutral-100 dark:bg-neutral-800">
            <button
              onClick={() => setViewMode('semanal')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                viewMode === 'semanal'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setViewMode('mensual')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                viewMode === 'mensual'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setViewMode('lista')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                viewMode === 'lista'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Lista
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: WEEKLY TIME SLOTS */}
      {viewMode === 'semanal' && (
        <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-2xs overflow-x-auto">
          <div className="min-w-[860px]">
            <div className="grid grid-cols-8 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 text-xs font-medium sticky top-0 z-10">
              <div className="p-3 text-center text-neutral-400 font-mono text-[11px] border-r border-neutral-200 dark:border-neutral-800">
                HORA
              </div>
              {weekDates.map((dayDate, idx) => {
                const isToday = isSameDay(dayDate, new Date(2026, 9, 5));
                return (
                  <div
                    key={idx}
                    className={`p-3 text-center border-r border-neutral-200 dark:border-neutral-800 last:border-r-0 ${
                      isToday ? 'bg-purple-50/50 dark:bg-purple-950/20' : ''
                    }`}
                  >
                    <p className="text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      {WEEKDAY_NAMES[idx]}
                    </p>
                    <div className="flex items-center justify-center mt-0.5">
                      <span
                        className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${
                          isToday
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'text-neutral-800 dark:text-neutral-200'
                        }`}
                      >
                        {dayDate.getDate()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {HOURS.map((hour) => {
                const hourInt = parseInt(hour.split(':')[0], 10);

                return (
                  <div key={hour} className="grid grid-cols-8 min-h-[76px] group">
                    <div className="p-2 text-right pr-3 font-mono text-[11px] text-neutral-400 border-r border-neutral-100 dark:border-neutral-800/80 select-none bg-neutral-50/40 dark:bg-neutral-900/40">
                      {hour}
                    </div>

                    {weekDates.map((dayDate, dIdx) => {
                      const dayEvents = filteredEvents.filter((evt) => {
                        const evtDate = new Date(evt.start_at);
                        const matchDay = isSameDay(evtDate, dayDate);
                        const matchHour = evtDate.getHours() === hourInt;
                        return matchDay && matchHour;
                      });

                      const isToday = isSameDay(dayDate, new Date(2026, 9, 5));

                      return (
                        <div
                          key={dIdx}
                          onClick={(e) => {
                            if ((e.target as HTMLElement).closest('.event-card')) return;
                            handleOpenCreateAtSlot(dayDate, hour);
                          }}
                          className={`p-1.5 border-r border-neutral-100 dark:border-neutral-800/60 last:border-r-0 relative hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30 transition-colors cursor-pointer ${
                            isToday ? 'bg-purple-50/15' : ''
                          }`}
                          title={`Click para añadir cita el ${WEEKDAY_NAMES[dIdx]} a las ${hour}`}
                        >
                          {dayEvents.map((evt) => (
                            <div
                              key={evt.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(evt);
                              }}
                              className={`event-card p-2 rounded-lg border shadow-2xs mb-1 transition-all hover:scale-[1.02] cursor-pointer text-left ${getEventBadgeStyle(
                                evt.event_type
                              )}`}
                            >
                              <div className="flex items-center justify-between gap-1 text-[10px] font-semibold mb-0.5">
                                <span className="flex items-center gap-1">
                                  {getEventIcon(evt.event_type)}
                                  <span className="capitalize">{evt.event_type}</span>
                                </span>
                                <span className="font-mono text-[9px] opacity-80">
                                  {new Date(evt.start_at).toLocaleTimeString('es-ES', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>

                              <p className="text-[11px] font-bold truncate leading-tight">
                                {evt.title}
                              </p>

                              {evt.assigned_user_name && (
                                <p className="text-[10px] text-neutral-600 dark:text-neutral-300 mt-1 truncate">
                                  {evt.assigned_user_name}
                                </p>
                              )}

                              {evt.location && (
                                <p className="text-[9px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate flex items-center gap-0.5">
                                  <MapPin className="h-2.5 w-2.5 shrink-0" />
                                  {evt.location}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MONTHLY GRID */}
      {viewMode === 'mensual' && (
        <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-2xs overflow-hidden">
          <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 text-xs font-semibold text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
            {WEEKDAY_NAMES.map((name, i) => (
              <div key={i} className="p-3 text-center uppercase tracking-wider text-[11px]">
                {name}
              </div>
            ))}
          </div>

          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {monthMatrix.map((week, wIdx) => (
              <div key={wIdx} className="grid grid-cols-7 divide-x divide-neutral-200 dark:divide-neutral-800 min-h-[110px]">
                {week.map((dayDate, dIdx) => {
                  if (!dayDate) {
                    return <div key={dIdx} className="bg-neutral-50/50 dark:bg-neutral-950/20" />;
                  }

                  const isCurrentMonth = dayDate.getMonth() === currentDate.getMonth();
                  const isToday = isSameDay(dayDate, new Date(2026, 9, 5));

                  const dayEvents = filteredEvents.filter((evt) => {
                    const evtDate = new Date(evt.start_at);
                    return isSameDay(evtDate, dayDate);
                  });

                  return (
                    <div
                      key={dIdx}
                      onClick={() => handleOpenCreateAtSlot(dayDate, '10:00')}
                      className={`p-2 flex flex-col justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer ${
                        !isCurrentMonth ? 'bg-neutral-50/40 dark:bg-neutral-950/30 opacity-40' : ''
                      } ${isToday ? 'bg-purple-50/30 dark:bg-purple-950/20' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`h-6 w-6 text-xs flex items-center justify-center rounded-full font-bold ${
                            isToday
                              ? 'bg-purple-600 text-white'
                              : 'text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          {dayDate.getDate()}
                        </span>

                        {dayEvents.length > 0 && (
                          <span className="text-[10px] text-neutral-400 font-semibold">
                            {dayEvents.length} cita{dayEvents.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 mt-1.5 flex-1">
                        {dayEvents.slice(0, 3).map((evt) => (
                          <div
                            key={evt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(evt);
                            }}
                            className={`p-1 rounded text-[10px] font-medium border truncate transition-all hover:scale-[1.02] cursor-pointer ${getEventBadgeStyle(
                              evt.event_type
                            )}`}
                          >
                            <span className="font-mono text-[9px] font-bold mr-1">
                              {new Date(evt.start_at).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {evt.title}
                          </div>
                        ))}

                        {dayEvents.length > 3 && (
                          <p className="text-[9px] text-purple-600 dark:text-purple-400 font-semibold pl-1">
                            +{dayEvents.length - 3} más
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: LIST */}
      {viewMode === 'lista' && (
        <>
          {filteredEvents.length === 0 ? (
            <EmptyState
              title="No hay citas programadas"
              description="No tienes eventos o reuniones agendadas con los filtros actuales."
              actionLabel="Agendar nueva reunión"
              onAction={() => handleOpenCreateAtSlot(new Date(2026, 9, 6), '10:00')}
            />
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-neutral-200/90 bg-white hover:border-neutral-300 shadow-2xs transition-all dark:border-neutral-800 dark:bg-neutral-900 cursor-pointer group"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 group-hover:bg-purple-100 group-hover:text-purple-700 dark:group-hover:bg-purple-950 dark:group-hover:text-purple-300 transition-colors">
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
                        {evt.assigned_user_name && (
                          <span className="flex items-center gap-1 font-medium text-neutral-600 dark:text-neutral-300">
                            <Users className="h-3 w-3 text-neutral-400" />
                            {evt.assigned_user_name}
                          </span>
                        )}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(evt.id);
                      }}
                      className="h-8 px-2 text-xs text-neutral-400 hover:text-red-600 border-neutral-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* EVENT DETAILS MODAL */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.title}
          description="Ficha detallada del evento y participantes convocados."
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <span className={`px-2.5 py-1 rounded text-xs font-semibold border ${getEventBadgeStyle(selectedEvent.event_type)}`}>
                {selectedEvent.event_type.toUpperCase()}
              </span>
              <span className="text-neutral-400 font-mono text-xs">
                {formatDate(selectedEvent.start_at)}
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                <Clock className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">Horario</p>
                  <p className="text-neutral-500">
                    {new Date(selectedEvent.start_at).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    -{' '}
                    {new Date(selectedEvent.end_at).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {selectedEvent.assigned_user_name && (
                <div className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                  <Users className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">Responsable</p>
                    <p className="text-neutral-500">{selectedEvent.assigned_user_name}</p>
                  </div>
                </div>
              )}

              {selectedEvent.location && (
                <div className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                  <MapPin className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">Ubicación</p>
                    <p className="text-neutral-500">{selectedEvent.location}</p>
                  </div>
                </div>
              )}

              {selectedEvent.client_name && (
                <div className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                  <Briefcase className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">Cliente Asociado</p>
                    <p className="text-neutral-500">{selectedEvent.client_name}</p>
                  </div>
                </div>
              )}

              {selectedEvent.description && (
                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800">
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Notas / Orden del día</p>
                  <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Eliminar Cita
              </Button>

              <Button
                size="sm"
                onClick={() => setSelectedEvent(null)}
                className="cursor-pointer"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* NEW EVENT MODAL */}
      <Modal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        title="Agendar Nueva Cita Comercial"
        description="Programa una reunión con inversores, visita técnica a inmueble o firma notarial."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1">Título del Evento *</label>
            <Input
              type="text"
              required
              placeholder="Ej: Visita técnica Santa Engracia con técnicos Merlin"
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
                <option value="visita">Visita técnica / In situ</option>
                <option value="reunion">Reunión de comité / Inversor</option>
                <option value="firma">Firma notarial / Arras</option>
                <option value="llamada">Llamada telefónica / Cualificación</option>
                <option value="subasta">Subasta judicial BOE</option>
              </Select>
            </div>

            <div>
              <label className="block font-medium mb-1">Comercial / Responsable *</label>
              <Select
                value={formAssignedId}
                onChange={(e) => setFormAssignedId(e.target.value)}
              >
                <option value="">Seleccionar responsable...</option>
                {teamMembers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name} ({p.role})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Fecha y Hora de Inicio *</label>
              <Input
                type="datetime-local"
                required
                value={formStartAt}
                onChange={(e) => setFormStartAt(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Fecha y Hora de Fin *</label>
              <Input
                type="datetime-local"
                required
                value={formEndAt}
                onChange={(e) => setFormEndAt(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Lugar / Enlace de Videollamada</label>
            <Input
              type="text"
              placeholder="Dirección del activo, notaría o enlace de Microsoft Teams"
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Cliente Vinculado</label>
              <Select
                value={formClientId}
                onChange={(e) => setFormClientId(e.target.value)}
              >
                <option value="">Sin cliente específico</option>
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
                <option value="">Sin activo específico</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.reference} - {a.title}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Descripción / Orden del Día</label>
            <textarea
              className="w-full rounded-md border border-neutral-300 bg-white p-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              rows={3}
              placeholder="Objetivo de la cita, temas a tratar, documentación a aportar..."
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
            <Button type="submit">Agendar cita</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
