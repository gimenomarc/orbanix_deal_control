'use client';

import * as React from 'react';
import { useStore } from '@/hooks/useStore';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import {
  CheckCircle2,
  Wifi,
  Shield,
  Building,
  RefreshCw,
  Key,
  Lock,
  Unlock,
  AlertTriangle,
  RotateCcw,
  Check,
  X as XIcon,
} from 'lucide-react';
import {
  UserRole,
  AppModule,
  APP_MODULES,
  ROLE_DEFINITIONS,
  DEFAULT_ROLE_PERMISSIONS,
} from '@/types';

export default function ConfiguracionPage() {
  const store = useStore();
  const { success, error: toastError } = useToast();

  const currentUser = store.getCurrentUser();
  const isSuperAdmin = currentUser?.role === 'admin';

  const connections = store.getSystemConnections();
  const rolePermissions = store.getRolePermissions();

  const [companyName, setCompanyName] = React.useState('ORBANIX GROUP');
  const [companyTaxId, setCompanyTaxId] = React.useState('B-88990011');
  const [companyAddress, setCompanyAddress] = React.useState('Paseo de la Castellana 95, Madrid');
  const [companyEmail, setCompanyEmail] = React.useState('contacto@orbanixgroup.com');

  // Selected role in Permissions editor
  const [selectedRoleToEdit, setSelectedRoleToEdit] = React.useState<UserRole>('commercial');

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    success('Configuración guardada', 'Los datos corporativos se han actualizado.');
  };

  const handleToggleModulePermission = (role: UserRole, mod: AppModule) => {
    if (!isSuperAdmin) {
      toastError('Acceso denegado', 'Solo un Super Administrador puede modificar los permisos de los perfiles.');
      return;
    }

    if (role === 'admin') {
      toastError('Protección de Sistema', 'El Super Administrador siempre mantiene acceso irrestricto a todos los módulos.');
      return;
    }

    const currentModules = store.getModulesForRole(role);
    const hasMod = currentModules.includes(mod);
    let nextModules: AppModule[];

    if (hasMod) {
      if (mod === 'inicio') {
        toastError('Módulo obligatorio', 'El módulo Inicio debe estar activo para que el usuario pueda ingresar a la plataforma.');
        return;
      }
      nextModules = currentModules.filter((m) => m !== mod);
    } else {
      nextModules = [...currentModules, mod];
    }

    store.updateRolePermissions(role, nextModules);
    success(
      'Permiso actualizado',
      `${hasMod ? 'Retirado' : 'Concedido'} acceso al módulo "${mod}" para el rol [${ROLE_DEFINITIONS[role].label}].`
    );
  };

  const handleResetDefaults = () => {
    if (!isSuperAdmin) {
      toastError('Acceso denegado', 'Solo un Super Administrador puede restablecer los permisos.');
      return;
    }
    store.resetRolePermissions();
    success('Permisos restablecidos', 'Se han restaurado los permisos por defecto para todos los perfiles de la organización.');
  };

  const handleToggleConnection = (id: string, currentStatus: string) => {
    const nextStatus =
      currentStatus === 'Conectado' ? 'Pendiente' : currentStatus === 'Pendiente' ? 'Sin conexión' : 'Conectado';
    store.updateSystemConnection(id, nextStatus as any);
    success('Estado de conexión actualizado', `Servicio actualizado a ${nextStatus}.`);
  };

  const activeRoleModules = store.getModulesForRole(selectedRoleToEdit);
  const selectedRoleInfo = ROLE_DEFINITIONS[selectedRoleToEdit];

  return (
    <div className="space-y-6">
      <PageHeader
        category="Administración del Sistema"
        title="Configuración"
        description="Parámetros de empresa, permisos por perfil, conexiones de infraestructura y servicios externos."
      />

      <Tabs defaultValue="permisos" onValueChange={() => {}} value="permisos">
        <TabsList className="mb-4">
          <TabsTrigger value="permisos" className="flex items-center gap-1.5">
            <Key className="h-3.5 w-3.5" />
            Permisos & Vistas de Perfiles
          </TabsTrigger>
          <TabsTrigger value="conexiones">Conexiones y servicios</TabsTrigger>
          <TabsTrigger value="empresa">Empresa & Marca</TabsTrigger>
          <TabsTrigger value="seguridad">Seguridad & RLS</TabsTrigger>
        </TabsList>

        {/* Permisos & Vistas de Perfiles Tab */}
        <TabsContent value="permisos" className="space-y-6">
          {/* Header notice */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-purple-950/20 border border-purple-800/40">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-900/40 text-purple-400 mt-0.5 shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  Matriz de Control de Acceso Basada en Roles (RBAC)
                  {isSuperAdmin && (
                    <Badge variant="success" className="text-[10px] py-0 px-2">
                      Super Admin Activo
                    </Badge>
                  )}
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Cada perfil solo visualiza en el CRM los módulos necesarios para su operativa.
                  {isSuperAdmin ? (
                    <span className="text-emerald-500 dark:text-emerald-400 ml-1 font-medium">
                      Puedes activar o desactivar módulos haciendo clic en los conmutadores.
                    </span>
                  ) : (
                    <span className="text-amber-500 dark:text-amber-400 ml-1 font-medium">
                      Modo lectura. Solo los Super Administradores pueden editar estos permisos.
                    </span>
                  )}
                </p>
              </div>
            </div>

            {isSuperAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs shrink-0 flex items-center gap-1.5 border-neutral-700 hover:bg-neutral-800"
                onClick={handleResetDefaults}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restablecer por Defecto
              </Button>
            )}
          </div>

          {/* Role Selector Tabs */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Selecciona el rol para auditar o editar sus permisos:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map((roleKey) => {
                  const r = ROLE_DEFINITIONS[roleKey];
                  const isSelected = selectedRoleToEdit === roleKey;
                  const modCount = store.getModulesForRole(roleKey).length;
                  const isRoleAdmin = roleKey === 'admin';

                  return (
                    <button
                      key={roleKey}
                      type="button"
                      onClick={() => setSelectedRoleToEdit(roleKey)}
                      className={`text-left p-3 rounded-lg border transition-all select-none ${
                        isSelected
                          ? 'bg-neutral-900 text-white border-purple-500/80 shadow-md ring-1 ring-purple-500/50 dark:bg-neutral-900'
                          : 'bg-white dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${r.badgeColor}`}>
                          {r.shortLabel}
                        </span>
                        {isRoleAdmin ? (
                          <Lock className="h-3 w-3 text-purple-400" />
                        ) : (
                          <span className="text-[10px] text-neutral-400 font-mono font-medium">
                            {modCount} / {APP_MODULES.length}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-xs mt-2 truncate">
                        {r.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modules Grid for Selected Role */}
            <Card className="shadow-2xs overflow-hidden border border-neutral-200 dark:border-neutral-800">
              <CardHeader className="bg-neutral-50/50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800 py-3.5 px-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      Permisos asignados a: <span className="text-purple-600 dark:text-purple-400">{selectedRoleInfo.label}</span>
                    </CardTitle>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {selectedRoleInfo.description}
                    </p>
                  </div>
                  {selectedRoleToEdit === 'admin' ? (
                    <Badge variant="neutral" className="text-[11px] py-1 px-3 flex items-center gap-1.5">
                      <Lock className="h-3 w-3 text-purple-400" />
                      Acceso total bloqueado por seguridad
                    </Badge>
                  ) : (
                    <span className="text-xs text-neutral-400 font-mono">
                      {activeRoleModules.length} módulos habilitados
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-0 divide-y divide-neutral-100 dark:divide-neutral-800/80">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-100 dark:divide-neutral-800">
                  {/* Left Column: Core & Gestion */}
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    <div className="bg-neutral-100/40 dark:bg-neutral-950/40 px-5 py-2 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                      Módulos Principales & Gestión
                    </div>
                    {APP_MODULES.filter((m) => m.category === 'core' || m.category === 'gestion').map((mod) => {
                      const isAllowed = activeRoleModules.includes(mod.module);
                      const isProtected = selectedRoleToEdit === 'admin' || mod.module === 'inicio';

                      return (
                        <div
                          key={mod.module}
                          className="flex items-center justify-between p-3.5 px-5 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-colors"
                        >
                          <div className="min-w-0 pr-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                                {mod.label}
                              </span>
                              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.2 rounded">
                                /{mod.module}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
                              {mod.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isAllowed ? (
                              <Badge variant="success" className="text-[10px] py-0 px-2 flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                Permitido
                              </Badge>
                            ) : (
                              <Badge variant="neutral" className="text-[10px] py-0 px-2 flex items-center gap-1 opacity-70">
                                <XIcon className="h-3 w-3 text-neutral-400" />
                                Oculto
                              </Badge>
                            )}

                            {isSuperAdmin && !isProtected && (
                              <Button
                                variant={isAllowed ? 'outline' : 'secondary'}
                                size="sm"
                                className="h-7 text-[11px] px-2.5 ml-1"
                                onClick={() => handleToggleModulePermission(selectedRoleToEdit, mod.module)}
                              >
                                {isAllowed ? 'Revocar' : 'Habilitar'}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Column: Activos & Sistema */}
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    <div className="bg-neutral-100/40 dark:bg-neutral-950/40 px-5 py-2 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                      Cartera de Activos & Infraestructura
                    </div>
                    {APP_MODULES.filter((m) => m.category === 'activos' || m.category === 'sistema').map((mod) => {
                      const isAllowed = activeRoleModules.includes(mod.module);
                      const isProtected = selectedRoleToEdit === 'admin';

                      return (
                        <div
                          key={mod.module}
                          className="flex items-center justify-between p-3.5 px-5 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-colors"
                        >
                          <div className="min-w-0 pr-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                                {mod.label}
                              </span>
                              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.2 rounded">
                                /{mod.module}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
                              {mod.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isAllowed ? (
                              <Badge variant="success" className="text-[10px] py-0 px-2 flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                Permitido
                              </Badge>
                            ) : (
                              <Badge variant="neutral" className="text-[10px] py-0 px-2 flex items-center gap-1 opacity-70">
                                <XIcon className="h-3 w-3 text-neutral-400" />
                                Oculto
                              </Badge>
                            )}

                            {isSuperAdmin && !isProtected && (
                              <Button
                                variant={isAllowed ? 'outline' : 'secondary'}
                                size="sm"
                                className="h-7 text-[11px] px-2.5 ml-1"
                                onClick={() => handleToggleModulePermission(selectedRoleToEdit, mod.module)}
                              >
                                {isAllowed ? 'Revocar' : 'Habilitar'}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conexiones y Servicios Tab */}
        <TabsContent value="conexiones" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <CardTitle className="text-sm">Estado de Infraestructura y Servicios Integrados</CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-neutral-100 dark:divide-neutral-800">
              {connections.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-4 px-6 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                      {c.display_name}
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {c.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        c.status === 'Conectado'
                          ? 'success'
                          : c.status === 'Pendiente'
                          ? 'warning'
                          : 'neutral'
                      }
                      className="text-xs"
                    >
                      {c.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] px-2"
                      onClick={() => handleToggleConnection(c.id, c.status)}
                    >
                      Probar enlace
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Empresa Tab */}
        <TabsContent value="empresa" className="space-y-4">
          <Card className="p-6 max-w-2xl shadow-2xs">
            <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Nombre Comercial</label>
                  <Input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">NIF / CIF Corporativo</label>
                  <Input
                    type="text"
                    value={companyTaxId}
                    onChange={(e) => setCompanyTaxId(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Sede Social</label>
                <Input
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Email Institucional</label>
                <Input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <Button type="submit" size="sm" className="text-xs">
                  Guardar cambios
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        {/* Seguridad Tab */}
        <TabsContent value="seguridad" className="space-y-4">
          <Card className="p-6 max-w-2xl shadow-2xs text-xs space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <Shield className="h-5 w-5 text-neutral-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Seguridad a Nivel de Fila (RLS) Activa
                </h4>
                <p className="text-neutral-500 mt-0.5 leading-relaxed">
                  Las políticas de Supabase PostgreSQL restringen el acceso a los datos según el rol asignado al usuario autenticado (Admin, Manager, Analyst, Commercial, Accounting, Viewer).
                </p>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500">Autenticación Multifactor (MFA):</span>
                <Badge variant="outline">Soportado</Badge>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500">Cifrado en tránsito:</span>
                <span className="font-mono text-emerald-600">TLS 1.3</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-neutral-500">Registro de auditoría (audit_logs):</span>
                <span className="text-emerald-600 font-medium">Habilitado</span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
