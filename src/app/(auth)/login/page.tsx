'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { Shield, ArrowRight, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { success } = useToast();

  const [email, setEmail] = React.useState('admin@orbanixgroup.com');
  const [password, setPassword] = React.useState('••••••••••••');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      success('Sesión iniciada', 'Bienvenido a ORBANIX Deal Control.');
      router.push('/inicio');
    }, 600);
  };

  const handleDemoLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('orbanix2026!');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      success('Acceso autorizado', `Sesión iniciada como ${roleEmail}.`);
      router.push('/inicio');
    }, 400);
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
            DEAL CONTROL
          </p>
        </div>

        {/* Login Box */}
        <Card className="border-neutral-800 bg-neutral-900 text-white shadow-2xl p-6">
          <CardHeader className="p-0 pb-4 text-center">
            <CardTitle className="text-base text-white">Iniciar Sesión en el CRM</CardTitle>
            <CardDescription className="text-neutral-400 text-xs mt-1">
              Introduce tus credenciales para acceder a la gestión de activos y operaciones.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-4 pt-2">
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Correo electrónico
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-neutral-300 font-medium">Contraseña</label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] text-neutral-400 hover:text-white"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 text-xs"
                />
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full bg-white text-neutral-900 hover:bg-neutral-200 text-xs font-semibold h-9"
              >
                Entrar en la plataforma
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </form>

            {/* Quick Demo Access */}
            <div className="pt-4 border-t border-neutral-800 space-y-2">
              <p className="text-[11px] text-neutral-400 text-center font-medium">
                Acceso Rápido de Prueba (Demo):
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin@orbanixgroup.com')}
                  className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 text-[11px] text-neutral-300 text-left border border-neutral-700/60 transition-colors cursor-pointer"
                >
                  <strong className="block text-white">Administrador</strong>
                  Acceso completo
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('lserrano@orbanixgroup.com')}
                  className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 text-[11px] text-neutral-300 text-left border border-neutral-700/60 transition-colors cursor-pointer"
                >
                  <strong className="block text-white">Gestor / Manager</strong>
                  Activos & Operaciones
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-neutral-500">
          ORBANIX Deal Control • Entorno seguro institucional
        </p>
      </div>
    </div>
  );
}
