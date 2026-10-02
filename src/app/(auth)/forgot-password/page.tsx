'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { success } = useToast();
  const [email, setEmail] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    success('Instrucciones enviadas', 'Revisa tu correo para restablecer la contraseña.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <div className="flex items-baseline justify-center">
            <span className="text-3xl font-bold tracking-tight text-white">ORBANIX</span>
            <span className="text-3xl font-bold text-white">.</span>
          </div>
          <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase">
            DEAL CONTROL
          </p>
        </div>

        <Card className="border-neutral-800 bg-neutral-900 text-white shadow-2xl p-6">
          <CardHeader className="p-0 pb-4 text-center">
            <CardTitle className="text-base text-white">Recuperar Acceso</CardTitle>
            <CardDescription className="text-neutral-400 text-xs mt-1">
              Introduce tu correo para recibir un enlace de restablecimiento seguro.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-4 pt-2">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Correo electrónico
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="usuario@orbanixgroup.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-white text-neutral-900 hover:bg-neutral-200 text-xs font-semibold h-9"
                >
                  Enviar enlace de recuperación
                </Button>
              </form>
            ) : (
              <div className="p-4 rounded-lg bg-neutral-800/60 text-center space-y-2 text-xs">
                <Mail className="h-8 w-8 text-neutral-300 mx-auto" />
                <p className="font-semibold text-white">Revisa tu bandeja de entrada</p>
                <p className="text-neutral-400">
                  Hemos enviado las instrucciones a <strong>{email}</strong>.
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-neutral-800 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-xs text-neutral-400 hover:text-white"
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Volver al inicio de sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
