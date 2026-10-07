'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { AppModule } from '@/types';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function getModuleFromPath(pathname: string): AppModule | null {
  if (pathname === '/inicio') return 'inicio';
  if (pathname.startsWith('/investment')) return 'investment';
  if (pathname.startsWith('/objetivos')) return 'objetivos';
  if (pathname.startsWith('/prescripciones')) return 'prescripciones';
  if (pathname.startsWith('/reporting')) return 'reporting';
  if (pathname.startsWith('/equipo')) return 'equipo';
  if (pathname.startsWith('/agenda')) return 'agenda';
  if (pathname.startsWith('/colaboradores')) return 'colaboradores';
  if (pathname.startsWith('/contabilidad')) return 'contabilidad';
  if (pathname.startsWith('/avisos')) return 'avisos';
  if (pathname.startsWith('/leads')) return 'leads';
  if (pathname.startsWith('/clientes')) return 'clientes';
  if (pathname.startsWith('/operaciones')) return 'operaciones';
  if (pathname.startsWith('/pbc')) return 'pbc';
  if (pathname.startsWith('/activos')) return 'activos';
  if (pathname.startsWith('/propietarios')) return 'propietarios';
  if (pathname.startsWith('/importaciones')) return 'importaciones';
  if (pathname.startsWith('/configuracion')) return 'configuracion';
  return null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const store = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isAuthorized, setIsAuthorized] = React.useState<boolean | null>(null);

  const currentUser = store.getCurrentUser();

  React.useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [currentUser, router]);

  if (isAuthorized !== true || !currentUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-neutral-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          <span className="text-xs text-neutral-400 font-medium">Verificando autorización...</span>
        </div>
      </div>
    );
  }

  // Check if current user role has permission to access the current route module
  const currentModule = getModuleFromPath(pathname);
  const hasAccess = currentModule ? store.hasModuleAccess(currentUser.role, currentModule) : true;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-50 dark:bg-neutral-950 font-sans">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {hasAccess ? (
              children
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-4">
                  <ShieldAlert className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Acceso Restringido por Política de Rol
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 max-w-md">
                  Tu perfil actual (<span className="font-semibold text-purple-600 dark:text-purple-400">{currentUser.role}</span>) no cuenta con autorización para visualizar el módulo <span className="font-mono font-medium text-neutral-800 dark:text-neutral-200">{currentModule}</span>.
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 max-w-md">
                  Para habilitar el acceso a esta sección, contacta con un Super Administrador (Marc Gimeno o Astrid Gracia).
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <Link
                    href="/inicio"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors shadow-xs"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Volver a Inicio
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
