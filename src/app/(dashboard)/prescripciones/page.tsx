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
import { formatDate } from '@/lib/utils';
import { Plus, Clock, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { Prescription } from '@/types';

export default function PrescripcionesPage() {
  const store = useStore();
  const { success } = useToast();

  const prescriptions = store.getPrescriptions();
  const assets = store.getAssets();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('todos');

  // Modal
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [formAssetId, setFormAssetId] = React.useState(assets[0]?.id || '');
  const [formType, setFormType] = React.useState<Prescription['type']>('prescripcion_deuda');
  const [formDueDate, setFormDueDate] = React.useState('2026-11-20');
  const [formResponsible, setFormResponsible] = React.useState('Lucía Serrano');
  const [formNotes, setFormNotes] = React.useState('');

  const filtered = prescriptions.filter((p) => {
    const matchesSearch =
      p.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.entity_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.responsible_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreatePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find((a) => a.id === formAssetId);

    const due = new Date(formDueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));

    const created = store.addPrescription({
      entity_type: 'asset',
      entity_id: asset?.id || 'gen',
      entity_title: asset?.title || 'Activo General',
      type: formType,
      due_date: formDueDate,
      status: diffDays < 0 ? 'vencido' : diffDays < 30 ? 'proximo' : 'vigente',
      responsible_name: formResponsible,
      notes: formNotes,
      auto_alert: true,
      days_remaining: diffDays,
    });

    setIsModalOpen(false);
    success('Prescripción registrada', `Vencimiento ${created.reference} añadido al control de plazos.`);
  };

  const handleResolve = (id: string) => {
    store.updatePrescription(id, { status: 'resuelto' });
    success('Plazo resuelto', 'Se ha marcado la prescripción como resuelta.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Control Procesal & Legal"
        title="Prescripciones"
        description="Vigilancia de plazos procesales, vencimientos contractuales y prescripciones de deuda."
        actions={
          <Button size="sm" onClick={() => setIsModalOpen(true)} className="text-xs">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nueva prescripción
          </Button>
        }
      />

      {/* Aggregate KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Plazos en Control</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {prescriptions.length}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Próximos Vencimientos</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {prescriptions.filter((p) => p.status === 'proximo').length}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Vencidos</p>
          <p className="mt-1 text-2xl font-bold text-rose-600">
            {prescriptions.filter((p) => p.status === 'vencido').length}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Resueltos</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {prescriptions.filter((p) => p.status === 'resuelto').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/80">
              <tr>
                <th className="py-3 px-4">Referencia</th>
                <th className="py-3 px-4">Entidad / Activo Afectado</th>
                <th className="py-3 px-4">Tipo de Plazo</th>
                <th className="py-3 px-4">Fecha Límite</th>
                <th className="py-3 px-4 text-center">Días Restantes</th>
                <th className="py-3 px-4">Responsable</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-neutral-900 dark:text-neutral-100">
                    {item.reference}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-neutral-100">
                    {item.entity_title}
                  </td>
                  <td className="py-3.5 px-4 capitalize text-neutral-600 dark:text-neutral-400">
                    {item.type.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-neutral-900 dark:text-neutral-100">
                    {formatDate(item.due_date)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`font-bold ${
                        item.days_remaining < 15
                          ? 'text-rose-600'
                          : item.days_remaining < 60
                          ? 'text-amber-600'
                          : 'text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {item.days_remaining} días
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-300">
                    {item.responsible_name}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        item.status === 'resuelto'
                          ? 'success'
                          : item.status === 'proximo'
                          ? 'warning'
                          : item.status === 'vencido'
                          ? 'destructive'
                          : 'outline'
                      }
                      className="text-[10px] capitalize"
                    >
                      {item.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {item.status !== 'resuelto' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolve(item.id)}
                        className="h-7 text-[11px] px-2"
                      >
                        Resolver
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Prescription Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nueva Prescripción / Vencimiento"
        description="Añade un hito crítico procesal para supervisión automática."
        maxWidth="md"
      >
        <form onSubmit={handleCreatePrescription} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1">Activo Vinculado</label>
            <Select
              value={formAssetId}
              onChange={(e) => setFormAssetId(e.target.value)}
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.reference} — {a.title}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Tipo de Plazo</label>
              <Select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
              >
                <option value="prescripcion_deuda">Prescripción de Deuda</option>
                <option value="vencimiento_contrato">Vencimiento Contractual</option>
                <option value="subasta">Subasta Judicial</option>
                <option value="notificacion_judicial">Notificación Judicial</option>
              </Select>
            </div>
            <div>
              <label className="block font-medium mb-1">Fecha Límite *</label>
              <Input
                type="date"
                required
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Responsable del Seguimiento</label>
            <Input
              type="text"
              value={formResponsible}
              onChange={(e) => setFormResponsible(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Notas y Actuaciones Necesarias</label>
            <textarea
              rows={2}
              className="w-full rounded-md border border-neutral-300 bg-white p-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar prescripción</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
