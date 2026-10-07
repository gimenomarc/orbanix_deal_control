'use client';

import * as React from 'react';
import { useStore } from '@/hooks/useStore';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { ActivityTimeline } from '@/components/ui/ActivityTimeline';
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils';
import {
  Plus,
  Search,
  Download,
  Briefcase,
  ArrowRight,
  TrendingUp,
  Clock,
  Eye,
  Trash2,
  Columns,
  List,
} from 'lucide-react';
import { Operation, OperationPhase } from '@/types';

const phasesOrder: OperationPhase[] = [
  'nueva',
  'analisis',
  'propuesta',
  'negociacion',
  'documentacion',
  'cierre',
  'completada',
];

export default function OperacionesPage() {
  const store = useStore();
  const { success, error } = useToast();

  const operations = store.getOperations();
  const assets = store.getAssets();
  const clients = store.getClients();
  const activities = store.getActivities();

  const [viewMode, setViewMode] = React.useState<'table' | 'pipeline'>('table');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [phaseFilter, setPhaseFilter] = React.useState<string>('todos');

  // Drawer & Modal
  const [selectedOperationId, setSelectedOperationId] = React.useState<string | null>(null);
  const selectedOperation = operations.find((o) => o.id === selectedOperationId);

  const [isNewModalOpen, setIsNewModalOpen] = React.useState(false);
  const [formTitle, setFormTitle] = React.useState('');
  const [formAssetId, setFormAssetId] = React.useState(assets[0]?.id || '');
  const [formClientId, setFormClientId] = React.useState(clients[0]?.id || '');
  const [formAmount, setFormAmount] = React.useState(5000000);
  const [formProbability, setFormProbability] = React.useState(75);
  const [formType, setFormType] = React.useState<'venta' | 'compra' | 'cesion_credito' | 'subasta'>('venta');
  const [formPhase, setFormPhase] = React.useState<OperationPhase>('propuesta');
  const [formCloseDate, setFormCloseDate] = React.useState('2026-11-30');
  const [formNotes, setFormNotes] = React.useState('');

  const [noteText, setNoteText] = React.useState('');

  const filteredOperations = operations.filter((op) => {
    const matchesSearch =
      op.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (op.client_name && op.client_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (op.asset_title && op.asset_title.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPhase = phaseFilter === 'todos' || op.phase === phaseFilter;

    return matchesSearch && matchesPhase;
  });

  // Aggregate stats
  const totalVolume = operations.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const weightedVolume = operations.reduce(
    (acc, curr) => acc + (curr.amount || 0) * (curr.probability / 100),
    0
  );
  const activeOps = operations.filter((o) => o.status === 'activa').length;

  const handleCreateOperation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return;

    const ast = assets.find((a) => a.id === formAssetId);
    const cli = clients.find((c) => c.id === formClientId);

    const created = store.addOperation({
      title: formTitle,
      asset_id: ast?.id,
      asset_reference: ast?.reference,
      asset_title: ast?.title,
      client_id: cli?.id,
      client_name: cli?.legal_name,
      amount: Number(formAmount),
      expected_value: Number(formAmount),
      probability: Number(formProbability),
      type: formType,
      phase: formPhase,
      status: 'activa',
      expected_close_date: formCloseDate,
      notes: formNotes,
    });

    setIsNewModalOpen(false);
    setFormTitle('');
    success('Operación creada', `Operación ${created.reference} registrada en el deal pipeline.`);
  };

  const handleAdvancePhase = (op: Operation) => {
    const currentIndex = phasesOrder.indexOf(op.phase);
    if (currentIndex < phasesOrder.length - 1) {
      const nextPhase = phasesOrder[currentIndex + 1];
      store.updateOperation(op.id, { phase: nextPhase });
      store.logActivity({
        entity_type: 'operation',
        entity_id: op.id,
        entity_reference: op.reference,
        activity_type: 'cambio_fase',
        title: `Fase avanzada a ${nextPhase}`,
        description: `La operación se encuentra ahora en fase de ${nextPhase}.`,
      });
      success('Fase actualizada', `Operación ${op.reference} movida a ${nextPhase}.`);
    }
  };

  const handleDeleteOperation = (id: string, ref: string) => {
    if (confirm(`¿Eliminar la operación ${ref}?`)) {
      store.deleteOperation(id);
      if (selectedOperationId === id) setSelectedOperationId(null);
      success('Operación eliminada', `Operación ${ref} eliminada.`);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !selectedOperation) return;

    store.logActivity({
      entity_type: 'operation',
      entity_id: selectedOperation.id,
      entity_reference: selectedOperation.reference,
      activity_type: 'nota',
      title: 'Nota agregada a la operación',
      description: noteText.trim(),
    });

    setNoteText('');
    success('Nota guardada', 'Nota añadida a la operación.');
  };

  const handleExportCSV = () => {
    if (filteredOperations.length === 0) {
      error('Sin datos', 'No hay operaciones para exportar.');
      return;
    }
    const headers = ['Referencia', 'Título', 'Activo', 'Cliente', 'Tipo', 'Fase', 'Importe (€)', 'Probabilidad (%)', 'Cierre Previsto'];
    const rows = filteredOperations.map((o) => [
      o.reference,
      `"${o.title.replace(/"/g, '""')}"`,
      `"${(o.asset_title || '').replace(/"/g, '""')}"`,
      `"${(o.client_name || '').replace(/"/g, '""')}"`,
      o.type,
      o.phase,
      o.amount,
      o.probability,
      o.expected_close_date || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orbanix_operaciones_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Exportación completada', 'CSV de operaciones descargado.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Deal Pipeline"
        title="Operaciones"
        description="Gestión integral de mandatos de compraventa, cesiones de crédito y cierres transaccionales."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-neutral-200 bg-white p-0.5 dark:border-neutral-800 dark:bg-neutral-900">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs cursor-pointer ${
                  viewMode === 'table' ? 'bg-neutral-100 text-neutral-900 font-medium dark:bg-neutral-800 dark:text-white' : 'text-neutral-500'
                }`}
                title="Vista tabla"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('pipeline')}
                className={`p-1.5 rounded-md text-xs cursor-pointer ${
                  viewMode === 'pipeline' ? 'bg-neutral-100 text-neutral-900 font-medium dark:bg-neutral-800 dark:text-white' : 'text-neutral-500'
                }`}
                title="Vista pipeline"
              >
                <Columns className="h-4 w-4" />
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Exportar
            </Button>
            <Button size="sm" onClick={() => setIsNewModalOpen(true)} className="text-xs">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Nueva operación
            </Button>
          </div>
        }
      />

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Volumen total en pipeline</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(totalVolume)}
            </span>
            <span className="text-xs text-neutral-500 font-normal">({activeOps} activas)</span>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Volumen ponderado por probabilidad</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(weightedVolume)}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Probabilidad media de éxito</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {operations.length > 0
              ? formatPercent(operations.reduce((a, c) => a + c.probability, 0) / operations.length, 0)
              : '0%'}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
          <Input
            type="text"
            placeholder="Buscar por operación, activo, cliente o referencia..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>

        <Select
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value)}
          className="text-xs h-9 w-44"
        >
          <option value="todos">Todas las fases</option>
          <option value="nueva">Nueva</option>
          <option value="analisis">Análisis</option>
          <option value="propuesta">Propuesta</option>
          <option value="negociacion">Negociación</option>
          <option value="documentacion">Documentación</option>
          <option value="cierre">Cierre</option>
          <option value="completada">Completada</option>
        </Select>
      </div>

      {/* Table / Pipeline View */}
      {viewMode === 'table' ? (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
          {filteredOperations.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No hay operaciones encontradas"
                description="No existen operaciones con los filtros indicados."
                actionLabel="Crear nueva operación"
                onAction={() => setIsNewModalOpen(true)}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/80">
                  <tr>
                    <th className="py-3 px-4">Referencia</th>
                    <th className="py-3 px-4">Operación / Título</th>
                    <th className="py-3 px-4">Activo</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4 text-right">Importe</th>
                    <th className="py-3 px-4 text-center">Probabilidad</th>
                    <th className="py-3 px-4">Fase</th>
                    <th className="py-3 px-4">Cierre Previsto</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredOperations.map((op) => (
                    <tr
                      key={op.id}
                      className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-neutral-900 dark:text-neutral-100">
                        {op.reference}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedOperationId(op.id)}
                          className="font-semibold text-neutral-900 dark:text-neutral-100 hover:underline text-left block truncate cursor-pointer"
                        >
                          {op.title}
                        </button>
                        <span className="text-[11px] text-neutral-400 capitalize">
                          Tipo: {op.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300 max-w-[150px] truncate">
                        {op.asset_title || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300 max-w-[150px] truncate">
                        {op.client_name || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(op.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium text-emerald-600">
                        {op.probability}%
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {op.phase}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-500">
                        {formatDate(op.expected_close_date)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleAdvancePhase(op)}
                            className="p-1 rounded text-neutral-500 hover:text-emerald-600"
                            title="Avanzar de fase"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setSelectedOperationId(op.id)}
                            className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                            title="Ver detalle"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOperation(op.id, op.reference)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600"
                            title="Eliminar operación"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Kanban Pipeline View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
          {phasesOrder.slice(0, 6).map((phase) => {
            const phaseOps = filteredOperations.filter((o) => o.phase === phase);
            const phaseTotal = phaseOps.reduce((a, c) => a + c.amount, 0);

            return (
              <div
                key={phase}
                className="flex flex-col rounded-xl border border-neutral-200 bg-neutral-50/60 p-3 dark:border-neutral-800 dark:bg-neutral-900/40 min-h-[380px]"
              >
                <div className="pb-2 border-b border-neutral-200 dark:border-neutral-800 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold capitalize text-neutral-900 dark:text-neutral-100">
                      {phase}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                      {phaseOps.length}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{formatCurrency(phaseTotal)}</p>
                </div>

                <div className="flex-1 space-y-2">
                  {phaseOps.map((op) => (
                    <div
                      key={op.id}
                      onClick={() => setSelectedOperationId(op.id)}
                      className="p-3 rounded-lg border border-neutral-200 bg-white shadow-2xs hover:border-neutral-400 cursor-pointer transition-all dark:border-neutral-800 dark:bg-neutral-900"
                    >
                      <span className="text-[10px] font-mono text-neutral-400 block mb-0.5">
                        {op.reference}
                      </span>
                      <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2">
                        {op.title}
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-1 truncate">
                        {op.client_name || 'Sin cliente asignado'}
                      </p>
                      <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {formatCurrency(op.amount)}
                        </span>
                        <span className="text-emerald-600 font-medium">
                          {op.probability}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Operation Detail Drawer */}
      {selectedOperation && (
        <Drawer
          isOpen={!!selectedOperation}
          onClose={() => setSelectedOperationId(null)}
          title={selectedOperation.title}
          description={`Expediente ${selectedOperation.reference} • Tipo ${selectedOperation.type}`}
          width="xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-800 text-center">
              <div>
                <p className="text-[10px] text-neutral-400 uppercase">Importe</p>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(selectedOperation.amount)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-neutral-400 uppercase">Probabilidad</p>
                <p className="text-sm font-bold text-emerald-600">
                  {selectedOperation.probability}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-neutral-400 uppercase">Fase</p>
                <Badge variant="outline" className="mt-1 text-[10px] capitalize">
                  {selectedOperation.phase}
                </Badge>
              </div>
            </div>

            <Tabs defaultValue="resumen" onValueChange={() => {}} value="resumen">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="resumen">Resumen</TabsTrigger>
                <TabsTrigger value="entidades">Activo y Cliente</TabsTrigger>
                <TabsTrigger value="actividad">Actividad</TabsTrigger>
              </TabsList>

              <TabsContent value="resumen" className="pt-3 text-xs space-y-3">
                <div className="space-y-3">
                  <div>
                    <span className="text-neutral-400 block text-[11px]">Fecha objetivo de cierre:</span>
                    <p className="font-medium text-neutral-800 dark:text-neutral-200 mt-0.5">
                      {formatDate(selectedOperation.expected_close_date)}
                    </p>
                  </div>

                  {selectedOperation.notes && (
                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      <span className="text-neutral-400 block text-[11px]">Notas de negociación:</span>
                      <p className="mt-1 text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 p-2.5 rounded-lg leading-relaxed">
                        {selectedOperation.notes}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <Button
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => handleAdvancePhase(selectedOperation)}
                    >
                      Avanzar a siguiente fase
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="entidades" className="pt-3 text-xs space-y-3">
                <div className="p-3 rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                  <span className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">Activo</span>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {selectedOperation.asset_title || 'No asignado'}
                  </p>
                  <span className="font-mono text-[10px] text-neutral-500">
                    {selectedOperation.asset_reference}
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                  <span className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">Comprador / Inversor</span>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {selectedOperation.client_name || 'No asignado'}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="actividad" className="pt-3 text-xs space-y-4">
                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    rows={2}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Registrar nota sobre esta operación..."
                    className="w-full rounded-md border border-neutral-200 bg-white p-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-800 dark:bg-neutral-900"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" size="sm" className="text-xs h-7">
                      Guardar nota
                    </Button>
                  </div>
                </form>

                <ActivityTimeline
                  activities={activities.filter((a) => a.entity_id === selectedOperation.id)}
                />
              </TabsContent>
            </Tabs>
          </div>
        </Drawer>
      )}

      {/* New Operation Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Nueva Operación"
        description="Añade una nueva oportunidad al pipeline transaccional."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateOperation} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1">Título de la Operación *</label>
            <Input
              type="text"
              required
              placeholder="Ej: Compraventa Edificio Chamberí por Azora"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Activo Vinculado</label>
              <Select
                value={formAssetId}
                onChange={(e) => {
                  setFormAssetId(e.target.value);
                  const a = assets.find((x) => x.id === e.target.value);
                  if (a) setFormAmount(a.current_value);
                }}
              >
                <option value="">(Opcional) Sin activo vinculado</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.reference} — {a.title}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block font-medium mb-1">Cliente / Inversor</label>
              <Select
                value={formClientId}
                onChange={(e) => setFormClientId(e.target.value)}
              >
                <option value="">(Opcional) Sin cliente vinculado</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.legal_name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium mb-1">Importe (€) *</label>
              <Input
                type="number"
                required
                value={formAmount}
                onChange={(e) => setFormAmount(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Probabilidad (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formProbability}
                onChange={(e) => setFormProbability(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Tipo Operación</label>
              <Select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
              >
                <option value="venta">Venta</option>
                <option value="compra">Compra</option>
                <option value="cesion_credito">Cesión de Crédito</option>
                <option value="subasta">Subasta</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Fase Inicial</label>
              <Select
                value={formPhase}
                onChange={(e) => setFormPhase(e.target.value as OperationPhase)}
              >
                <option value="nueva">Nueva</option>
                <option value="analisis">Análisis</option>
                <option value="propuesta">Propuesta</option>
                <option value="negociacion">Negociación</option>
                <option value="documentacion">Documentación</option>
              </Select>
            </div>
            <div>
              <label className="block font-medium mb-1">Fecha Cierre Prevista</label>
              <Input
                type="date"
                value={formCloseDate}
                onChange={(e) => setFormCloseDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Notas y Cláusulas Clave</label>
            <textarea
              rows={2}
              className="w-full rounded-md border border-neutral-300 bg-white p-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Due diligence, condiciones suspensivas..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Crear operación</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
