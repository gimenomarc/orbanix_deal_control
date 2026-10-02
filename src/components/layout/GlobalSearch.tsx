'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { Search, X, Building2, User, Briefcase, Target, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const router = useRouter();
  const store = useStore();
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // open handled by parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = store.globalSearch(query);
  const hasResults =
    results.clients.length > 0 ||
    results.assets.length > 0 ||
    results.operations.length > 0 ||
    results.leads.length > 0 ||
    results.owners.length > 0;

  const navigateTo = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative z-50 w-full max-w-2xl overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl animate-in zoom-in-95 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <Search className="h-5 w-5 text-neutral-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por referencia, cliente, activo, propietario, lead u operación..."
            className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-neutral-100"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="ml-2 hidden sm:inline-block rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[10px] font-medium text-neutral-400 dark:border-neutral-800 dark:bg-neutral-800">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          {!query && (
            <div className="py-8 text-center text-xs text-neutral-400">
              Escribe el nombre o referencia de cualquier elemento para buscar en el CRM.
            </div>
          )}

          {query && !hasResults && (
            <div className="py-8 text-center text-xs text-neutral-400">
              No se han encontrado resultados para &ldquo;{query}&rdquo;.
            </div>
          )}

          {/* Assets */}
          {results.assets.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Activos ({results.assets.length})
              </h4>
              <div className="space-y-1">
                {results.assets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => navigateTo(`/activos/${asset.branch}`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                            {asset.title}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">
                            {asset.reference}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500">
                          {asset.city} • {formatCurrency(asset.current_value)}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clients */}
          {results.clients.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Clientes ({results.clients.length})
              </h4>
              <div className="space-y-1">
                {results.clients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => navigateTo('/clientes')}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                            {client.legal_name}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">
                            {client.reference}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500">
                          {client.tax_id} • {client.city}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Operations */}
          {results.operations.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Operaciones ({results.operations.length})
              </h4>
              <div className="space-y-1">
                {results.operations.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => navigateTo('/operaciones')}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                            {op.title}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">
                            {op.reference}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500">
                          {formatCurrency(op.amount)} • Fase {op.phase}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Leads */}
          {results.leads.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Leads ({results.leads.length})
              </h4>
              <div className="space-y-1">
                {results.leads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => navigateTo('/leads')}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                        <Target className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                            {lead.name}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">
                            {lead.reference}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500">
                          {lead.company || lead.email} • Estado {lead.status}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
