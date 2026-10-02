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
import { CheckCircle2, Wifi, Shield, Building, RefreshCw } from 'lucide-react';

export default function ConfiguracionPage() {
  const store = useStore();
  const { success } = useToast();

  const connections = store.getSystemConnections();

  const [companyName, setCompanyName] = React.useState('ORBANIX GROUP');
  const [companyTaxId, setCompanyTaxId] = React.useState('B-88990011');
  const [companyAddress, setCompanyAddress] = React.useState('Paseo de la Castellana 95, Madrid');
  const [companyEmail, setCompanyEmail] = React.useState('contacto@orbanixgroup.com');

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    success('Configuración guardada', 'Los datos corporativos se han actualizado.');
  };

  const handleToggleConnection = (id: string, currentStatus: string) => {
    const nextStatus =
      currentStatus === 'Conectado' ? 'Pendiente' : currentStatus === 'Pendiente' ? 'Sin conexión' : 'Conectado';
    store.updateSystemConnection(id, nextStatus as any);
    success('Estado de conexión actualizado', `Servicio actualizado a ${nextStatus}.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Administración del Sistema"
        title="Configuración"
        description="Parámetros de empresa, conexiones de infraestructura y servicios externos."
      />

      <Tabs defaultValue="conexiones" onValueChange={() => {}} value="conexiones">
        <TabsList className="mb-4">
          <TabsTrigger value="conexiones">Conexiones y servicios</TabsTrigger>
          <TabsTrigger value="empresa">Empresa & Marca</TabsTrigger>
          <TabsTrigger value="seguridad">Seguridad & RLS</TabsTrigger>
        </TabsList>

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
