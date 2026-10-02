'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { useStore } from '@/hooks/useStore';
import { Shield, ArrowRight, Lock, UserCheck, AlertCircle } from 'lucide-react';
import { ROLE_DEFINITIONS } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const store = useStore();
  const { success, error: toastError } = useToast();

  const [identifier, setIdentifier] = React.useState('mgimeno');
  const [password, setPassword] = React.useState('mgimeno');
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

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
    }, 300);
  };

  const handleQuickLogin = (userLogin: string, userPass: string) => {
    setIdentifier(userLogin);
    setPassword(userPass);
    setLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const res = store.authenticate(userLogin, userPass);
      setLoading(false);

      if (res.success && res.user) {
        const roleLabel = ROLE_DEFINITIONS[res.user.role]?.label || res.user.role;
        success(
          'Acceso Autorizado',
          `Sesión iniciada como ${res.user.first_name} ${res.user.last_name} (${roleLabel}).`
        );
        router.push('/inicio');
      } else {
        toastError('Error de acceso', res.error || 'Credenciales inválidas');
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
                  placeholder="Contraseña"
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
                Entrar en la plataforma
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </form>

            {/* Institutional Security Notice */}
            <div className="p-2.5 rounded-lg bg-neutral-800/40 border border-neutral-800 text-[11px] text-neutral-400 flex items-start gap-2">
              <Shield className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                <strong>Sin registro público:</strong> Por política de seguridad institucional, las altas de usuario y asignaciones de perfil se realizan <em>exclusivamente desde dentro</em> por un Administrador.
              </p>
            </div>

            {/* Quick Testing Access */}
            <div className="pt-4 border-t border-neutral-800 space-y-2">
              <p className="text-[11px] text-neutral-400 text-center font-medium">
                Cuentas de prueba para testear:
              </p>

              {/* Main Admin: Marc Gimeno */}
              <button
                type="button"
                onClick={() => handleQuickLogin('mgimeno', 'mgimeno')}
                className="w-full p-2.5 rounded-lg bg-purple-950/40 hover:bg-purple-950/70 border border-purple-800/50 text-[11px] text-left transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <strong className="block text-purple-200 font-semibold">
                    Marc Gimeno Cervantes · @mgimeno
                  </strong>
                  <span className="text-purple-300/80">Super Administrador (Acceso Total)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-800/40 text-purple-200 border border-purple-700/50 font-mono">
                  pass: mgimeno
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('lserrano', 'orbanix2026!')}
                  className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 text-[11px] text-neutral-300 text-left border border-neutral-700/60 transition-colors cursor-pointer"
                >
                  <strong className="block text-white">Lucía Serrano</strong>
                  Gestor Inmobiliario
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('cgomez', 'orbanix2026!')}
                  className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 text-[11px] text-neutral-300 text-left border border-neutral-700/60 transition-colors cursor-pointer"
                >
                  <strong className="block text-white">Carlos Gómez</strong>
                  Analista de Inversiones
                </button>
              </div>
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
