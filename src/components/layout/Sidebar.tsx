'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  LayoutGrid,
  Target,
  Clock,
  BarChart3,
  Users,
  Calendar,
  Handshake,
  Wallet,
  Bell,
  Megaphone,
  User,
  Briefcase,
  ShieldCheck,
  Building2,
  RefreshCw,
  FileWarning,
  Landmark,
  FolderKanban,
  FileUp,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useStore } from '@/hooks/useStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const store = useStore();
  const user = store.getCurrentUser();

  const handleLogout = () => {
    store.logout();
    router.push('/login');
  };

  const primaryNav = [
    { module: 'investment' as const, label: 'Investment', href: '/investment', icon: TrendingUp },
    { module: 'inicio' as const, label: 'Inicio', href: '/inicio', icon: LayoutGrid },
    { module: 'objetivos' as const, label: 'Objetivos', href: '/objetivos', icon: Target },
    { module: 'prescripciones' as const, label: 'Prescripciones', href: '/prescripciones', icon: Clock },
    { module: 'reporting' as const, label: 'Reporting', href: '/reporting', icon: BarChart3 },
    { module: 'equipo' as const, label: 'Equipo', href: '/equipo', icon: Users },
    { module: 'agenda' as const, label: 'Agenda', href: '/agenda', icon: Calendar },
    { module: 'colaboradores' as const, label: 'Colaboradores', href: '/colaboradores', icon: Handshake },
    { module: 'contabilidad' as const, label: 'Contabilidad', href: '/contabilidad', icon: Wallet },
    { module: 'avisos' as const, label: 'Avisos', href: '/avisos', icon: Bell },
    { module: 'leads' as const, label: 'Leads', href: '/leads', icon: Megaphone },
  ];

  const gestionNav = [
    { module: 'clientes' as const, label: 'Clientes', href: '/clientes', icon: User },
    { module: 'operaciones' as const, label: 'Operaciones', href: '/operaciones', icon: Briefcase },
    { module: 'pbc' as const, label: 'PBC', href: '/pbc', icon: ShieldCheck },
  ];

  const activosNav = [
    { module: 'activos' as const, label: 'Open Market', href: '/activos/open_market', icon: Building2 },
    { module: 'activos' as const, label: 'Run Off', href: '/activos/run_off', icon: RefreshCw },
    { module: 'activos' as const, label: 'NPL', href: '/activos/npl', icon: FileWarning },
    { module: 'activos' as const, label: 'Institucional', href: '/activos/institutional', icon: Landmark },
  ];

  const footerNav = [
    { module: 'propietarios' as const, label: 'Propietarios y carteras', href: '/propietarios', icon: FolderKanban },
    { module: 'importaciones' as const, label: 'Importar cartera', href: '/importaciones', icon: FileUp },
    { module: 'configuracion' as const, label: 'Configuración', href: '/configuracion', icon: Settings },
  ];

  const userRole = user?.role || 'viewer';

  const visiblePrimaryNav = primaryNav.filter((item) => store.hasModuleAccess(userRole, item.module));
  const visibleGestionNav = gestionNav.filter((item) => store.hasModuleAccess(userRole, item.module));
  const visibleActivosNav = store.hasModuleAccess(userRole, 'activos') ? activosNav : [];
  const visibleFooterNav = footerNav.filter((item) => store.hasModuleAccess(userRole, item.module));

  const renderNavItem = (item: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }) => {
    const isActive = pathname === item.href || (item.href !== '/inicio' && pathname.startsWith(item.href));
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => {
          if (window.innerWidth < 1024) onClose();
        }}
        className={cn(
          'flex items-center gap-3 px-3 py-1.5 text-xs font-normal rounded-md transition-colors select-none group',
          isActive
            ? 'bg-[#1e2229] text-white font-medium'
            : 'text-[#94a3b8] hover:text-white hover:bg-[#15181e]'
        )}
      >
        <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-[#828c9b] group-hover:text-white')} />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0c0d0f] text-[#94a3b8] transition-transform duration-200 ease-in-out border-r border-[#1a1e24] lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div>
            <div className="flex items-baseline">
              <span className="text-lg font-bold tracking-tight text-white">ORBANIX</span>
              <span className="text-lg font-bold text-white">.</span>
            </div>
            <p className="text-[10px] font-medium tracking-widest text-[#717b8a] uppercase -mt-0.5">
              DEAL CONTROL
            </p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-[#828c9b] hover:text-white p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
          {/* Primer Grupo */}
          {visiblePrimaryNav.length > 0 && (
            <div className="space-y-0.5">
              {visiblePrimaryNav.map(renderNavItem)}
            </div>
          )}

          {/* Grupo: GESTIÓN */}
          {visibleGestionNav.length > 0 && (
            <div>
              <p className="px-3 pb-1.5 text-[10px] font-bold tracking-wider text-[#525b6a] uppercase">
                GESTIÓN
              </p>
              <div className="space-y-0.5">
                {visibleGestionNav.map(renderNavItem)}
              </div>
            </div>
          )}

          {/* Grupo: ACTIVOS */}
          {visibleActivosNav.length > 0 && (
            <div>
              <p className="px-3 pb-1.5 text-[10px] font-bold tracking-wider text-[#525b6a] uppercase">
                ACTIVOS
              </p>
              <div className="space-y-0.5 pl-1 border-l border-[#1a1e24] ml-2">
                {visibleActivosNav.map(renderNavItem)}
              </div>
            </div>
          )}

          {/* Separator / Footer Navigation */}
          {visibleFooterNav.length > 0 && (
            <div className="pt-2 border-t border-[#1a1e24] space-y-0.5">
              {visibleFooterNav.map(renderNavItem)}
            </div>
          )}
        </div>

        {/* User Block & Logout */}
        <div className="border-t border-[#1a1e24] p-3">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#14171d]/60 mb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-full bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-[10px] font-bold text-purple-200 shrink-0">
                {user?.first_name?.[0] || 'O'}{user?.last_name?.[0] || 'X'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user ? `${user.first_name} ${user.last_name}` : 'Usuario'}
                </p>
                <p className="text-[10px] text-purple-300/80 truncate capitalize">
                  {user?.role === 'admin' ? 'Super Admin' : (user?.role || 'Usuario')} · @{user?.username || 'usuario'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs text-[#828c9b] hover:text-white hover:bg-[#15181e] rounded-md transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
