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
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Search,
  Download,
} from 'lucide-react';
import { PBCRecord, PBCStatus } from '@/types';

export default function PBCPage() {
  const store = useStore();
  const { success, error } = useToast();

  const pbcRecords = store.getPBCRecords();
  const clients = store.getClients();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('todos');
  const [riskFilter, setRiskFilter] = React.useState<string>('todos');

  // Modal state
  const [isNewModalOpen, setIsNewModalOpen] = React.useState(false);
  const [formClientId, setFormClientId] = React.useState(clients[0]?.id || '');
  const [formRiskLevel, setFormRiskLevel] = React.useState<'bajo' | 'medio' | 'alto'>('medio');
  const [formStatus, setFormStatus] = React.useState<PBCStatus>('pendiente');
  const [formKyc, setFormKyc] = React.useState(false);
  const [formFunds, setFormFunds] = React.useState(false);
  const [formPep, setFormPep] = React.useState(false);
  const [formSanctions, setFormSanctions] = React.useState(false);
  const [formNotes, setFormNotes] = React.useState('');

  const filteredRecords = pbcRecords.filter((r) => {
    const matchesSearch =
      r.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.client_name && r.client_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'todos' || r.status === statusFilter;
    const matchesRisk = riskFilter === 'todos' || r.risk_level === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  const handleCreatePBC = (e: React.FormEvent) => {
    e.preventDefault();
    const cli = clients.find((c) => c.id === formClientId);
    if (!cli) return;

    const created = store.addPBCRecord({
      client_id: cli.id,
      client_name: cli.legal_name,
      risk_level: formRiskLevel,
      status: formStatus,
      kyc_verified: formKyc,
      funds_source_verified: formFunds,
      pep_check: formPep,
      sanctions_check: formSanctions,
      notes: formNotes,
      incidents_count: 0,
      verification_date: formStatus === 'completo' ? new Date().toISOString().slice(0, 10) : undefined,
    });

    setIsNewModalOpen(false);
    success('Expediente PBC creado', `Expediente ${created.reference} para ${cli.legal_name} registrado.`);
  };

  const handleToggleCheck = (record: PBCRecord, field: 'kyc_verified' | 'funds_source_verified' | 'pep_check' | 'sanctions_check') => {
    const updatedVal = !record[field];
    const isNowAllDone =
      (field === 'kyc_verified' ? updatedVal : record.kyc_verified) &&
      (field === 'funds_source_verified' ? updatedVal : record.funds_source_verified) &&
      (field === 'pep_check' ? updatedVal : record.pep_check) &&
      (field === 'sanctions_check' ? updatedVal : record.sanctions_check);

    store.updatePBCRecord(record.id, {
      [field]: updatedVal,
      status: isNowAllDone ? 'completo' : 'en_revision',
      verification_date: isNowAllDone ? new Date().toISOString().slice(0, 10) : record.verification_date,
    });

    success('Verificación actualizada', `Cambio registrado en el expediente ${record.reference}.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Compliance & Regulación"
        title="PBC (Prevención de Blanqueo de Capitales)"
        description="Control de diligencia debida (KYC), titulares reales, origen de fondos y listas de sanciones internacionales."
        actions={
          <Button size="sm" onClick={() => setIsNewModalOpen(true)} className="text-xs">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nuevo expediente PBC
          </Button>
        }
      />

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Expedientes Totales</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {pbcRecords.length}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Verificados Completos</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {pbcRecords.filter((r) => r.status === 'completo').length}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">En Revisión / Pendiente</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {pbcRecords.filter((r) => r.status === 'en_revision' || r.status === 'pendiente').length}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Riesgo Alto</p>
          <p className="mt-1 text-2xl font-bold text-rose-600">
            {pbcRecords.filter((r) => r.risk_level === 'alto').length}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
          <Input
            type="text"
            placeholder="Buscar por cliente o expediente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs h-9 w-40"
          >
            <option value="todos">Todos los estados</option>
            <option value="completo">Completo</option>
            <option value="en_revision">En revisión</option>
            <option value="pendiente">Pendiente</option>
            <option value="incompleto">Incompleto</option>
            <option value="rechazado">Rechazado</option>
          </Select>

          <Select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs h-9 w-36"
          >
            <option value="todos">Nivel de riesgo</option>
            <option value="bajo">Bajo</option>
            <option value="medio">Medio</option>
            <option value="alto">Alto</option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
        {filteredRecords.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No hay expedientes PBC"
              description="No hay clientes en seguimiento de compliance con los filtros actuales."
              actionLabel="Crear expediente PBC"
              onAction={() => setIsNewModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/80">
                <tr>
                  <th className="py-3 px-4">Expediente</th>
                  <th className="py-3 px-4">Cliente Institucional</th>
                  <th className="py-3 px-4">Nivel Riesgo</th>
                  <th className="py-3 px-4">Estado PBC</th>
                  <th className="py-3 px-4 text-center">KYC Identidad</th>
                  <th className="py-3 px-4 text-center">Origen Fondos</th>
                  <th className="py-3 px-4 text-center">PEP Check</th>
                  <th className="py-3 px-4 text-center">Sanciones</th>
                  <th className="py-3 px-4">Fecha Validación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-neutral-900 dark:text-neutral-100">
                      {rec.reference}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-neutral-100">
                      {rec.client_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          rec.risk_level === 'alto'
                            ? 'destructive'
                            : rec.risk_level === 'medio'
                            ? 'warning'
                            : 'success'
                        }
                        className="text-[10px] capitalize"
                      >
                        {rec.risk_level}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          rec.status === 'completo'
                            ? 'success'
                            : rec.status === 'en_revision'
                            ? 'warning'
                            : 'outline'
                        }
                        className="text-[10px] capitalize"
                      >
                        {rec.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleCheck(rec, 'kyc_verified')}
                        className="cursor-pointer"
                        title="Alternar verificación KYC"
                      >
                        {rec.kyc_verified ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 inline" />
                        ) : (
                          <XCircle className="h-4 w-4 text-neutral-300 inline" />
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleCheck(rec, 'funds_source_verified')}
                        className="cursor-pointer"
                        title="Alternar origen de fondos"
                      >
                        {rec.funds_source_verified ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 inline" />
                        ) : (
                          <XCircle className="h-4 w-4 text-neutral-300 inline" />
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleCheck(rec, 'pep_check')}
                        className="cursor-pointer"
                        title="Alternar Personas con Responsabilidad Pública"
                      >
                        {rec.pep_check ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 inline" />
                        ) : (
                          <XCircle className="h-4 w-4 text-neutral-300 inline" />
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleCheck(rec, 'sanctions_check')}
                        className="cursor-pointer"
                        title="Alternar listas de sanciones"
                      >
                        {rec.sanctions_check ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 inline" />
                        ) : (
                          <XCircle className="h-4 w-4 text-neutral-300 inline" />
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500">
                      {formatDate(rec.verification_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New PBC Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Nuevo Expediente PBC"
        description="Abre el protocolo de prevención de blanqueo para un cliente."
        maxWidth="md"
      >
        <form onSubmit={handleCreatePBC} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1">Cliente *</label>
            <Select
              value={formClientId}
              onChange={(e) => setFormClientId(e.target.value)}
              required
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.legal_name} ({c.tax_id})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Nivel de Riesgo</label>
              <Select
                value={formRiskLevel}
                onChange={(e) => setFormRiskLevel(e.target.value as any)}
              >
                <option value="bajo">Bajo</option>
                <option value="medio">Medio</option>
                <option value="alto">Alto</option>
              </Select>
            </div>
            <div>
              <label className="block font-medium mb-1">Estado Inicial</label>
              <Select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_revision">En revisión</option>
                <option value="completo">Completo</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200 block mb-1">
              Verificaciones Completadas
            </span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formKyc}
                onChange={(e) => setFormKyc(e.target.checked)}
                className="rounded"
              />
              <span>DNI / CIF y Escritura de poderes verificada</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formFunds}
                onChange={(e) => setFormFunds(e.target.checked)}
                className="rounded"
              />
              <span>Certificado bancario de origen lícito de fondos</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formPep}
                onChange={(e) => setFormPep(e.target.checked)}
                className="rounded"
              />
              <span>Comprobación PEP (sin cargos públicos expuestos)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formSanctions}
                onChange={(e) => setFormSanctions(e.target.checked)}
                className="rounded"
              />
              <span>Cotejo en listas de sanciones UE y OFAC</span>
            </label>
          </div>

          <div>
            <label className="block font-medium mb-1">Observaciones</label>
            <textarea
              rows={2}
              className="w-full rounded-md border border-neutral-300 bg-white p-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Guardar expediente</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
