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
import { Card, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import {
  Plus,
  Building2,
  FolderKanban,
  Download,
  ChevronRight,
  Layers,
  Search,
} from 'lucide-react';
import { Owner, OwnerType, Portfolio } from '@/types';

export default function PropietariosPage() {
  const store = useStore();
  const { success, error } = useToast();

  const owners = store.getOwners();
  const portfolios = store.getPortfolios();
  const assets = store.getAssets();

  const [activeTab, setActiveTab] = React.useState<'propietarios' | 'carteras'>('propietarios');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Modals
  const [isOwnerModalOpen, setIsOwnerModalOpen] = React.useState(false);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = React.useState(false);

  // New Owner state
  const [ownerName, setOwnerName] = React.useState('');
  const [ownerType, setOwnerType] = React.useState<OwnerType>('banco');
  const [ownerTaxId, setOwnerTaxId] = React.useState('');
  const [ownerCity, setOwnerCity] = React.useState('Madrid');
  const [ownerEmail, setOwnerEmail] = React.useState('');

  // New Portfolio state
  const [portName, setPortName] = React.useState('');
  const [portOwnerId, setPortOwnerId] = React.useState(owners[0]?.id || '');
  const [portDescription, setPortDescription] = React.useState('');

  const filteredOwners = owners.filter(
    (o) =>
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.tax_id && o.tax_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredPortfolios = portfolios.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.owner_name && p.owner_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalAssetsCount = assets.length;
  const totalValue = assets.reduce((acc, curr) => acc + curr.current_value, 0);

  const handleCreateOwner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName) return;

    const created = store.addOwner({
      name: ownerName,
      type: ownerType,
      tax_id: ownerTaxId,
      email: ownerEmail,
      city: ownerCity,
      country: 'España',
      status: 'activo',
    });

    setIsOwnerModalOpen(false);
    setOwnerName('');
    success('Propietario creado', `Se ha registrado a ${created.name} (${created.reference}).`);
  };

  const handleCreatePortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portName || !portOwnerId) return;

    const owner = owners.find((o) => o.id === portOwnerId);

    const created = store.addPortfolio({
      name: portName,
      owner_id: portOwnerId,
      owner_name: owner?.name,
      description: portDescription,
      status: 'activa',
      total_assets: 0,
      total_nominal: 0,
      total_value: 0,
    });

    setIsPortfolioModalOpen(false);
    setPortName('');
    setPortDescription('');
    success('Cartera creada', `Cartera ${created.reference} registrada.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Estructura de Activos"
        title="Propietarios y carteras"
        description="Jerarquía institucional: Entidades cedentes, servicers y carteras de inversión inmobiliaria."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOwnerModalOpen(true)}
              className="text-xs"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Nuevo propietario
            </Button>
            <Button
              size="sm"
              onClick={() => setIsPortfolioModalOpen(true)}
              className="text-xs"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Nueva cartera
            </Button>
          </div>
        }
      />

      {/* Aggregate KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Total Propietarios</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {owners.length}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Carteras Registradas</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {portfolios.length}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Activos Integrados</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {totalAssetsCount}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">NAV Global Gestionado</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {formatCurrency(totalValue)}
          </p>
        </div>
      </div>

      {/* Navigation Tabs between Owners and Portfolios */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('propietarios')}
            className={`text-xs font-semibold pb-2 border-b-2 cursor-pointer ${
              activeTab === 'propietarios'
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            Propietarios ({owners.length})
          </button>
          <button
            onClick={() => setActiveTab('carteras')}
            className={`text-xs font-semibold pb-2 border-b-2 cursor-pointer ${
              activeTab === 'carteras'
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            Carteras ({portfolios.length})
          </button>
        </div>

        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-neutral-400" />
          <Input
            type="text"
            placeholder="Filtrar por nombre o CIF..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-8"
          />
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'propietarios' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOwners.map((owner) => {
            const ownerPortfolios = portfolios.filter((p) => p.owner_id === owner.id);
            const ownerAssets = assets.filter((a) => a.owner_id === owner.id);
            const ownerValue = ownerAssets.reduce((acc, curr) => acc + curr.current_value, 0);

            return (
              <Card key={owner.id} className="p-5 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-start justify-between">
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {owner.reference}
                    </Badge>
                    <Badge variant="neutral" className="text-[10px] capitalize">
                      {owner.type}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 mt-2">
                    {owner.name}
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    NIF: {owner.tax_id || '-'} • {owner.city}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Carteras:</span>
                    <strong className="text-neutral-900 dark:text-neutral-100">
                      {ownerPortfolios.length}
                    </strong>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Activos:</span>
                    <strong className="text-neutral-900 dark:text-neutral-100">
                      {ownerAssets.length} ({formatCurrency(ownerValue)})
                    </strong>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/80">
                <tr>
                  <th className="py-3 px-4">Referencia</th>
                  <th className="py-3 px-4">Nombre de Cartera</th>
                  <th className="py-3 px-4">Propietario</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-center">Nº Activos</th>
                  <th className="py-3 px-4 text-right">Saldo Nominal</th>
                  <th className="py-3 px-4 text-right">Valoracion Global</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredPortfolios.map((port) => (
                  <tr key={port.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-neutral-900 dark:text-neutral-100">
                      {port.reference}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                        {port.name}
                      </span>
                      {port.description && (
                        <span className="text-[11px] text-neutral-500 block truncate max-w-sm">
                          {port.description}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-300">
                      {port.owner_name || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="success" className="capitalize text-[10px]">
                        {port.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium">
                      {port.total_assets}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(port.total_nominal)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-emerald-600">
                      {formatCurrency(port.total_value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Owner Modal */}
      <Modal
        isOpen={isOwnerModalOpen}
        onClose={() => setIsOwnerModalOpen(false)}
        title="Nuevo Propietario / Entidad"
        description="Registra una nueva entidad cedente o propietario institucional."
        maxWidth="md"
      >
        <form onSubmit={handleCreateOwner} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1">Nombre / Razón Social *</label>
            <Input
              type="text"
              required
              placeholder="Ej: Banco Sabadell Real Estate"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Tipo de Entidad</label>
              <Select
                value={ownerType}
                onChange={(e) => setOwnerType(e.target.value as OwnerType)}
              >
                <option value="banco">Banco / Entidad Financiera</option>
                <option value="fondo">Fondo de Inversión</option>
                <option value="servicer">Servicer Inmobiliario</option>
                <option value="empresa">Sociedad Patrimonial</option>
                <option value="persona">Particular</option>
              </Select>
            </div>
            <div>
              <label className="block font-medium mb-1">NIF / CIF</label>
              <Input
                type="text"
                placeholder="A-12345678"
                value={ownerTaxId}
                onChange={(e) => setOwnerTaxId(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Email de Contacto</label>
              <Input
                type="email"
                placeholder="carteras@banco.es"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Ciudad</label>
              <Input
                type="text"
                value={ownerCity}
                onChange={(e) => setOwnerCity(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOwnerModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Guardar propietario</Button>
          </div>
        </form>
      </Modal>

      {/* New Portfolio Modal */}
      <Modal
        isOpen={isPortfolioModalOpen}
        onClose={() => setIsPortfolioModalOpen(false)}
        title="Nueva Cartera"
        description="Agrupa activos bajo un mismo perímetro de desinversión o adquisición."
        maxWidth="md"
      >
        <form onSubmit={handleCreatePortfolio} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1">Nombre de la Cartera *</label>
            <Input
              type="text"
              required
              placeholder="Ej: Cartera Residencial Cataluña 2026"
              value={portName}
              onChange={(e) => setPortName(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Propietario / Cedente *</label>
            <Select
              value={portOwnerId}
              onChange={(e) => setPortOwnerId(e.target.value)}
              required
            >
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.type})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block font-medium mb-1">Descripción y Perímetro</label>
            <textarea
              rows={2}
              className="w-full rounded-md border border-neutral-300 bg-white p-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900"
              placeholder="Objetivos de desinversión, tipología de activos comprendidos..."
              value={portDescription}
              onChange={(e) => setPortDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPortfolioModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Crear cartera</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
