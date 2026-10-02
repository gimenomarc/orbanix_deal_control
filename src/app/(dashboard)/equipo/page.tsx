'use client';

import * as React from 'react';
import { useStore } from '@/hooks/useStore';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import {
  UserPlus,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  UserX,
  UserCheck,
  Trash2,
  Lock,
  Key,
  Info,
} from 'lucide-react';
import { UserProfile, UserRole, ROLE_DEFINITIONS } from '@/types';

export default function EquipoPage() {
  const store = useStore();
  const { success, error: toastError } = useToast();

  const profiles = store.getProfiles();
  const operations = store.getOperations();
  const currentUser = store.getCurrentUser();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [formFirstName, setFormFirstName] = React.useState('');
  const [formLastName, setFormLastName] = React.useState('');
  const [formUsername, setFormUsername] = React.useState('');
  const [formEmail, setFormEmail] = React.useState('');
  const [formPassword, setFormPassword] = React.useState('orbanix2026!');
  const [formPhone, setFormPhone] = React.useState('');
  const [formRole, setFormRole] = React.useState<UserRole>('manager');
  const [formDepartment, setFormDepartment] = React.useState('Gestión de Activos Inmobiliarios');
  const [selectedRoleFilter, setSelectedRoleFilter] = React.useState<string>('todos');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstName || !formEmail) return;

    const username = formUsername.trim().toLowerCase() || formEmail.split('@')[0].toLowerCase();

    // Check username or email uniqueness
    const exists = profiles.some(
      (p) => p.username?.toLowerCase() === username || p.email.toLowerCase() === formEmail.toLowerCase()
    );

    if (exists) {
      toastError('Usuario existente', 'Ya existe un miembro con ese usuario o correo corporativo.');
      return;
    }

    const newUser = store.addUser({
      username,
      first_name: formFirstName.trim(),
      last_name: formLastName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim() || undefined,
      role: formRole,
      department: formDepartment.trim(),
      active: true,
      password: formPassword.trim() || 'orbanix2026!',
    });

    const roleLabel = ROLE_DEFINITIONS[newUser.role]?.label || newUser.role;
    success('Usuario creado', `Se ha dado de alta a ${newUser.first_name} ${newUser.last_name} (${roleLabel}).`);
    setIsModalOpen(false);

    // Reset Form
    setFormFirstName('');
    setFormLastName('');
    setFormUsername('');
    setFormEmail('');
    setFormPassword('orbanix2026!');
    setFormPhone('');
    setFormRole('manager');
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    store.updateUserRole(userId, newRole);
    const targetUser = profiles.find((p) => p.id === userId);
    const roleLabel = ROLE_DEFINITIONS[newRole]?.label || newRole;
    success('Rol actualizado', `Se ha asignado el rol ${roleLabel} a ${targetUser?.first_name || 'usuario'}.`);
  };

  const handleToggleStatus = (userId: string) => {
    const targetUser = profiles.find((p) => p.id === userId);
    if (!targetUser) return;

    if (targetUser.username === 'mgimeno') {
      toastError('Acción no permitida', 'No puedes bloquear al Administrador Principal.');
      return;
    }

    store.toggleUserStatus(userId);
    success(
      targetUser.active ? 'Usuario desactivado' : 'Usuario activado',
      `El acceso de ${targetUser.first_name} ha sido ${targetUser.active ? 'bloqueado' : 'restaurado'}.`
    );
  };

  const handleDelete = (userId: string) => {
    const targetUser = profiles.find((p) => p.id === userId);
    if (!targetUser) return;

    if (targetUser.username === 'mgimeno' || targetUser.id === 'a0000000-0000-0000-0000-000000000000') {
      toastError('Acción no permitida', 'No puedes eliminar al Administrador Principal de la plataforma.');
      return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${targetUser.first_name} ${targetUser.last_name}?`)) {
      const deleted = store.deleteUser(userId);
      if (deleted) {
        success('Usuario eliminado', `Se ha retirado a ${targetUser.first_name} del sistema.`);
      }
    }
  };

  const filteredProfiles = profiles.filter((p) => {
    if (selectedRoleFilter === 'todos') return true;
    return p.role === selectedRoleFilter;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        category="Control de Usuarios & Seguridad"
        title="Gestión de Equipo & Roles (RBAC)"
        description="Panel de administración de cuentas internas. El registro público está deshabilitado; solo los Administradores pueden crear usuarios y asignar roles."
        actions={
          <Button size="sm" onClick={() => setIsModalOpen(true)} className="text-xs cursor-pointer">
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            Crear nuevo usuario
          </Button>
        }
      />

      {/* Guide to Real Estate & Deal Control Roles */}
      <div className="p-4 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
            Perfiles Profesionales Disponibles en Orbanix Deal Control
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {Object.values(ROLE_DEFINITIONS).map((r) => (
            <div
              key={r.role}
              onClick={() => setSelectedRoleFilter(selectedRoleFilter === r.role ? 'todos' : r.role)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                selectedRoleFilter === r.role
                  ? 'border-neutral-900 bg-neutral-100 dark:border-white dark:bg-neutral-800'
                  : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-800/80 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${r.badgeColor}`}>
                  {r.shortLabel}
                </span>
                <span suppressHydrationWarning className="text-[11px] font-bold text-neutral-400">
                  {profiles.filter((p) => p.role === r.role).length}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1">
                {r.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Count Bar */}
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>
          Mostrando <strong>{filteredProfiles.length}</strong> usuarios{' '}
          {selectedRoleFilter !== 'todos' && `filtrados por rol: ${ROLE_DEFINITIONS[selectedRoleFilter as UserRole]?.label}`}
        </span>
        {selectedRoleFilter !== 'todos' && (
          <button
            onClick={() => setSelectedRoleFilter('todos')}
            className="text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
          >
            Quitar filtro
          </button>
        )}
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProfiles.map((p) => {
          const assignedOps = operations.filter((o) => o.assigned_user_id === p.id);
          const isMainAdmin = p.username === 'mgimeno' || p.id === 'a0000000-0000-0000-0000-000000000000';
          const roleInfo = ROLE_DEFINITIONS[p.role] || ROLE_DEFINITIONS.viewer;

          return (
            <Card
              key={p.id}
              className={`p-5 shadow-2xs flex flex-col justify-between transition-all ${
                !p.active ? 'opacity-60 bg-neutral-100/50 dark:bg-neutral-900/40 border-dashed' : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold dark:bg-neutral-100 dark:text-neutral-900">
                      {p.first_name[0]}{p.last_name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 leading-tight">
                        {p.first_name} {p.last_name}
                      </h3>
                      <p className="text-[11px] text-purple-600 dark:text-purple-400 font-mono mt-0.5">
                        @{p.username || 'sin_usuario'}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${roleInfo.badgeColor}`}>
                    {roleInfo.shortLabel}
                  </span>
                </div>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3 font-medium">
                  {p.department}
                </p>
              </div>

              <div className="mt-4 space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                {/* Contact info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300 truncate">
                    <Mail className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{p.email}</span>
                  </div>
                  {p.phone && (
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                      <Phone className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      <span>{p.phone}</span>
                    </div>
                  )}
                </div>

                {/* Role Switcher (Admin Only) */}
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Cambiar Rol del Usuario:
                  </label>
                  <Select
                    value={p.role}
                    disabled={isMainAdmin}
                    onChange={(e) => handleRoleChange(p.id, e.target.value as UserRole)}
                    className="text-xs h-8 bg-neutral-50 dark:bg-neutral-800/80"
                  >
                    <option value="admin">Super Administrador (Control Total)</option>
                    <option value="manager">Gestor Inmobiliario (Asset Manager)</option>
                    <option value="analyst">Analista de Inversiones (TIR & Múltiplos)</option>
                    <option value="commercial">Director Comercial / Broker (Deals)</option>
                    <option value="compliance">Responsable PBC & Legal (Compliance)</option>
                    <option value="accounting">Responsable Financiero (Contabilidad)</option>
                    <option value="viewer">Auditor / Lector Institucional</option>
                  </Select>
                </div>

                {/* Operations & Actions Footer */}
                <div className="pt-2 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">
                    Deals asignados:{' '}
                    <strong className="text-neutral-800 dark:text-neutral-200">
                      {assignedOps.length}
                    </strong>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {!isMainAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p.id)}
                          className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                            p.active
                              ? 'text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40'
                              : 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40'
                          }`}
                          title={p.active ? 'Bloquear acceso de este usuario' : 'Reactivar acceso'}
                        >
                          {p.active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-md text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}

                    {isMainAdmin && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800">
                        Admin Principal
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Internal User Creation Modal (Admin Only) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Nuevo Usuario Interno"
        description="Alta de cuenta interna y asignación de perfil RBAC. Este usuario podrá iniciar sesión de inmediato con sus credenciales."
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Nombre *</label>
              <Input
                type="text"
                required
                placeholder="ej. Carlos"
                value={formFirstName}
                onChange={(e) => setFormFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Apellidos *</label>
              <Input
                type="text"
                required
                placeholder="ej. Mendoza Ruiz"
                value={formLastName}
                onChange={(e) => setFormLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Nombre de Usuario (Login) *</label>
              <Input
                type="text"
                required
                placeholder="ej. cmendoza"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
              />
              <p className="text-[10px] text-neutral-400 mt-0.5">
                Servirá para identificarse en la pantalla de inicio de sesión.
              </p>
            </div>
            <div>
              <label className="block font-medium mb-1">Contraseña Inicial *</label>
              <Input
                type="text"
                required
                placeholder="Contraseña de acceso"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
              />
              <p className="text-[10px] text-neutral-400 mt-0.5">
                Por defecto: <code className="font-mono text-neutral-800 dark:text-neutral-200">orbanix2026!</code>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Email Corporativo *</label>
              <Input
                type="email"
                required
                placeholder="usuario@orbanixgroup.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Teléfono Móvil</label>
              <Input
                type="text"
                placeholder="+34 600 000 000"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Perfil / Rol RBAC *</label>
              <Select
                value={formRole}
                onChange={(e) => {
                  const role = e.target.value as UserRole;
                  setFormRole(role);
                  if (role === 'manager') setFormDepartment('Gestión de Activos Inmobiliarios');
                  if (role === 'analyst') setFormDepartment('Análisis Financiero & Investment');
                  if (role === 'commercial') setFormDepartment('Dirección Comercial & Deals');
                  if (role === 'compliance') setFormDepartment('Prevención Blanqueo & Legal');
                  if (role === 'accounting') setFormDepartment('Finanzas & Facturación');
                  if (role === 'viewer') setFormDepartment('Auditoría Externa');
                  if (role === 'admin') setFormDepartment('Dirección General');
                }}
              >
                <option value="manager">Gestor Inmobiliario (Asset Manager)</option>
                <option value="analyst">Analista de Inversiones (TIR & Múltiplos)</option>
                <option value="commercial">Director Comercial / Broker (Deals)</option>
                <option value="compliance">Responsable PBC & Legal (Compliance)</option>
                <option value="accounting">Responsable Financiero (Contabilidad)</option>
                <option value="viewer">Auditor / Lector Institucional</option>
                <option value="admin">Super Administrador (Control Total)</option>
              </Select>
              <p className="text-[10px] text-neutral-400 mt-1">
                {ROLE_DEFINITIONS[formRole]?.description}
              </p>
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
            <Button type="submit">Dar de alta usuario</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
