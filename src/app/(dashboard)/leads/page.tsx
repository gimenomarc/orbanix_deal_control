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
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  Plus,
  Search,
  Download,
  Mail,
  Phone,
  Building,
  UserCheck,
  Trash2,
  Eye,
  Calendar,
} from 'lucide-react';
import { Lead, LeadPriority, LeadStatus } from '@/types';

export default function LeadsPage() {
  const store = useStore();
  const { success, error } = useToast();

  const leads = store.getLeads();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('todos');
  const [priorityFilter, setPriorityFilter] = React.useState<string>('todos');

  // Drawer & Modal
  const [selectedLeadId, setSelectedLeadId] = React.useState<string | null>(null);
  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  const [isNewModalOpen, setIsNewModalOpen] = React.useState(false);
  const [formName, setFormName] = React.useState('');
  const [formCompany, setFormCompany] = React.useState('');
  const [formEmail, setFormEmail] = React.useState('');
  const [formPhone, setFormPhone] = React.useState('');
  const [formSource, setFormSource] = React.useState<'web' | 'idealista' | 'referido' | 'evento'>('web');
  const [formPriority, setFormPriority] = React.useState<LeadPriority>('media');
  const [formEstimatedValue, setFormEstimatedValue] = React.useState(2500000);
  const [formNextAction, setFormNextAction] = React.useState('');
  const [formNotes, setFormNotes] = React.useState('');

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.company && l.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || l.status === statusFilter;
    const matchesPriority = priorityFilter === 'todos' || l.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;

    const created = store.addLead({
      name: formName,
      company: formCompany,
      email: formEmail,
      phone: formPhone,
      source: formSource,
      status: 'nuevo',
      priority: formPriority,
      estimated_value: Number(formEstimatedValue),
      next_action: formNextAction,
      notes: formNotes,
    });

    setIsNewModalOpen(false);
    setFormName('');
    setFormEmail('');
    success('Lead registrado', `Lead ${created.reference} añadido al embudo de captación.`);
  };

  const handleConvertToClient = (lead: Lead) => {
    const newClient = store.addClient({
      type: 'empresa',
      legal_name: lead.company || lead.name,
      trade_name: lead.company || lead.name,
      tax_id: 'B-PENDIENTE',
      email: lead.email,
      phone: lead.phone,
      city: 'Madrid',
      country: 'España',
      sector: 'Inversión Inmobiliaria',
      status: 'activo',
      notes: `Convertido desde Lead ${lead.reference}. ${lead.notes || ''}`,
    });

    store.updateLead(lead.id, {
      status: 'convertido',
      client_id: newClient.id,
    });

    success(
      'Lead Convertido',
      `Se ha creado el cliente ${newClient.reference} (${newClient.legal_name}) con éxito.`
    );
  };

  const handleDeleteLead = (id: string, ref: string) => {
    if (confirm(`¿Eliminar lead ${ref}?`)) {
      store.deleteLead(id);
      if (selectedLeadId === id) setSelectedLeadId(null);
      success('Lead eliminado', `Lead ${ref} eliminado.`);
    }
  };

  const handleExportCSV = () => {
    if (filteredLeads.length === 0) {
      error('Sin datos', 'No hay leads para exportar.');
      return;
    }
    const headers = ['Referencia', 'Nombre', 'Empresa', 'Email', 'Teléfono', 'Origen', 'Estado', 'Prioridad', 'Valor Estimado (€)'];
    const rows = filteredLeads.map((l) => [
      l.reference,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${(l.company || '').replace(/"/g, '""')}"`,
      l.email,
      l.phone || '',
      l.source,
      l.status,
      l.priority,
      l.estimated_value || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orbanix_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Exportación completada', 'CSV de leads descargado.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Captación & Oportunidades"
        title="Leads"
        description="Gestión y cualificación de solicitudes entrantes, inversores potenciales y mandatos de búsqueda."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Exportar
            </Button>
            <Button size="sm" onClick={() => setIsNewModalOpen(true)} className="text-xs">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Nuevo lead
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
          <Input
            type="text"
            placeholder="Buscar por contacto, empresa, email o referencia..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs h-9 w-36"
          >
            <option value="todos">Todos los estados</option>
            <option value="nuevo">Nuevo</option>
            <option value="contactado">Contactado</option>
            <option value="cualificado">Cualificado</option>
            <option value="propuesta">Propuesta</option>
            <option value="convertido">Convertido</option>
            <option value="perdido">Perdido</option>
          </Select>

          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs h-9 w-36"
          >
            <option value="todos">Prioridad</option>
            <option value="urgente">Urgente</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
        {filteredLeads.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No hay leads registrados"
              description="No hay oportunidades en el embudo con los filtros seleccionados."
              actionLabel="Registrar lead"
              onAction={() => setIsNewModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/80">
                <tr>
                  <th className="py-3 px-4">Referencia</th>
                  <th className="py-3 px-4">Contacto / Empresa</th>
                  <th className="py-3 px-4">Email / Teléfono</th>
                  <th className="py-3 px-4">Origen</th>
                  <th className="py-3 px-4">Prioridad</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Valor Estimado</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-neutral-900 dark:text-neutral-100">
                      {lead.reference}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => setSelectedLeadId(lead.id)}
                        className="font-semibold text-neutral-900 dark:text-neutral-100 hover:underline text-left block"
                      >
                        {lead.name}
                      </button>
                      {lead.company && (
                        <span className="text-[11px] text-neutral-500 block">
                          {lead.company}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-400">
                      <div>{lead.email}</div>
                      {lead.phone && <div className="text-[11px] text-neutral-400">{lead.phone}</div>}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-400 capitalize">
                      {lead.source}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          lead.priority === 'urgente' || lead.priority === 'alta'
                            ? 'destructive'
                            : lead.priority === 'media'
                            ? 'warning'
                            : 'neutral'
                        }
                        className="text-[10px] capitalize"
                      >
                        {lead.priority}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={lead.status === 'convertido' ? 'success' : 'outline'}
                        className="text-[10px] capitalize"
                      >
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-neutral-900 dark:text-neutral-100">
                      {lead.estimated_value ? formatCurrency(lead.estimated_value) : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {lead.status !== 'convertido' && (
                          <button
                            onClick={() => handleConvertToClient(lead)}
                            className="p-1 rounded text-neutral-500 hover:text-emerald-600"
                            title="Convertir a cliente"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedLeadId(lead.id)}
                          className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id, lead.reference)}
                          className="p-1 rounded text-neutral-400 hover:text-red-600"
                          title="Eliminar lead"
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

      {/* Lead Detail Drawer */}
      {selectedLead && (
        <Drawer
          isOpen={!!selectedLead}
          onClose={() => setSelectedLeadId(null)}
          title={selectedLead.name}
          description={`Expediente ${selectedLead.reference} • Origen ${selectedLead.source}`}
          width="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase">Estado actual</span>
                <p className="font-bold text-neutral-900 dark:text-neutral-100 capitalize">
                  {selectedLead.status}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase">Prioridad</span>
                <Badge variant="warning" className="capitalize text-[10px] block mt-0.5">
                  {selectedLead.priority}
                </Badge>
              </div>
            </div>

            <div>
              <span className="text-neutral-400 block text-[11px]">Empresa:</span>
              <p className="font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                {selectedLead.company || 'Particular / Sin sociedad'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div>
                <span className="text-neutral-400 block text-[11px]">Email:</span>
                <p className="font-medium text-neutral-800 dark:text-neutral-200 mt-0.5">
                  {selectedLead.email}
                </p>
              </div>
              <div>
                <span className="text-neutral-400 block text-[11px]">Teléfono:</span>
                <p className="font-medium text-neutral-800 dark:text-neutral-200 mt-0.5">
                  {selectedLead.phone || '-'}
                </p>
              </div>
            </div>

            {selectedLead.next_action && (
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-400 block text-[11px]">Próxima acción:</span>
                <p className="font-medium text-neutral-800 dark:text-neutral-200 mt-0.5">
                  {selectedLead.next_action}
                </p>
              </div>
            )}

            {selectedLead.notes && (
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-400 block text-[11px]">Notas y requerimientos:</span>
                <p className="mt-1 text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 p-2.5 rounded-lg leading-relaxed">
                  {selectedLead.notes}
                </p>
              </div>
            )}

            {selectedLead.status !== 'convertido' && (
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <Button
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    handleConvertToClient(selectedLead);
                    setSelectedLeadId(null);
                  }}
                >
                  <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                  Convertir en Cliente
                </Button>
              </div>
            )}
          </div>
        </Drawer>
      )}

      {/* New Lead Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Nuevo Lead"
        description="Introduce los datos del contacto interesado."
        maxWidth="md"
      >
        <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1">Nombre Completo *</label>
            <Input
              type="text"
              required
              placeholder="Ej: Marcos Valdés"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Empresa / Fondo</label>
            <Input
              type="text"
              placeholder="Ej: Hispania Capital"
              value={formCompany}
              onChange={(e) => setFormCompany(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Email *</label>
              <Input
                type="email"
                required
                placeholder="mvaldes@empresa.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Teléfono</label>
              <Input
                type="text"
                placeholder="+34 600 000 000"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium mb-1">Origen</label>
              <Select
                value={formSource}
                onChange={(e) => setFormSource(e.target.value as any)}
              >
                <option value="web">Web</option>
                <option value="idealista">Idealista</option>
                <option value="referido">Referido</option>
                <option value="evento">Evento</option>
              </Select>
            </div>
            <div>
              <label className="block font-medium mb-1">Prioridad</label>
              <Select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as any)}
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </Select>
            </div>
            <div>
              <label className="block font-medium mb-1">Valor Est. (€)</label>
              <Input
                type="number"
                value={formEstimatedValue}
                onChange={(e) => setFormEstimatedValue(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Próxima Acción Inmediata</label>
            <Input
              type="text"
              placeholder="Ej: Llamada de presentación el lunes a las 11h"
              value={formNextAction}
              onChange={(e) => setFormNextAction(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Notas</label>
            <textarea
              rows={2}
              className="w-full rounded-md border border-neutral-300 bg-white p-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <Button type="button" variant="outline" onClick={() => setIsNewModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar lead</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
