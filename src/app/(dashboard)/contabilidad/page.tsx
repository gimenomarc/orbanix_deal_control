'use client';

import * as React from 'react';
import { useStore } from '@/hooks/useStore';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { AccountingTransaction } from '@/types';

export default function ContabilidadPage() {
  const store = useStore();
  const { success, error } = useToast();

  const transactions = store.getAccounting();
  const operations = store.getOperations();

  const [typeFilter, setTypeFilter] = React.useState('todos');

  // Modal
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [formType, setFormType] = React.useState<'ingreso' | 'gasto'>('ingreso');
  const [formCategory, setFormCategory] = React.useState<AccountingTransaction['category']>('comision');
  const [formConcept, setFormConcept] = React.useState('');
  const [formAmount, setFormAmount] = React.useState(15000);
  const [formDate, setFormDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [formStatus, setFormStatus] = React.useState<AccountingTransaction['status']>('cobrado');
  const [formInvoice, setFormInvoice] = React.useState('');

  const filtered = transactions.filter((t) => {
    return typeFilter === 'todos' || t.type === typeFilter;
  });

  const totalIngresos = transactions
    .filter((t) => t.type === 'ingreso' && t.status !== 'anulado')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalGastos = transactions
    .filter((t) => t.type === 'gasto' && t.status !== 'anulado')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const margenNeto = totalIngresos - totalGastos;

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formConcept || !formAmount) return;

    const created = store.addTransaction({
      type: formType,
      category: formCategory,
      concept: formConcept,
      amount: Number(formAmount),
      date: formDate,
      status: formStatus,
      invoice_number: formInvoice,
    });

    setIsModalOpen(false);
    setFormConcept('');
    setFormInvoice('');
    success('Movimiento registrado', `Asiento ${created.reference} guardado.`);
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      error('Sin datos', 'No hay movimientos para exportar.');
      return;
    }
    const headers = ['Referencia', 'Tipo', 'Categoría', 'Concepto', 'Importe (€)', 'Fecha', 'Estado', 'Nº Factura'];
    const rows = filtered.map((t) => [
      t.reference,
      t.type,
      t.category,
      `"${t.concept.replace(/"/g, '""')}"`,
      t.amount,
      t.date,
      t.status,
      t.invoice_number || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orbanix_contabilidad_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Exportación completada', 'CSV contable descargado.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Finanzas & Tesorería"
        title="Contabilidad"
        description="Control de facturación, comisiones de éxito, honorarios de asesoramiento y gastos operativos."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Exportar
            </Button>
            <Button size="sm" onClick={() => setIsModalOpen(true)} className="text-xs">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Nuevo movimiento
            </Button>
          </div>
        }
      />

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Ingresos Totales (Comisiones)</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {formatCurrency(totalIngresos)}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Gastos Directos & DD</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {formatCurrency(totalGastos)}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Margen Operativo Bruto</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {formatCurrency(margenNeto)}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-2">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs h-9 w-40"
          >
            <option value="todos">Todos los tipos</option>
            <option value="ingreso">Solo Ingresos</option>
            <option value="gasto">Solo Gastos</option>
          </Select>
        </div>

        <span className="text-xs text-neutral-500">
          {filtered.length} movimientos registrados
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/80">
              <tr>
                <th className="py-3 px-4">Referencia</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Concepto / Descripción</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Nº Factura</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-neutral-900 dark:text-neutral-100">
                    {item.reference}
                  </td>
                  <td className="py-3.5 px-4 text-neutral-500">
                    {formatDate(item.date)}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-neutral-100">
                    {item.concept}
                  </td>
                  <td className="py-3.5 px-4 capitalize text-neutral-600 dark:text-neutral-400">
                    {item.category}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-neutral-500">
                    {item.invoice_number || '-'}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        item.status === 'cobrado' || item.status === 'pagado'
                          ? 'success'
                          : 'warning'
                      }
                      className="text-[10px] capitalize"
                    >
                      {item.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold">
                    <span
                      className={
                        item.type === 'ingreso'
                          ? 'text-emerald-600'
                          : 'text-neutral-900 dark:text-neutral-100'
                      }
                    >
                      {item.type === 'ingreso' ? '+' : '-'}
                      {formatCurrency(item.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nuevo Movimiento Contable"
        description="Registra un cobro de comisión o gasto de operación."
        maxWidth="md"
      >
        <form onSubmit={handleCreateTransaction} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Tipo de Movimiento</label>
              <Select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
              >
                <option value="ingreso">Ingreso (+)</option>
                <option value="gasto">Gasto (-)</option>
              </Select>
            </div>
            <div>
              <label className="block font-medium mb-1">Categoría</label>
              <Select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
              >
                <option value="comision">Comisión de éxito</option>
                <option value="honorarios">Honorarios de gestión</option>
                <option value="tasacion">Tasación / Due Diligence</option>
                <option value="notaria">Notaría y Registro</option>
                <option value="marketing">Marketing y Portales</option>
                <option value="otros">Otros</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Concepto *</label>
            <Input
              type="text"
              required
              placeholder="Ej: Honorarios intermediación Edificio Santa Engracia"
              value={formConcept}
              onChange={(e) => setFormConcept(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Importe (€) *</label>
              <Input
                type="number"
                required
                value={formAmount}
                onChange={(e) => setFormAmount(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Fecha *</label>
              <Input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Nº Factura</label>
              <Input
                type="text"
                placeholder="FRA-2026-001"
                value={formInvoice}
                onChange={(e) => setFormInvoice(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Estado</label>
              <Select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
              >
                <option value="cobrado">Cobrado</option>
                <option value="pagado">Pagado</option>
                <option value="pendiente">Pendiente</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar movimiento</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
