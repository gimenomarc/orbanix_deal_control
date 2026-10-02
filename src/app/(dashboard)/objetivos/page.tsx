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
import { Card, CardContent } from '@/components/ui/Card';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils';
import { Plus, Target, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Objective } from '@/types';

export default function ObjetivosPage() {
  const store = useStore();
  const { success } = useToast();

  const objectives = store.getObjectives();
  const profiles = store.getProfiles();

  const [periodFilter, setPeriodFilter] = React.useState('todos');
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form state
  const [formTitle, setFormTitle] = React.useState('');
  const [formUserName, setFormUserName] = React.useState('Equipo Inversión');
  const [formPeriod, setFormPeriod] = React.useState<'mensual' | 'trimestral' | 'anual'>('trimestral');
  const [formPeriodLabel, setFormPeriodLabel] = React.useState('Q4 2026');
  const [formTarget, setFormTarget] = React.useState(10000000);
  const [formCurrent, setFormCurrent] = React.useState(6500000);
  const [formUnit, setFormUnit] = React.useState<'eur' | 'operaciones' | 'captaciones' | 'visitas'>('eur');

  const filtered = objectives.filter(
    (o) => periodFilter === 'todos' || o.period === periodFilter
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formTarget) return;

    const pct = (formCurrent / formTarget) * 100;

    store.addObjective({
      title: formTitle,
      user_name: formUserName,
      period: formPeriod,
      period_label: formPeriodLabel,
      target_value: Number(formTarget),
      current_value: Number(formCurrent),
      percentage: pct,
      unit: formUnit,
      status: pct >= 100 ? 'alcanzado' : pct < 50 ? 'riesgo' : 'en_progreso',
    });

    setIsModalOpen(false);
    setFormTitle('');
    success('Objetivo registrado', 'El objetivo ha sido añadido al panel de seguimiento.');
  };

  const formatValue = (val: number, unit: Objective['unit']) => {
    if (unit === 'eur') return formatCurrency(val);
    return `${formatNumber(val)} ${unit}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Rendimiento & KPIs"
        title="Objetivos"
        description="Fijación y seguimiento de metas comerciales por equipo, analista y período temporal."
        actions={
          <Button size="sm" onClick={() => setIsModalOpen(true)} className="text-xs">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nuevo objetivo
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <div className="flex items-center gap-3">
          {['todos', 'mensual', 'trimestral', 'anual'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriodFilter(p)}
              className={`text-xs font-semibold capitalize pb-2 border-b-2 cursor-pointer ${
                periodFilter === p
                  ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Objectives Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((obj) => (
          <Card key={obj.id} className="p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <Badge variant="outline" className="text-[10px]">
                  {obj.period_label}
                </Badge>
                <Badge
                  variant={
                    obj.status === 'alcanzado'
                      ? 'success'
                      : obj.status === 'riesgo'
                      ? 'destructive'
                      : 'warning'
                  }
                  className="text-[10px] capitalize"
                >
                  {obj.status.replace('_', ' ')}
                </Badge>
              </div>

              <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 mt-2">
                {obj.title}
              </h3>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Asignado a: <strong className="text-neutral-700 dark:text-neutral-300">{obj.user_name}</strong>
              </p>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  {formatValue(obj.current_value, obj.unit)}
                </span>
                <span className="text-neutral-400">
                  Meta: {formatValue(obj.target_value, obj.unit)}
                </span>
              </div>

              <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    obj.percentage >= 100
                      ? 'bg-emerald-600'
                      : obj.percentage < 50
                      ? 'bg-rose-500'
                      : 'bg-neutral-900 dark:bg-neutral-100'
                  }`}
                  style={{ width: `${Math.min(obj.percentage, 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] pt-1">
                <span className="text-neutral-500 font-medium">Progreso alcanzado</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  {formatPercent(obj.percentage)}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* New Objective Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nuevo Objetivo Comercial"
        description="Fija una meta cuantitativa para el equipo o gestor."
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1">Título del Objetivo *</label>
            <Input
              type="text"
              required
              placeholder="Ej: Captación de carteras Q4"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Responsable / Equipo</label>
              <Input
                type="text"
                value={formUserName}
                onChange={(e) => setFormUserName(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Periodo</label>
              <Select
                value={formPeriod}
                onChange={(e) => setFormPeriod(e.target.value as any)}
              >
                <option value="mensual">Mensual</option>
                <option value="trimestral">Trimestral</option>
                <option value="anual">Anual</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Etiqueta de Periodo</label>
              <Input
                type="text"
                placeholder="Ej: Q4 2026"
                value={formPeriodLabel}
                onChange={(e) => setFormPeriodLabel(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Unidad de Medida</label>
              <Select
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value as any)}
              >
                <option value="eur">Euros (€)</option>
                <option value="operaciones">Operaciones</option>
                <option value="captaciones">Captaciones</option>
                <option value="visitas">Visitas</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Valor Objetivo (Meta) *</label>
              <Input
                type="number"
                required
                value={formTarget}
                onChange={(e) => setFormTarget(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Valor Actual</label>
              <Input
                type="number"
                value={formCurrent}
                onChange={(e) => setFormCurrent(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar objetivo</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
