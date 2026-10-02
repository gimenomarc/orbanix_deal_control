'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { useStore } from '@/hooks/useStore';
import { Shield, ArrowRight, AlertCircle, Lock } from 'lucide-react';
import { ROLE_DEFINITIONS } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const store = useStore();
  const { success, error: toastError } = useToast();

  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // If already authenticated, redirect straight to dashboard
  React.useEffect(() => {
    const user = store.getCurrentUser();
    if (user) {
      router.replace('/inicio');
    }
  }, [store, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const res = store.authenticate(identifier, password);
      setLoading(false);

      if (res.success && res.user) {
        const roleLabel = ROLE_DEFINITIONS[res.user.role]?.label || res.user.role;
        success(
          'Acceso Autorizado',
          `Bienvenido, ${res.user.first_name} ${res.user.last_name} (${roleLabel}).`
        );
        router.push('/inicio');
      } else {
        const msg = res.error || 'Credenciales incorrectas.';
        setErrorMessage(msg);
        toastError('Error de acceso', msg);
      }
    }, 250);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="flex items-baseline justify-center">
            <span className="text-3xl font-bold tracking-tight text-white">ORBANIX</span>
            <span className="text-3xl font-bold text-white">.</span>
          </div>
          <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase">
            DEAL CONTROL · ACCESO RESTRINGIDO
          </p>
        </div>

        {/* Login Box */}
        <Card className="border-neutral-800 bg-neutral-900 text-white shadow-2xl p-6">
          <CardHeader className="p-0 pb-4 text-center">
            <CardTitle className="text-base text-white">Control de Acceso al CRM</CardTitle>
            <CardDescription className="text-neutral-400 text-xs mt-1">
              Introduce tu usuario o correo corporativo y contraseña autorizada.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-4 pt-2">
            {errorMessage && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/50 border border-red-800/60 text-red-300 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Usuario o Correo corporativo
                </label>
                <Input
                  type="text"
                  required
                  placeholder="ej. mgimeno o tu@orbanixgroup.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Contraseña</label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 text-xs"
                />
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full bg-white text-neutral-900 hover:bg-neutral-200 text-xs font-semibold h-9 cursor-pointer"
              >
                <Lock className="mr-1.5 h-3.5 w-3.5 text-neutral-700" />
                Entrar en la plataforma
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </form>

            {/* Institutional Security Notice & DLP */}
            <div className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/60 text-[11px] text-neutral-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-neutral-300 font-semibold">
                <Shield className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Control de Seguridad Institucional & DLP</span>
              </div>
              <p className="text-neutral-400 leading-relaxed text-[11px]">
                Acceso restringido a operadores y analistas autorizados. Registro público deshabilitado: la gestión de credenciales y perfiles se administra internamente por la dirección.
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-neutral-500">
          ORBANIX Deal Control • Plataforma Institucional de Activos
        </p>
      </div>
    </div>
  );
}
