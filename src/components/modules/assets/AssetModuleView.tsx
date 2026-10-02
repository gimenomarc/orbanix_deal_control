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
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import {
  Plus,
  Search,
  Download,
  Building2,
  MapPin,
  ExternalLink,
  Trash2,
  FileText,
  Upload,
  Eye,
} from 'lucide-react';
import { Asset, AssetBranch, AssetPhase, AssetStatus } from '@/types';

interface AssetModuleViewProps {
  branch: AssetBranch;
  title: string;
  category: string;
  description: string;
}

export function AssetModuleView({ branch, title, category, description }: AssetModuleViewProps) {
  const store = useStore();
  const { success, error } = useToast();

  const allAssets = store.getAssets();
  const assets = allAssets.filter((a) => a.branch === branch);
  const owners = store.getOwners();
  const portfolios = store.getPortfolios();
  const operations = store.getOperations();
  const activities = store.getActivities();
  const documents = store.getDocuments();

  // Filters
  const [searchQuery, setSearchQuery] = React.useState('');
  const [phaseFilter, setPhaseFilter] = React.useState<string>('todos');
  const [statusFilter, setStatusFilter] = React.useState<string>('todos');

  // Detail Drawer state
  const [selectedAssetId, setSelectedAssetId] = React.useState<string | null>(null);
  const selectedAsset = assets.find((a) => a.id === selectedAssetId);

  // New Asset Modal state
  const [isNewAssetModalOpen, setIsNewAssetModalOpen] = React.useState(false);
  const [formTitle, setFormTitle] = React.useState('');
  const [formCity, setFormCity] = React.useState('Madrid');
  const [formAddress, setFormAddress] = React.useState('');
  const [formValue, setFormValue] = React.useState(1500000);
  const [formAskingPrice, setFormAskingPrice] = React.useState(1650000);
  const [formSurface, setFormSurface] = React.useState(450);
  const [formPhase, setFormPhase] = React.useState<AssetPhase>('comercializacion');
  const [formStatus, setFormStatus] = React.useState<AssetStatus>('disponible');
  const [formOwnerId, setFormOwnerId] = React.useState(owners[0]?.id || '');
  const [formNotes, setFormNotes] = React.useState('');

  // Add Document modal state
  const [isAddDocOpen, setIsAddDocOpen] = React.useState(false);
  const [docName, setDocName] = React.useState('');
  const [docCategory, setDocCategory] = React.useState<'nota_simple' | 'tasacion' | 'contrato' | 'otro'>('nota_simple');

  // Add Note state
  const [noteText, setNoteText] = React.useState('');

  // Filtered Assets
  const filteredAssets = assets.filter((asset) => {
    const matchesQuery =
      asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.address && asset.address.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPhase = phaseFilter === 'todos' || asset.phase === phaseFilter;
    const matchesStatus = statusFilter === 'todos' || asset.status === statusFilter;

    return matchesQuery && matchesPhase && matchesStatus;
  });

  // Calculate Metrics
  const totalVolume = assets.reduce((acc, curr) => acc + (curr.current_value || 0), 0);
  const activeCount = assets.filter((a) => a.status === 'disponible' || a.status === 'en_proceso').length;
  const avgValue = assets.length > 0 ? totalVolume / assets.length : 0;

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return;

    const owner = owners.find((o) => o.id === formOwnerId);

    const created = store.addAsset({
      title: formTitle,
      asset_type: branch === 'npl' ? 'NPL' : branch === 'institutional' ? 'institucional' : 'inmobiliario',
      branch: branch,
      phase: formPhase,
      status: formStatus,
      owner_id: owner?.id,
      owner_name: owner?.name,
      nominal_value: Number(formValue),
      current_value: Number(formValue),
      asking_price: Number(formAskingPrice),
      currency: 'EUR',
      country: 'España',
      city: formCity,
      address: formAddress,
      surface: Number(formSurface),
      notes: formNotes,
    });

    setIsNewAssetModalOpen(false);
    setFormTitle('');
    setFormAddress('');
    success('Activo creado', `El activo ${created.reference} se ha registrado con éxito.`);
  };

  const handleDeleteAsset = (id: string, ref: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el activo ${ref}?`)) {
      store.deleteAsset(id);
      if (selectedAssetId === id) setSelectedAssetId(null);
      success('Activo eliminado', `El activo ${ref} ha sido eliminado.`);
    }
  };

  const handleExportCSV = () => {
    if (filteredAssets.length === 0) {
      error('No hay datos', 'No existen activos para exportar con los filtros actuales.');
      return;
    }
    const headers = ['Referencia', 'Título', 'Rama', 'Fase', 'Estado', 'Ciudad', 'Valor Actual (€)', 'Asking Price (€)', 'Superficie (m2)'];
    const rows = filteredAssets.map((a) => [
      a.reference,
      `"${a.title.replace(/"/g, '""')}"`,
      a.branch,
      a.phase,
      a.status,
      a.city,
      a.current_value,
      a.asking_price || '',
      a.surface || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orbanix_activos_${branch}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Exportación completada', 'Se ha descargado el archivo CSV con éxito.');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !selectedAsset) return;

    store.logActivity({
      entity_type: 'asset',
      entity_id: selectedAsset.id,
      entity_reference: selectedAsset.reference,
      activity_type: 'nota',
      title: 'Nota agregada al activo',
      description: noteText.trim(),
    });

    setNoteText('');
    success('Nota guardada', 'La nota se ha añadido al historial del activo.');
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !selectedAsset) return;

    store.addDocument({
      name: docName.trim(),
      file_path: `/documents/${selectedAsset.reference}/${docName.trim()}`,
      file_type: 'pdf',
      mime_type: 'application/pdf',
      size: 1048576,
      entity_type: 'asset',
      entity_id: selectedAsset.id,
      category: docCategory,
    });

    setIsAddDocOpen(false);
    setDocName('');
    success('Documento adjuntado', 'El documento se ha vinculado al expediente del activo.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        category={category}
        title={title}
        description={description}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Exportar CSV
            </Button>
            <Button size="sm" onClick={() => setIsNewAssetModalOpen(true)} className="text-xs">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Nuevo activo
            </Button>
          </div>
        }
      />

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Total activos en cartera</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{assets.length}</span>
            <span className="text-xs text-emerald-600 font-medium">({activeCount} activos)</span>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Volumen actual valorado</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {formatCurrency(totalVolume)}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Ticket medio por activo</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {formatCurrency(avgValue)}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
          <Input
            type="text"
            placeholder="Buscar por referencia, título, dirección o ciudad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="text-xs h-9 w-36"
          >
            <option value="todos">Todas las fases</option>
            <option value="originacion">Originación</option>
            <option value="analisis">Análisis</option>
            <option value="comercializacion">Comercialización</option>
            <option value="negociacion">Negociación</option>
            <option value="operacion">Operación</option>
            <option value="cierre">Cierre</option>
          </Select>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs h-9 w-36"
          >
            <option value="todos">Todos los estados</option>
            <option value="disponible">Disponible</option>
            <option value="en_proceso">En proceso</option>
            <option value="reservado">Reservado</option>
            <option value="vendido">Vendido</option>
            <option value="baja">Baja</option>
          </Select>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
        {filteredAssets.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No hay activos coincidentes"
              description="No se han encontrado registros con los filtros seleccionados."
              actionLabel="Crear nuevo activo"
              onAction={() => setIsNewAssetModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/80">
                <tr>
                  <th className="py-3 px-4">Referencia</th>
                  <th className="py-3 px-4">Título / Ubicación</th>
                  <th className="py-3 px-4">Fase</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Valor Actual</th>
                  <th className="py-3 px-4 text-right">Precio Salida</th>
                  <th className="py-3 px-4 text-right">Superficie</th>
                  <th className="py-3 px-4">Propietario</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredAssets.map((asset) => {
                  const linkedOps = operations.filter((o) => o.asset_id === asset.id);

                  return (
                    <tr
                      key={asset.id}
                      className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-neutral-900 dark:text-neutral-100">
                        {asset.reference}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedAssetId(asset.id)}
                          className="font-medium text-neutral-900 dark:text-neutral-100 hover:underline text-left block truncate cursor-pointer"
                        >
                          {asset.title}
                        </button>
                        <span className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {asset.address ? `${asset.address}, ` : ''}{asset.city}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className="capitalize text-[10px]">
                          {asset.phase}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            asset.status === 'disponible'
                              ? 'success'
                              : asset.status === 'en_proceso'
                              ? 'warning'
                              : 'neutral'
                          }
                          className="text-[10px] capitalize"
                        >
                          {asset.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(asset.current_value)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-neutral-500">
                        {asset.asking_price ? formatCurrency(asset.asking_price) : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right text-neutral-500">
                        {asset.surface ? `${formatNumber(asset.surface)} m²` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-300 max-w-[140px] truncate">
                        {asset.owner_name || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedAssetId(asset.id)}
                            className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                            title="Ver detalle del activo"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAsset(asset.id, asset.reference)}
                            className="p-1 rounded text-neutral-400 hover:text-red-600"
                            title="Eliminar activo"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Asset Detail Drawer */}
      {selectedAsset && (
        <Drawer
          isOpen={!!selectedAsset}
          onClose={() => setSelectedAssetId(null)}
          title={selectedAsset.title}
          description={`Expediente ${selectedAsset.reference} • Rama ${selectedAsset.branch.toUpperCase()}`}
          width="xl"
        >
          <div className="space-y-6">
            {/* Top key figures banner */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-800 text-center">
              <div>
                <p className="text-[10px] text-neutral-400 uppercase">Valor Actual</p>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(selectedAsset.current_value)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-neutral-400 uppercase">Precio Salida</p>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(selectedAsset.asking_price)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-neutral-400 uppercase">Superficie</p>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {selectedAsset.surface ? `${formatNumber(selectedAsset.surface)} m²` : '-'}
                </p>
              </div>
            </div>

            {/* Tabs inside Drawer */}
            <Tabs defaultValue="resumen" onValueChange={() => {}} value="resumen">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="resumen">Resumen</TabsTrigger>
                <TabsTrigger value="operaciones">Operaciones</TabsTrigger>
                <TabsTrigger value="documentos">Documentos</TabsTrigger>
                <TabsTrigger value="actividad">Actividad</TabsTrigger>
              </TabsList>

              <TabsContent value="resumen" className="space-y-4 pt-3 text-xs">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-neutral-400 block text-[11px]">Fase actual:</span>
                      <Badge variant="outline" className="mt-0.5 capitalize">
                        {selectedAsset.phase}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[11px]">Estado:</span>
                      <Badge variant="success" className="mt-0.5 capitalize">
                        {selectedAsset.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <span className="text-neutral-400 block text-[11px]">Ubicación completa:</span>
                    <p className="font-medium text-neutral-800 dark:text-neutral-200 mt-0.5">
                      {selectedAsset.address || 'Sin dirección específica'}, {selectedAsset.city} ({selectedAsset.postal_code || 'España'})
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <div>
                      <span className="text-neutral-400 block text-[11px]">Propietario / Entidad:</span>
                      <p className="font-medium text-neutral-800 dark:text-neutral-200 mt-0.5">
                        {selectedAsset.owner_name || 'No asignado'}
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[11px]">Cartera asociada:</span>
                      <p className="font-medium text-neutral-800 dark:text-neutral-200 mt-0.5">
                        {selectedAsset.portfolio_name || 'Individual'}
                      </p>
                    </div>
                  </div>

                  {selectedAsset.notes && (
                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      <span className="text-neutral-400 block text-[11px]">Notas y observaciones:</span>
                      <p className="mt-1 text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 p-2.5 rounded-lg leading-relaxed">
                        {selectedAsset.notes}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="operaciones" className="pt-3 text-xs space-y-3">
                {operations.filter((o) => o.asset_id === selectedAsset.id).length === 0 ? (
                  <p className="py-4 text-center text-neutral-400">
                    No existen operaciones en curso asociadas a este activo.
                  </p>
                ) : (
                  operations
                    .filter((o) => o.asset_id === selectedAsset.id)
                    .map((op) => (
                      <div
                        key={op.id}
                        className="p-3 rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {op.title}
                          </span>
                          <span className="font-mono text-[10px] text-neutral-400">
                            {op.reference}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-1">
                          Cliente: {op.client_name || 'Por definir'} • Importe: {formatCurrency(op.amount)}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <Badge variant="outline" className="text-[10px] capitalize">
                            Fase: {op.phase}
                          </Badge>
                          <span className="text-[11px] text-emerald-600 font-medium">
                            Probabilidad {op.probability}%
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </TabsContent>

              <TabsContent value="documentos" className="pt-3 text-xs space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-neutral-500 font-medium">Archivos del expediente</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 px-2"
                    onClick={() => setIsAddDocOpen(true)}
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Adjuntar
                  </Button>
                </div>

                {documents.filter((d) => d.entity_id === selectedAsset.id).length === 0 ? (
                  <p className="py-4 text-center text-neutral-400">
                    No se han adjuntado documentos todavía.
                  </p>
                ) : (
                  documents
                    .filter((d) => d.entity_id === selectedAsset.id)
                    .map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/40"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-neutral-500" />
                          <div>
                            <p className="font-medium text-neutral-800 dark:text-neutral-200">
                              {doc.name}
                            </p>
                            <span className="text-[10px] text-neutral-400">
                              {formatDate(doc.created_at)} • {doc.category}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => success('Descarga simulada', `Descargando ${doc.name}`)}
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
                    placeholder="Registrar nota o llamada sobre este activo..."
                    className="w-full rounded-md border border-neutral-200 bg-white p-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-800 dark:bg-neutral-900"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" size="sm" className="text-xs h-7">
                      Guardar nota
                    </Button>
                  </div>
                </form>

                <ActivityTimeline
                  activities={activities.filter((a) => a.entity_id === selectedAsset.id)}
                />
              </TabsContent>
            </Tabs>
          </div>
        </Drawer>
      )}

      {/* New Asset Modal */}
      <Modal
        isOpen={isNewAssetModalOpen}
        onClose={() => setIsNewAssetModalOpen(false)}
        title={`Nuevo Activo — ${title}`}
        description="Completa los datos del activo para incorporarlo al inventario del CRM."
        maxWidth="xl"
      >
        <form onSubmit={handleCreateAsset} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1">Título del Activo *</label>
            <Input
              type="text"
              required
              placeholder="Ej: Edificio Residencial Conde de Aranda"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Ciudad *</label>
              <Input
                type="text"
                required
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Dirección</label>
              <Input
                type="text"
                placeholder="Calle, número..."
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium mb-1">Valor Actual (€) *</label>
              <Input
                type="number"
                required
                value={formValue}
                onChange={(e) => setFormValue(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Precio Salida (€)</label>
              <Input
                type="number"
                value={formAskingPrice}
                onChange={(e) => setFormAskingPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Superficie (m²)</label>
              <Input
                type="number"
                value={formSurface}
                onChange={(e) => setFormSurface(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Fase Inicial</label>
              <Select
                value={formPhase}
                onChange={(e) => setFormPhase(e.target.value as AssetPhase)}
              >
                <option value="originacion">Originación</option>
                <option value="analisis">Análisis</option>
                <option value="comercializacion">Comercialización</option>
                <option value="negociacion">Negociación</option>
                <option value="operacion">Operación</option>
                <option value="cierre">Cierre</option>
              </Select>
            </div>
            <div>
              <label className="block font-medium mb-1">Estado</label>
              <Select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as AssetStatus)}
              >
                <option value="disponible">Disponible</option>
                <option value="en_proceso">En proceso</option>
                <option value="reservado">Reservado</option>
                <option value="vendido">Vendido</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Propietario / Entidad Cedente</label>
            <Select
              value={formOwnerId}
              onChange={(e) => setFormOwnerId(e.target.value)}
            >
              <option value="">Sin propietario asignado</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.type})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block font-medium mb-1">Notas y Descripción</label>
            <textarea
              rows={2}
              className="w-full rounded-md border border-neutral-300 bg-white p-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900"
              placeholder="Detalles sobre ocupación, estado registral o estrategia comercial..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewAssetModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Guardar activo</Button>
          </div>
        </form>
      </Modal>

      {/* Add Document Modal */}
      <Modal
        isOpen={isAddDocOpen}
        onClose={() => setIsAddDocOpen(false)}
        title="Adjuntar Documento"
        description="Registra un documento en el expediente del activo."
        maxWidth="md"
      >
        <form onSubmit={handleAddDocument} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1">Nombre del Archivo *</label>
            <Input
              type="text"
              required
              placeholder="Ej: Nota_Simple_Actualizada.pdf"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Categoría Documental</label>
            <Select
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value as any)}
            >
              <option value="nota_simple">Nota Simple</option>
              <option value="tasacion">Informe de Tasación</option>
              <option value="contrato">Contrato / Arrendamiento</option>
              <option value="otro">Otro</option>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddDocOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Subir documento</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
