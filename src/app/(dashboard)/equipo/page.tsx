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
import { Card } from '@/components/ui/Card';
import { getInitials } from '@/lib/utils';
import { Plus, Mail, Phone, ShieldCheck, UserCheck } from 'lucide-react';
import { UserProfile, UserRole } from '@/types';

export default function EquipoPage() {
  const store = useStore();
  const { success } = useToast();

  const profiles = store.getProfiles();
  const operations = store.getOperations();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [formFirstName, setFormFirstName] = React.useState('');
  const [formLastName, setFormLastName] = React.useState('');
  const [formEmail, setFormEmail] = React.useState('');
  const [formPhone, setFormPhone] = React.useState('');
  const [formRole, setFormRole] = React.useState<UserRole>('analyst');
  const [formDepartment, setFormDepartment] = React.useState('Análisis & Investment');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstName || !formEmail) return;

    success('Miembro invitado', `Se ha enviado invitación de acceso a ${formEmail}.`);
    setIsModalOpen(false);
    setFormFirstName('');
    setFormLastName('');
    setFormEmail('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Organización & Usuarios"
        title="Equipo"
        description="Gestión de roles de usuario, permisos del sistema y asignación de operaciones."
        actions={
          <Button size="sm" onClick={() => setIsModalOpen(true)} className="text-xs">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nuevo miembro
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {profiles.map((p) => {
          const assignedOps = operations.filter((o) => o.assigned_user_id === p.id);

          return (
            <Card key={p.id} className="p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold dark:bg-neutral-100 dark:text-neutral-900">
                    {getInitials(`${p.first_name} ${p.last_name}`)}
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {p.role}
                  </Badge>
                </div>

                <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 mt-3">
                  {p.first_name} {p.last_name}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">{p.department}</p>
              </div>

              <div className="mt-5 space-y-2 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300 truncate">
                  <Mail className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">{p.email}</span>
                </div>
                {p.phone && (
                  <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                    <Phone className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                    <span>{p.phone}</span>
                  </div>
                )}
                <div className="pt-2 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Operaciones activas:</span>
                  <strong className="text-neutral-800 dark:text-neutral-200">
                    {assignedOps.length}
                  </strong>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Invitar Miembro del Equipo"
        description="Asigna un rol con permisos y envía acceso al CRM."
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Nombre *</label>
              <Input
                type="text"
                required
                value={formFirstName}
                onChange={(e) => setFormFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Apellidos</label>
              <Input
                type="text"
                value={formLastName}
                onChange={(e) => setFormLastName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Email Corporativo *</label>
            <Input
              type="email"
              required
              placeholder="nombre@orbanixgroup.com"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Rol de Acceso (RBAC)</label>
              <Select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as UserRole)}
              >
                <option value="admin">Administrador (Acceso total)</option>
                <option value="manager">Manager (Gestión de equipos)</option>
                <option value="analyst">Analista (Modelización & Investment)</option>
                <option value="commercial">Comercial (Deals & Clientes)</option>
                <option value="accounting">Contable (Facturación & Balances)</option>
                <option value="viewer">Lector (Solo lectura)</option>
              </Select>
            </div>
            <div>
              <label className="block font-medium mb-1">Departamento</label>
              <Input
                type="text"
                value={formDepartment}
                onChange={(e) => setFormDepartment(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Enviar invitación</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
