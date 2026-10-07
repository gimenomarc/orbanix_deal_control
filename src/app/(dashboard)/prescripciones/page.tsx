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
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';
import {
  Plus,
  Search,
  ArrowRight,
  TrendingUp,
  History,
  CheckCircle2,
  Layers,
  Percent,
  Send
} from 'lucide-react';
import {
  Prescription,
  BusinessArea,
  BUSINESS_AREA_LABELS,
  PrescriptionStatus,
  PrescriptionTimelineItem
} from '@/types';

export default function PrescripcionesPage() {
  const store = useStore();
  const { success } = useToast();

  const prescriptions = store.getPrescriptions();
  const clients = store.getClients();
  const assets = store.getAssets();
  const profiles = store.getProfiles();

  // Filter states
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('todos');
  const [areaFilter, setAreaFilter] = React.useState<string>('todas');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [selectedPrescription, setSelectedPrescription] = React.useState<Prescription | null>(null);
  const [newTimelineComment, setNewTimelineComment] = React.useState('');

  // Create form state
  const [formClientId, setFormClientId] = React.useState(clients[0]?.id || '');
  const [formAssetId, setFormAssetId] = React.useState(assets[0]?.id || '');
  const [formOriginArea, setFormOriginArea] = React.useState<BusinessArea>('open_market');
  const [formOriginUserId, setFormOriginUserId] = React.useState(profiles[0]?.id || '');
  const [formDestArea, setFormDestArea] = React.useState<BusinessArea>('npl');
  const [formDestUserId, setFormDestUserId] = React.useState(profiles[1]?.id || '');
  const [formEstimatedValue, setFormEstimatedValue] = React.useState('1500000');
  const [formCommissionRate, setFormCommissionRate] = React.useState('15');
  const [formNotes, setFormNotes] = React.useState('');

  // Commercials list for selector
  const commercials = profiles.filter(
    (p) => p.role === 'commercial' || p.role === 'admin' || p.role === 'direction'
  );

  // Filter logic
  const filteredPrescriptions = prescriptions.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (p.reference || '').toLowerCase().includes(q) ||
      (p.client_name || '').toLowerCase().includes(q) ||
      (p.asset_title || '').toLowerCase().includes(q) ||
      (p.origin_user_name || '').toLowerCase().includes(q) ||
      (p.destination_user_name || '').toLowerCase().includes(q) ||
      (p.entity_title || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'todos' || p.status === statusFilter;

    const matchesArea =
      areaFilter === 'todas' ||
      p.origin_area === areaFilter ||
      p.destination_area === areaFilter;

    return matchesSearch && matchesStatus && matchesArea;
  });

  // Aggregated KPIs
  const totalVolume = prescriptions.reduce((acc, p) => acc + (p.deal_estimated_value || 0), 0);
  const totalCommissions = prescriptions.reduce((acc, p) => acc + (p.commission_amount || 0), 0);
  const successDeals = prescriptions.filter((p) => p.status === 'cerrada_exito').length;
  const activeDeals = prescriptions.filter(
    (p) => p.status === 'derivada' || p.status === 'aceptada' || p.status === 'en_gestion'
  ).length;

  const handleCreatePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === formClientId);
    const asset = assets.find((a) => a.id === formAssetId);
    const originUser = profiles.find((u) => u.id === formOriginUserId);
    const destUser = profiles.find((u) => u.id === formDestUserId);

    const dealVal = parseFloat(formEstimatedValue) || 0;
    const commRate = parseFloat(formCommissionRate) || 15;
    const estimatedFee = dealVal * 0.03;
    const commissionOrigin = Math.round(estimatedFee * (commRate / 100));

    const initialTimeline: PrescriptionTimelineItem[] = [
      {
        id: 'tl-' + Date.now(),
        date: new Date().toISOString(),
        author: originUser ? `${originUser.first_name} ${originUser.last_name}` : 'Comercial Orbanix',
        action: 'Prescripción generada',
        comment: formNotes || `Derivación iniciada desde ${BUSINESS_AREA_LABELS[formOriginArea]?.label} hacia ${BUSINESS_AREA_LABELS[formDestArea]?.label}.`,
      },
    ];

    const originName = originUser ? `${originUser.first_name} ${originUser.last_name}` : 'Comercial Orbanix';
    const destName = destUser ? `${destUser.first_name} ${destUser.last_name}` : 'Gestor Asignado';

    const created = store.addPrescription({
      origin_area: formOriginArea,
      origin_user_id: originUser?.id,
      origin_user_name: originName,
      destination_area: formDestArea,
      destination_user_id: destUser?.id,
      destination_user_name: destName,
      client_id: client?.id,
      client_name: client ? (client.trade_name || client.legal_name) : 'Cliente Particular',
      asset_id: asset?.id,
      asset_title: asset?.title || 'Oportunidad General',
      deal_estimated_value: dealVal,
      commission_rate: commRate,
      commission_amount: commissionOrigin,
      commission_status: 'pendiente',
      status: 'derivada',
      notes: formNotes,
      timeline: initialTimeline,
      entity_type: 'asset',
      entity_id: asset?.id,
      entity_title: asset?.title,
      responsible_name: destName,
      auto_alert: true,
      days_remaining: 60,
    });

    setIsCreateModalOpen(false);
    setFormNotes('');
    success(
      'Prescripción Registrada',
      `Referencia ${created.reference}: Derivación de ${BUSINESS_AREA_LABELS[formOriginArea]?.code} a ${BUSINESS_AREA_LABELS[formDestArea]?.code} con comisión del ${commRate}% asignada.`
    );
  };

  const handleUpdateStatus = (
    prescription: Prescription,
    newStatus: PrescriptionStatus,
    commentText?: string
  ) => {
    const currentTimeline = prescription.timeline || [];
    const statusLabels: Record<string, string> = {
      aceptada: 'Aceptada por receptor',
      en_gestion: 'En negociación activa',
      cerrada_exito: 'Operación cerrada con éxito',
      descartada: 'Descartada',
    };

    const actionText = statusLabels[newStatus] || `Cambio de estado a ${newStatus}`;
    const newEntry: PrescriptionTimelineItem = {
      id: 'tl-' + Date.now(),
      date: new Date().toISOString(),
      author: prescription.destination_user_name || 'Gestor de Área',
      action: actionText,
      comment: commentText || `La prescripción ha avanzado a estado "${newStatus}".`,
    };

    const commStatus =
      newStatus === 'cerrada_exito'
        ? 'devengada'
        : newStatus === 'descartada'
        ? 'cancelada'
        : prescription.commission_status || 'pendiente';

    const updatedTimeline = [...currentTimeline, newEntry];

    store.updatePrescription(prescription.id, {
      status: newStatus,
      commission_status: commStatus,
      timeline: updatedTimeline,
    });

    if (selectedPrescription?.id === prescription.id) {
      setSelectedPrescription({
        ...selectedPrescription,
        status: newStatus,
        commission_status: commStatus,
        timeline: updatedTimeline,
      });
    }

    success('Estado actualizado', `Prescripción ${prescription.reference} ahora en estado ${newStatus}.`);
  };

  const handleAddTimelineNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrescription || !newTimelineComment.trim()) return;

    const currentTimeline = selectedPrescription.timeline || [];
    const newEntry: PrescriptionTimelineItem = {
      id: 'tl-' + Date.now(),
      date: new Date().toISOString(),
      author: selectedPrescription.destination_user_name || 'Comercial Orbanix',
      action: 'Nota de seguimiento',
      comment: newTimelineComment.trim(),
    };

    const updatedTimeline = [...currentTimeline, newEntry];

    store.updatePrescription(selectedPrescription.id, {
      timeline: updatedTimeline,
    });

    setSelectedPrescription({
      ...selectedPrescription,
      timeline: updatedTimeline,
    });

    setNewTimelineComment('');
    success('Nota añadida', 'Se ha registrado el avance en la trazabilidad de la prescripción.');
  };

  const getStatusBadge = (status: PrescriptionStatus) => {
    switch (status) {
      case 'derivada':
        return <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300">Derivada</Badge>;
      case 'aceptada':
        return <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-300">Aceptada</Badge>;
      case 'en_gestion':
        return <Badge variant="warning" className="font-medium">En Gestión</Badge>;
      case 'cerrada_exito':
        return <Badge variant="success" className="font-medium">Cerrada con Éxito</Badge>;
      case 'descartada':
        return <Badge variant="destructive" className="font-medium">Descartada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Comercial & Negocio Inter-Áreas"
        title="Prescripciones Comerciales"
        description="Derivación cruzada de clientes y operaciones entre las cuatro divisiones (NPL, Open Market, Run Off e Institucional), con trazabilidad completa de hitos y atribución de comisiones para el comercial originador."
        actions={
          <Button size="sm" onClick={() => setIsCreateModalOpen(true)} className="text-xs font-semibold shadow-xs">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nueva prescripción inter-área
          </Button>
        }
      />

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-neutral-500">Prescripciones Activas</p>
            <Layers className="h-4 w-4 text-neutral-400" />
          </div>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {activeDeals}
            <span className="ml-2 text-xs font-normal text-neutral-400">de {prescriptions.length} totales</span>
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-neutral-500">Volumen Prescrito</p>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {formatCurrency(totalVolume)}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-neutral-500">Comisiones Originador (€)</p>
            <Percent className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {formatCurrency(totalCommissions)}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-neutral-500">Operaciones Ganadas</p>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {successDeals}
            <span className="ml-2 text-xs font-normal text-neutral-400">deals cerrados</span>
          </p>
        </div>
      </div>

      {/* 4 Business Divisions Quick Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.keys(BUSINESS_AREA_LABELS) as BusinessArea[]).map((areaKey) => {
          const area = BUSINESS_AREA_LABELS[areaKey];
          const countAsDest = prescriptions.filter((p) => p.destination_area === areaKey).length;
          const countAsOrigin = prescriptions.filter((p) => p.origin_area === areaKey).length;
          const isSelected = areaFilter === areaKey;

          return (
            <button
              key={areaKey}
              type="button"
              onClick={() => setAreaFilter(isSelected ? 'todas' : areaKey)}
              className={`text-left p-3.5 rounded-xl border transition-all ${
                isSelected
                  ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900 shadow-md ring-2 ring-neutral-900/20'
                  : 'border-neutral-200/80 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 hover:bg-neutral-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[11px] font-semibold tracking-wider uppercase ${isSelected ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-500'}`}>
                  {area.code}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isSelected
                    ? 'bg-white/20 text-white dark:bg-black/10 dark:text-neutral-900'
                    : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                }`}>
                  {countAsDest + countAsOrigin}
                </span>
              </div>
              <p className="text-xs font-medium truncate">{area.label}</p>
              <div className={`mt-2 flex items-center gap-2 text-[10px] ${isSelected ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-400'}`}>
                <span>{countAsOrigin} emitidas</span>
                <span>•</span>
                <span>{countAsDest} recibidas</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3 rounded-xl border border-neutral-200/80 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <Input
            placeholder="Buscar por cliente, activo, comercial o código PRE..."
            className="pl-9 h-9 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 text-xs min-w-[140px]"
          >
            <option value="todos">Todos los Estados</option>
            <option value="derivada">Derivada</option>
            <option value="aceptada">Aceptada</option>
            <option value="en_gestion">En Gestión</option>
            <option value="cerrada_exito">Cerrada con Éxito</option>
            <option value="descartada">Descartada</option>
          </Select>

          <Select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="h-9 text-xs min-w-[150px]"
          >
            <option value="todas">Todas las Áreas</option>
            <option value="npl">NPL</option>
            <option value="open_market">Open Market</option>
            <option value="run_off">Run Off</option>
            <option value="institutional">Institucional</option>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      {filteredPrescriptions.length === 0 ? (
        <EmptyState
          title="No hay prescripciones coincidentes"
          description="No se han encontrado derivaciones comerciales con los filtros aplicados."
          actionLabel="Restablecer filtros"
          onAction={() => { setSearchQuery(''); setStatusFilter('todos'); setAreaFilter('todas'); }}
        />
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/80">
                <tr>
                  <th className="py-3 px-4">Referencia</th>
                  <th className="py-3 px-4">Cliente & Oportunidad</th>
                  <th className="py-3 px-4">Ruta Inter-Áreas</th>
                  <th className="py-3 px-4">Originador ➔ Receptor</th>
                  <th className="py-3 px-4 text-right">Volumen Deal</th>
                  <th className="py-3 px-4 text-right">Comisión Originador</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-center">Trazabilidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredPrescriptions.map((item) => {
                  const originLabel = item.origin_area ? BUSINESS_AREA_LABELS[item.origin_area] : null;
                  const destLabel = item.destination_area ? BUSINESS_AREA_LABELS[item.destination_area] : null;

                  return (
                    <tr key={item.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors">
                      {/* Ref */}
                      <td className="py-3.5 px-4 font-mono font-medium text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                        <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-[11px]">
                          {item.reference}
                        </span>
                      </td>

                      {/* Client & Asset */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {item.client_name || item.entity_title || 'Cliente Directo'}
                        </p>
                        <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                          {item.asset_title || 'Oportunidad en cartera'}
                        </p>
                      </td>

                      {/* Area flow */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {originLabel ? (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${originLabel.badgeColor}`}>
                              {originLabel.code}
                            </span>
                          ) : (
                            <span className="text-neutral-400">-</span>
                          )}
                          <ArrowRight className="h-3 w-3 text-neutral-400" />
                          {destLabel ? (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${destLabel.badgeColor}`}>
                              {destLabel.code}
                            </span>
                          ) : (
                            <span className="text-neutral-400">-</span>
                          )}
                        </div>
                      </td>

                      {/* Originator ➔ Receiver */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <p className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                          {item.origin_user_name || 'Comercial'}
                        </p>
                        <p className="text-[11px] text-neutral-400 truncate flex items-center gap-1">
                          <span className="text-neutral-300 dark:text-neutral-600">➔</span>
                          {item.destination_user_name || item.responsible_name || 'Gestor'}
                        </p>
                      </td>

                      {/* Deal Volume */}
                      <td className="py-3.5 px-4 text-right font-medium text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                        {formatCurrency(item.deal_estimated_value || 0)}
                      </td>

                      {/* Commission */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <p className="font-bold text-amber-600 dark:text-amber-400">
                          {formatCurrency(item.commission_amount || 0)}
                        </p>
                        <p className="text-[10px] text-neutral-400 capitalize">
                          {item.commission_rate || 15}% ({item.commission_status || 'pendiente'})
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedPrescription(item)}
                          className="h-7 text-[11px] px-2.5 inline-flex items-center gap-1.5"
                        >
                          <History className="h-3 w-3 text-neutral-500" />
                          Trazabilidad ({item.timeline?.length || 1})
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Trazabilidad y Auditoría de la Prescripción */}
      <Modal
        isOpen={Boolean(selectedPrescription)}
        onClose={() => setSelectedPrescription(null)}
        title={selectedPrescription ? `Trazabilidad: ${selectedPrescription.reference}` : 'Trazabilidad'}
        description="Auditoría completa de la derivación inter-área, hitos procesales y liquidación de comisión."
        maxWidth="lg"
      >
        {selectedPrescription && (
          <div className="space-y-5 text-xs">
            {/* Header Summary Box */}
            <div className="rounded-lg border border-neutral-200 bg-neutral-50/70 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/60">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-neutral-400">Cliente</span>
                  <p className="font-bold text-neutral-900 dark:text-neutral-100 truncate mt-0.5">
                    {selectedPrescription.client_name || 'Cliente Particular'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-neutral-400">Ruta</span>
                  <p className="font-medium text-neutral-800 dark:text-neutral-200 mt-0.5">
                    {selectedPrescription.origin_area ? BUSINESS_AREA_LABELS[selectedPrescription.origin_area]?.code : '-'} ➔ {selectedPrescription.destination_area ? BUSINESS_AREA_LABELS[selectedPrescription.destination_area]?.code : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-neutral-400">Comisión Originador</span>
                  <p className="font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                    {formatCurrency(selectedPrescription.commission_amount || 0)} ({selectedPrescription.commission_rate || 15}%)
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-neutral-400">Estado Actual</span>
                  <div className="mt-1">{getStatusBadge(selectedPrescription.status)}</div>
                </div>
              </div>
            </div>

            {/* Quick State Transition Actions */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                Avanzar Fase de la Operación
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedPrescription.status === 'derivada' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedPrescription, 'aceptada', 'Prescripción aceptada formalmente por el comercial de destino.')}
                    className="text-xs text-purple-700 border-purple-200 hover:bg-purple-50"
                  >
                    Aceptar Derivación
                  </Button>
                )}
                {(selectedPrescription.status === 'derivada' || selectedPrescription.status === 'aceptada') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedPrescription, 'en_gestion', 'Iniciada fase de negociación activa con el cliente prescrito.')}
                    className="text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
                  >
                    Pasar a Negociación Activa
                  </Button>
                )}
                {selectedPrescription.status !== 'cerrada_exito' && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedPrescription, 'cerrada_exito', '¡Operación formalizada en notaría! Comisión devengada para el originador.')}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    Cerrar con Éxito (Devengar Comisión)
                  </Button>
                )}
                {selectedPrescription.status !== 'descartada' && selectedPrescription.status !== 'cerrada_exito' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUpdateStatus(selectedPrescription, 'descartada', 'Operación descartada por desinterés del cliente o falta de viabilidad.')}
                    className="text-xs text-rose-600 hover:bg-rose-50"
                  >
                    Descartar Oportunidad
                  </Button>
                )}
              </div>
            </div>

            {/* Timeline Historial */}
            <div>
              <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-neutral-500" />
                Historial de Trazabilidad & Hitos ({selectedPrescription.timeline?.length || 0})
              </h4>
              <div className="space-y-3 pl-2 border-l-2 border-neutral-200 dark:border-neutral-800 ml-2">
                {(selectedPrescription.timeline || []).map((t, idx) => (
                  <div key={t.id || idx} className="relative pl-4">
                    <div className="absolute -left-[1.3rem] top-1 h-2.5 w-2.5 rounded-full bg-neutral-900 dark:bg-white ring-4 ring-white dark:ring-neutral-900" />
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">{t.action}</span>
                      <span className="text-neutral-400 font-mono">{formatDateTime(t.date)}</span>
                    </div>
                    <p className="text-neutral-500 text-[11px] mt-0.5">Por {t.author}</p>
                    {t.comment && (
                      <p className="mt-1 text-xs text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/60 p-2 rounded border border-neutral-100 dark:border-neutral-800">
                        {t.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add note to timeline */}
            <form onSubmit={handleAddTimelineNote} className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <label className="block font-medium text-[11px] text-neutral-700 dark:text-neutral-300">
                Añadir avance / Nota a la trazabilidad
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Escribe un comentario o hito de negociación..."
                  value={newTimelineComment}
                  onChange={(e) => setNewTimelineComment(e.target.value)}
                  className="text-xs flex-1"
                />
                <Button type="submit" size="sm" disabled={!newTimelineComment.trim()}>
                  <Send className="h-3 w-3 mr-1" />
                  Registrar
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* Modal: Nueva Prescripción Inter-Áreas */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nueva Prescripción Comercial Inter-Área"
        description="Deriva un cliente a otra división comercial y asegura la trazabilidad y comisión del originador."
        maxWidth="md"
      >
        <form onSubmit={handleCreatePrescription} className="space-y-4 text-xs">
          {/* Cliente & Activo */}
          <div className="space-y-3">
            <div>
              <label className="block font-medium mb-1">Cliente a Derivar *</label>
              <Select
                value={formClientId}
                onChange={(e) => setFormClientId(e.target.value)}
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.reference} — {c.trade_name || c.legal_name} ({c.type})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block font-medium mb-1">Activo u Oportunidad Vinculada *</label>
              <Select
                value={formAssetId}
                onChange={(e) => setFormAssetId(e.target.value)}
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.reference} — {a.title} ({formatCurrency(a.current_value)})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Origination Area & Commercial */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/40">
            <div>
              <label className="block font-medium mb-1 text-[11px] text-neutral-600 dark:text-neutral-400">
                Área de Origen (Emisora)
              </label>
              <Select
                value={formOriginArea}
                onChange={(e) => setFormOriginArea(e.target.value as BusinessArea)}
              >
                {(Object.keys(BUSINESS_AREA_LABELS) as BusinessArea[]).map((area) => (
                  <option key={area} value={area}>
                    {BUSINESS_AREA_LABELS[area].label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block font-medium mb-1 text-[11px] text-neutral-600 dark:text-neutral-400">
                Comercial Originador
              </label>
              <Select
                value={formOriginUserId}
                onChange={(e) => setFormOriginUserId(e.target.value)}
              >
                {commercials.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.first_name} {u.last_name} ({u.role})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Destination Area & Commercial */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/40">
            <div>
              <label className="block font-medium mb-1 text-[11px] text-neutral-600 dark:text-neutral-400">
                Área de Destino (Receptora)
              </label>
              <Select
                value={formDestArea}
                onChange={(e) => setFormDestArea(e.target.value as BusinessArea)}
              >
                {(Object.keys(BUSINESS_AREA_LABELS) as BusinessArea[]).map((area) => (
                  <option key={area} value={area}>
                    {BUSINESS_AREA_LABELS[area].label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block font-medium mb-1 text-[11px] text-neutral-600 dark:text-neutral-400">
                Comercial Receptor
              </label>
              <Select
                value={formDestUserId}
                onChange={(e) => setFormDestUserId(e.target.value)}
              >
                {commercials.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.first_name} {u.last_name} ({u.role})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Financials: Volume & Commission */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Volumen Estimado (€) *</label>
              <Input
                type="number"
                required
                min="1000"
                value={formEstimatedValue}
                onChange={(e) => setFormEstimatedValue(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Comisión Originador (%) *</label>
              <Input
                type="number"
                required
                min="1"
                max="50"
                value={formCommissionRate}
                onChange={(e) => setFormCommissionRate(e.target.value)}
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Est. ~{formatCurrency((parseFloat(formEstimatedValue) || 0) * 0.03 * ((parseFloat(formCommissionRate) || 15) / 100))} para originador
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium mb-1">Contexto / Justificación de la Derivación</label>
            <textarea
              rows={2}
              className="w-full rounded-md border border-neutral-300 bg-white p-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900"
              placeholder="Motivo por el que el cliente busca producto en esta división, capacidad inversora o requerimientos especiales..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Registrar prescripción</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
