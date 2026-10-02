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
import { Plus, Mail, Phone, Briefcase, Search } from 'lucide-react';
import { Collaborator } from '@/types';

export default function ColaboradoresPage() {
  const store = useStore();
  const { success } = useToast();

  const collaborators = store.getCollaborators();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('todos');

  // Modal
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [formName, setFormName] = React.useState('');
  const [formCompany, setFormCompany] = React.useState('');
  const [formType, setFormType] = React.useState<Collaborator['type']>('abogado');
  const [formEmail, setFormEmail] = React.useState('');
  const [formPhone, setFormPhone] = React.useState('');
  const [formSpecialty, setFormSpecialty] = React.useState('');
  const [formNotes, setFormNotes] = React.useState('');

  const filtered = collaborators.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.specialty && c.specialty.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === 'todos' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;

    store.addCollaborator({
      name: formName,
      company: formCompany,
      type: formType,
      email: formEmail,
      phone: formPhone,
      specialty: formSpecialty,
      status: 'activo',
      notes: formNotes,
      active_cases_count: 1,
    });

    setIsModalOpen(false);
    setFormName('');
    setFormEmail('');
    success('Colaborador añadido', 'El colaborador externo ha sido registrado.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Red Profesional & Partners"
        title="Colaboradores"
        description="Red de asesores jurídicos, sociedades de tasación homologadas, procuradores y notarios."
        actions={
          <Button size="sm" onClick={() => setIsModalOpen(true)} className="text-xs">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nuevo colaborador
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre, firma o especialidad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>

        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-xs h-9 w-40"
        >
          <option value="todos">Todos los tipos</option>
          <option value="abogado">Abogados</option>
          <option value="tasador">Tasadores</option>
          <option value="notario">Notarías</option>
          <option value="procurador">Procuradores</option>
          <option value="agente">Agentes / Brokers</option>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/80">
              <tr>
                <th className="py-3 px-4">Nombre / Contacto</th>
                <th className="py-3 px-4">Firma / Despacho</th>
                <th className="py-3 px-4">Especialidad</th>
                <th className="py-3 px-4">Perfil</th>
                <th className="py-3 px-4">Email / Teléfono</th>
                <th className="py-3 px-4 text-center">Casos Activos</th>
                <th className="py-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-neutral-100">
                    {c.name}
                  </td>
                  <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300">
                    {c.company || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-neutral-500">
                    {c.specialty || '-'}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="outline" className="capitalize text-[10px]">
                      {c.type}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-400">
                    <div>{c.email}</div>
                    {c.phone && <div className="text-[11px] text-neutral-400">{c.phone}</div>}
                  </td>
                  <td className="py-3.5 px-4 text-center font-medium">
                    {c.active_cases_count || 0}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="success" className="text-[10px] capitalize">
                      {c.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Collaborator Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nuevo Colaborador Externo"
        description="Registra un partner legal, técnico o de intermediación."
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1">Nombre Completo *</label>
            <Input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Firma / Despacho</label>
              <Input
                type="text"
                placeholder="Ej: Uría Menéndez"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Tipo de Colaborador</label>
              <Select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
              >
                <option value="abogado">Abogado</option>
                <option value="tasador">Tasador</option>
                <option value="notario">Notaría</option>
                <option value="procurador">Procurador</option>
                <option value="agente">Agente / Broker</option>
                <option value="consultor">Consultor</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Email *</label>
              <Input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Teléfono</label>
              <Input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Especialidad Principal</label>
            <Input
              type="text"
              placeholder="Ej: Ejecuciones hipotecarias y subastas"
              value={formSpecialty}
              onChange={(e) => setFormSpecialty(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar colaborador</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
