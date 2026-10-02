'use client';

import * as React from 'react';
import { useStore } from '@/hooks/useStore';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Download, BarChart3, TrendingUp, PieChart, Activity, Layers } from 'lucide-react';

export default function ReportingPage() {
  const store = useStore();
  const { success } = useToast();

  const assets = store.getAssets();
  const operations = store.getOperations();
  const leads = store.getLeads();
  const accounting = store.getAccounting();

  const [period, setPeriod] = React.useState('Q4 2026');

  // Metrics
  const totalVolumeInAssets = assets.reduce((acc, curr) => acc + curr.current_value, 0);
  const totalDealsVolume = operations.reduce((acc, curr) => acc + curr.amount, 0);
  const totalWonVolume = operations
    .filter((o) => o.phase === 'completada' || o.status === 'ganada')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const conversionRate = leads.length > 0 ? (leads.filter((l) => l.status === 'convertido').length / leads.length) * 100 : 0;

  // Breakdown by branch
  const branchBreakdown = [
    { name: 'Open Market', value: assets.filter((a) => a.branch === 'open_market').reduce((a, c) => a + c.current_value, 0) },
    { name: 'Run Off', value: assets.filter((a) => a.branch === 'run_off').reduce((a, c) => a + c.current_value, 0) },
    { name: 'NPL', value: assets.filter((a) => a.branch === 'npl').reduce((a, c) => a + c.current_value, 0) },
    { name: 'Institucional', value: assets.filter((a) => a.branch === 'institutional').reduce((a, c) => a + c.current_value, 0) },
  ];

  // Pipeline by phase
  const phases = ['nueva', 'analisis', 'propuesta', 'negociacion', 'documentacion', 'cierre'];
  const pipelineBreakdown = phases.map((phase) => ({
    phase,
    count: operations.filter((o) => o.phase === phase).length,
    volume: operations.filter((o) => o.phase === phase).reduce((a, c) => a + c.amount, 0),
  }));

  const handleExport = () => {
    success('Informe Exportado', 'Se ha generado el resumen ejecutivo en formato CSV.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Analítica & Inteligencia de Negocio"
        title="Reporting"
        description="Métricas de ejecución comercial, distribución de cartera y ratios de conversión."
        actions={
          <div className="flex items-center gap-2">
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-xs h-9 w-36"
            >
              <option value="Octubre 2026">Octubre 2026</option>
              <option value="Q4 2026">Q4 2026</option>
              <option value="Año 2026">Año 2026</option>
            </Select>
            <Button variant="outline" size="sm" onClick={handleExport} className="text-xs">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Exportar Informe
            </Button>
          </div>
        }
      />

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Volumen Global Inventariado</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {formatCurrency(totalVolumeInAssets)}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Pipeline Activo en Negociación</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {formatCurrency(totalDealsVolume)}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Tasa de Conversión de Leads</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {formatPercent(conversionRate)}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Comisiones Facturadas</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {formatCurrency(accounting.filter((t) => t.type === 'ingreso').reduce((a, c) => a + c.amount, 0))}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution by Branch */}
        <Card className="shadow-2xs">
          <CardHeader className="pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <CardTitle className="text-sm">Distribución de Cartera por Rama</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {branchBreakdown.map((item) => {
              const pct = totalVolumeInAssets > 0 ? (item.value / totalVolumeInAssets) * 100 : 0;
              return (
                <div key={item.name} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">{item.name}</span>
                    <span className="text-neutral-500">
                      {formatCurrency(item.value)} ({formatPercent(pct)})
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-neutral-900 dark:bg-neutral-100 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Pipeline Distribution by Phase */}
        <Card className="shadow-2xs">
          <CardHeader className="pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <CardTitle className="text-sm">Embudo Transaccional por Fase</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {pipelineBreakdown.map((item) => {
              const maxVol = Math.max(...pipelineBreakdown.map((p) => p.volume), 1);
              const pct = (item.volume / maxVol) * 100;
              return (
                <div key={item.phase} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize text-neutral-800 dark:text-neutral-200">
                      {item.phase} ({item.count})
                    </span>
                    <span className="text-neutral-500 font-medium">
                      {formatCurrency(item.volume)}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
