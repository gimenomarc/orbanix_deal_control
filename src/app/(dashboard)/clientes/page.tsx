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
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Plus,
  Search,
  Download,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Trash2,
  Eye,
  FileText,
  Upload,
} from 'lucide-react';
import { Client, ClientType, ClientStatus } from '@/types';

export default function ClientesPage() {
  const store = useStore();
  const { success, error } = useToast();

  const clients = store.getClients();
  const operations = store.getOperations();
  const leads = store.getLeads();
  const activities = store.getActivities();
  const documents = store.getDocuments();

  // Search & Filters
  const [searchQuery, setSearchQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<string>('todos');
  const [statusFilter, setStatusFilter] = React.useState<string>('todos');

  // Detail Drawer
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(null);
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  // New Client Modal
  const [isNewClientModalOpen, setIsNewClientModalOpen] = React.useState(false);
  const [formLegalName, setFormLegalName] = React.useState('');
  const [formTradeName, setFormTradeName] = React.useState('');
  const [formTaxId, setFormTaxId] = React.useState('');
  const [formEmail, setFormEmail] = React.useState('');
  const [formPhone, setFormPhone] = React.useState('');
  const [formType, setFormType] = React.useState<ClientType>('fondo');
  const [formCity, setFormCity] = React.useState('Madrid');
  const [formSector, setFormSector] = React.useState('Inmobiliario / Socimi');
  const [formNotes, setFormNotes] = React.useState('');

  // Note text inside drawer
  const [noteText, setNoteText] = React.useState('');

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.legal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tax_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.trade_name && c.trade_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === 'todos' || c.type === typeFilter;
    const matchesStatus = statusFilter === 'todos' || c.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLegalName || !formTaxId || !formEmail) return;

    const newClient = store.addClient({
      type: formType,
      legal_name: formLegalName,
      trade_name: formTradeName || formLegalName,
      tax_id: formTaxId,
      email: formEmail,
      phone: formPhone,
      city: formCity,
      country: 'España',
      sector: formSector,
      status: 'activo',
      notes: formNotes,
    });

    setIsNewClientModalOpen(false);
    setFormLegalName('');
    setFormTaxId('');
    setFormEmail('');
    setFormPhone('');
    success('Cliente registrado', `El cliente ${newClient.reference} ha sido creado con éxito.`);
  };

  const handleDeleteClient = (id: string, ref: string) => {
    if (confirm(`¿Seguro que deseas eliminar el cliente ${ref}?`)) {
      store.deleteClient(id);
      if (selectedClientId === id) setSelectedClientId(null);
      success('Cliente eliminado', `Cliente ${ref} eliminado correctamente.`);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !selectedClient) return;

    store.logActivity({
      entity_type: 'client',
      entity_id: selectedClient.id,
      entity_reference: selectedClient.reference,
      activity_type: 'nota',
      title: 'Nota agregada al cliente',
      description: noteText.trim(),
    });

    setNoteText('');
    success('Nota guardada', 'La nota se ha añadido al historial del cliente.');
  };

  const handleExportCSV = () => {
    if (filteredClients.length === 0) {
      error('Sin datos', 'No hay clientes para exportar.');
      return;
    }
    const headers = ['Referencia', 'Razón Social', 'Nombre Comercial', 'NIF/CIF', 'Tipo', 'Sector', 'Email', 'Teléfono', 'Ciudad', 'Estado'];
    const rows = filteredClients.map((c) => [
      c.reference,
      `"${c.legal_name.replace(/"/g, '""')}"`,
      `"${(c.trade_name || '').replace(/"/g, '""')}"`,
      c.tax_id,
      c.type,
      `"${(c.sector || '').replace(/"/g, '""')}"`,
      c.email,
      c.phone || '',
      c.city || '',
      c.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orbanix_clientes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Exportación completada', 'Archivo de clientes exportado.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        category="Gestión Comercial"
        title="Clientes"
        description="Directorio de clientes institucionales, fondos de inversión, family offices y contrapartes."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Exportar CSV
            </Button>
            <Button size="sm" onClick={() => setIsNewClientModalOpen(true)} className="text-xs">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Nuevo cliente
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
            placeholder="Buscar por razón social, NIF, ciudad o referencia..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs h-9 w-40"
          >
            <option value="todos">Todos los tipos</option>
            <option value="fondo">Fondo</option>
            <option value="family_office">Family Office</option>
            <option value="institucional">Institucional</option>
            <option value="empresa">Empresa</option>
            <option value="persona">Persona</option>
          </Select>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs h-9 w-36"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="prospecto">Prospecto</option>
            <option value="inactivo">Inactivo</option>
            <option value="bloqueado">Bloqueado</option>
          </Select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
        {filteredClients.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No hay clientes encontrados"
              description="No hay clientes que coincidan con los criterios de búsqueda."
              actionLabel="Registrar nuevo cliente"
              onAction={() => setIsNewClientModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/80">
                <tr>
                  <th className="py-3 px-4">Referencia</th>
                  <th className="py-3 px-4">Cliente / Razón Social</th>
                  <th className="py-3 px-4">NIF / CIF</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Sector</th>
                  <th className="py-3 px-4">Ciudad</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-neutral-900 dark:text-neutral-100">
                      {client.reference}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => setSelectedClientId(client.id)}
                        className="font-semibold text-neutral-900 dark:text-neutral-100 hover:underline text-left block"
                      >
                        {client.legal_name}
                      </button>
                      {client.trade_name && client.trade_name !== client.legal_name && (
                        <span className="text-[11px] text-neutral-500 block">
                          {client.trade_name}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-600 dark:text-neutral-400">
                      {client.tax_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {client.type.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-300">
                      {client.sector || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-400">
                      {client.city || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={client.status === 'activo' ? 'success' : 'warning'}
                        className="text-[10px] capitalize"
                      >
                        {client.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedClientId(client.id)}
                          className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                          title="Ver detalle del cliente"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id, client.reference)}
                          className="p-1 rounded text-neutral-400 hover:text-red-600"
                          title="Eliminar cliente"
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

      {/* Client Detail Drawer */}
      {selectedClient && (
        <Drawer
          isOpen={!!selectedClient}
          onClose={() => setSelectedClientId(null)}
          title={selectedClient.legal_name}
          description={`Expediente ${selectedClient.reference} • NIF ${selectedClient.tax_id}`}
          width="xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-800 text-center">
              <div>
                <p className="text-[10px] text-neutral-400 uppercase">Tipo</p>
                <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 capitalize">
                  {selectedClient.type.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-neutral-400 uppercase">Estado</p>
                <Badge variant="success" className="mt-1 text-[10px] capitalize">
                  {selectedClient.status}
                </Badge>
              </div>
              <div>
                <p className="text-[10px] text-neutral-400 uppercase">Operaciones</p>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {operations.filter((o) => o.client_id === selectedClient.id).length}
                </p>
              </div>
            </div>

            <Tabs defaultValue="resumen" onValueChange={() => {}} value="resumen">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="resumen">Resumen</TabsTrigger>
                <TabsTrigger value="operaciones">Operaciones</TabsTrigger>
                <TabsTrigger value="documentos">Documentos</TabsTrigger>
                <TabsTrigger value="actividad">Actividad</TabsTrigger>
              </TabsList>

              <TabsContent value="resumen" className="pt-3 text-xs space-y-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-neutral-400 block text-[11px]">Contacto principal:</span>
                    <p className="font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 mt-0.5">
                      <Mail className="h-3.5 w-3.5 text-neutral-400" />
                      {selectedClient.email}
                    </p>
                    {selectedClient.phone && (
                      <p className="font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 mt-1">
                        <Phone className="h-3.5 w-3.5 text-neutral-400" />
                        {selectedClient.phone}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <span className="text-neutral-400 block text-[11px]">Ubicación:</span>
                    <p className="font-medium text-neutral-800 dark:text-neutral-200 mt-0.5">
                      {selectedClient.address || 'Sin dirección registrada'}, {selectedClient.city} ({selectedClient.postal_code || 'España'})
                    </p>
                  </div>

                  {selectedClient.website && (
                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      <span className="text-neutral-400 block text-[11px]">Sitio Web:</span>
                      <a
                        href={selectedClient.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-neutral-800 hover:underline dark:text-neutral-200 flex items-center gap-1 mt-0.5"
                      >
                        <Globe className="h-3.5 w-3.5 text-neutral-400" />
                        {selectedClient.website}
                      </a>
                    </div>
                  )}

                  {selectedClient.notes && (
                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      <span className="text-neutral-400 block text-[11px]">Notas y perfil de inversión:</span>
                      <p className="mt-1 text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 p-2.5 rounded-lg leading-relaxed">
                        {selectedClient.notes}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="operaciones" className="pt-3 text-xs space-y-3">
                {operations.filter((o) => o.client_id === selectedClient.id).length === 0 ? (
                  <p className="py-4 text-center text-neutral-400">
                    No existen operaciones vinculadas a este cliente.
                  </p>
                ) : (
                  operations
                    .filter((o) => o.client_id === selectedClient.id)
                    .map((op) => (
                      <div
                        key={op.id}
                        className="p-3 rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {op.title}
                          </span>
                          <span className="font-mono text-[10px] text-neutral-400">{op.reference}</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-1">
                          Importe: {formatCurrency(op.amount)} • Fase {op.phase}
                        </p>
                      </div>
                    ))
                )}
              </TabsContent>

              <TabsContent value="documentos" className="pt-3 text-xs space-y-3">
                {documents.filter((d) => d.entity_id === selectedClient.id).length === 0 ? (
                  <p className="py-4 text-center text-neutral-400">
                    No hay documentos asociados a este cliente.
                  </p>
                ) : (
                  documents
                    .filter((d) => d.entity_id === selectedClient.id)
                    .map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/40"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-neutral-500" />
                          <div>
                            <p className="font-medium text-neutral-800 dark:text-neutral-200">{doc.name}</p>
                            <span className="text-[10px] text-neutral-400">{formatDate(doc.created_at)}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => success('Descarga', `Descargando ${doc.name}`)}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))
                )}
              </TabsContent>

              <TabsContent value="actividad" className="pt-3 text-xs space-y-4">
                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    rows={2}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Registrar nota sobre este cliente..."
                    className="w-full rounded-md border border-neutral-200 bg-white p-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-800 dark:bg-neutral-900"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" size="sm" className="text-xs h-7">
                      Guardar nota
                    </Button>
                  </div>
                </form>

                <ActivityTimeline
                  activities={activities.filter((a) => a.entity_id === selectedClient.id)}
                />
              </TabsContent>
            </Tabs>
          </div>
        </Drawer>
      )}

      {/* New Client Modal */}
      <Modal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        title="Nuevo Cliente"
        description="Introduce los datos societarios o personales para dar de alta un cliente."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1">Razón Social *</label>
            <Input
              type="text"
              required
              placeholder="Ej: Inversiones Inmobiliarias Prime S.L."
              value={formLegalName}
              onChange={(e) => setFormLegalName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Nombre Comercial</label>
              <Input
                type="text"
                placeholder="Ej: Prime RE"
                value={formTradeName}
                onChange={(e) => setFormTradeName(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">NIF / CIF *</label>
              <Input
                type="text"
                required
                placeholder="B-12345678"
                value={formTaxId}
                onChange={(e) => setFormTaxId(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Tipo de Cliente</label>
              <Select
                value={formType}
                onChange={(e) => setFormType(e.target.value as ClientType)}
              >
                <option value="fondo">Fondo</option>
                <option value="family_office">Family Office</option>
                <option value="institucional">Institucional</option>
                <option value="empresa">Empresa</option>
                <option value="persona">Persona</option>
                <option value="otro">Otro</option>
              </Select>
            </div>
            <div>
              <label className="block font-medium mb-1">Sector</label>
              <Input
                type="text"
                value={formSector}
                onChange={(e) => setFormSector(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Email *</label>
              <Input
                type="email"
                required
                placeholder="contacto@inversiones.es"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Teléfono</label>
              <Input
                type="text"
                placeholder="+34 910 000 000"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Ciudad</label>
            <Input
              type="text"
              value={formCity}
              onChange={(e) => setFormCity(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Notas / Criterio de Inversión</label>
            <textarea
              rows={2}
              className="w-full rounded-md border border-neutral-300 bg-white p-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900"
              placeholder="Tickets habituales, tipología de activos buscada..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewClientModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Guardar cliente</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
