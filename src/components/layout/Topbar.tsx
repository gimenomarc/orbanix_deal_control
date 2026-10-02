'use client';

import * as React from 'react';
import {
  Menu,
  Search,
  Wifi,
  MessageSquare,
  HelpCircle,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { GlobalSearch } from './GlobalSearch';

interface TopbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const store = useStore();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const currentUser = store.getCurrentUser();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window !== 'undefined') {
      if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        setIsDarkMode(false);
      } else {
        document.documentElement.classList.add('dark');
        setIsDarkMode(true);
      }
    }
  };

  const notifications = store.getNotifications();
  const unreadCount = store.getUnreadNotificationsCount();

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-neutral-200 bg-white px-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 cursor-pointer"
            title="Alternar barra lateral"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-neutral-500 dark:text-neutral-400">
            <span className="text-neutral-800 dark:text-neutral-200">ORBANIX</span>
            <span>/</span>
            <span>DEAL CONTROL</span>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex h-8 items-center gap-2 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 cursor-pointer"
            title="Buscar en el CRM (Ctrl+K)"
          >
            <Search className="h-4 w-4" />
            <span className="hidden md:inline text-[11px] text-neutral-400">
              Buscar... <kbd className="ml-1 text-[10px] opacity-70">⌘K</kbd>
            </span>
          </button>

          {/* Connection Status indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-normal text-emerald-700 bg-emerald-50 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50">
            <Wifi className="h-3 w-3" />
            <span className="text-[11px]">Conectado</span>
          </div>

          {/* Messages / Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setIsMessagesOpen(!isMessagesOpen)}
              className="relative flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 cursor-pointer"
              title="Avisos y mensajes"
            >
              <MessageSquare className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[9px] font-bold text-white dark:bg-white dark:text-neutral-900">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {isMessagesOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-neutral-200 bg-white p-4 shadow-xl z-50 animate-in fade-in dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    Avisos del sistema
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => store.markAllNotificationsAsRead()}
                      className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
                    >
                      Marcar leídos
                    </button>
                  )}
                </div>
                <div className="mt-2 max-h-64 overflow-y-auto space-y-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800/50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                        {notif.title}
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {notif.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Help Button */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 cursor-pointer"
            title="Ayuda y documentación"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 cursor-pointer"
            title="Cambiar tema"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* User Profile Pill & Dropdown */}
          <div className="relative pl-1 border-l border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <div className="h-7 w-7 rounded-full bg-purple-950 text-purple-200 border border-purple-800/60 flex items-center justify-center text-[11px] font-bold">
                {currentUser.first_name[0]}{currentUser.last_name[0]}
              </div>
              <div className="hidden sm:block text-left pr-1">
                <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
                  {currentUser.first_name} {currentUser.last_name}
                </p>
                <p className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                  {currentUser.role === 'admin' ? 'Super Admin' : currentUser.role}
                </p>
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-neutral-200 bg-white p-3 shadow-xl z-50 animate-in fade-in dark:border-neutral-800 dark:bg-neutral-900">
                <div className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    {currentUser.first_name} {currentUser.last_name}
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                    @{currentUser.username || 'mgimeno'} · {currentUser.email}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {currentUser.role === 'admin' ? 'Super Administrador' : currentUser.role}
                  </span>
                </div>

                <div className="py-2 space-y-1 text-xs">
                  <a
                    href="/equipo"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    Gestión de Usuarios y Roles
                  </a>
                  <a
                    href="/configuracion"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    Configuración de Cuenta
                  </a>
                </div>

                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    onClick={() => {
                      store.logout();
                      window.location.href = '/login';
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-950/70 dark:text-red-400 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Dialog */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsHelpOpen(false)}
          />
          <div className="relative z-50 w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                ORBANIX Deal Control — Ayuda
              </h3>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
              <p>
                <strong>Búsqueda global:</strong> Pulsa <kbd className="px-1 border rounded">⌘K</kbd> o el icono de lupa para encontrar cualquier activo, cliente u operación al instante.
              </p>
              <p>
                <strong>Ramas de activos:</strong> Navega entre Open Market, Run Off, NPL e Institucional para filtros especializados.
              </p>
              <p>
                <strong>Importación masiva:</strong> Puedes cargar archivos CSV o Excel desde la sección <em>Importar cartera</em>.
              </p>
              <p>
                <strong>Soporte técnico:</strong> Contacta con el equipo de operaciones en <span className="font-mono text-neutral-900 dark:text-neutral-100">soporte@orbanixgroup.com</span>.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
