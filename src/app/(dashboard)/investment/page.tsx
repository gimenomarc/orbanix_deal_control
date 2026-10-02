'use client';

import * as React from 'react';
import { useStore } from '@/hooks/useStore';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils';
import { Plus, TrendingUp, Search, Calendar, Target, CheckCircle2, ChevronRight } from 'lucide-react';
import { AssetBranch, AssetPhase, InvestmentAnalysis } from '@/types';

export default function InvestmentPage() {
  const store = useStore();
  const { success } = useToast();

  const assets = store.getAssets();
  const analyses = store.getInvestmentAnalyses();

  // Filters
  const [searchTerm, setSearchTerm] = React.useState('');
  const [branchFilter, setBranchFilter] = React.useState<string>('todos');
  const [phaseFilter, setPhaseFilter] = React.useState<string>('todos');

  // Modal state
  const [isNewAnalysisOpen, setIsNewAnalysisOpen] = React.useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = React.useState<InvestmentAnalysis | null>(null);

  // Form state
  const [formAssetId, setFormAssetId] = React.useState('');
  const [formTitle, setFormTitle] = React.useState('');
  const [formThesis, setFormThesis] = React.useState('');
  const [formAssumptions, setFormAssumptions] = React.useState('');
  const [formBaseCase, setFormBaseCase] = React.useState('');
  const [formUpsideCase, setFormUpsideCase] = React.useState('');
  const [formDownsideCase, setFormDownsideCase] = React.useState('');
  const [formReturn, setFormReturn] = React.useState(20);
  const [formIrr, setFormIrr] = React.useState(15);
  const [formMultiple, setFormMultiple] = React.useState(1.4);
  const [formInvestmentAmount, setFormInvestmentAmount] = React.useState(5000000);
  const [formTargetExitValue, setFormTargetExitValue] = React.useState(7000000);
  const [formTargetExitDate, setFormTargetExitDate] = React.useState('2028-12-31');
  const [formRisks, setFormRisks] = React.useState('');
  const [formOpportunities, setFormOpportunities] = React.useState('');
  const [formRecommendation, setFormRecommendation] = React.useState<'comprar' | 'analizar' | 'descartar' | 'mantener'>('comprar');

  // Filter analyses
  const filteredAnalyses = analyses.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.asset_title && a.asset_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.asset_reference && a.asset_reference.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesBranch = branchFilter === 'todos' || a.branch === branchFilter;
    const matchesPhase = phaseFilter === 'todos' || a.phase === phaseFilter;

    return matchesSearch && matchesBranch && matchesPhase;
  });

  const handleOpenNewModal = () => {
    if (assets.length > 0) {
      setFormAssetId(assets[0].id);
      setFormTitle(`Análisis de inversión: ${assets[0].title}`);
      setFormInvestmentAmount(assets[0].current_value);
      setFormTargetExitValue(Math.round(assets[0].current_value * 1.35));
    }
    setIsNewAnalysisOpen(true);
  };

  const handleCreateAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find((a) => a.id === formAssetId);
    if (!asset) return;

    store.addInvestmentAnalysis({
      asset_id: asset.id,
      asset_reference: asset.reference,
      asset_title: asset.title,
      title: formTitle,
      thesis: formThesis || 'Tesis de inversión orientada a captura de valor y estabilización de rentas.',
      assumptions: formAssumptions || 'Período de tenencia de 36 a 48 meses con capex moderado.',
      base_case: formBaseCase || 'Salida a yields de mercado con rentabilidad bruta objetivo.',
      upside_case: formUpsideCase || 'Aceleración de desinversión con prima del 15% sobre NAV.',
      downside_case: formDownsideCase || 'Incremento de costes de financiación y dilatación de salida.',
      expected_return: Number(formReturn),
      expected_irr: Number(formIrr),
      expected_multiple: Number(formMultiple),
      investment_amount: Number(formInvestmentAmount),
      target_exit_value: Number(formTargetExitValue),
      target_exit_date: formTargetExitDate,
      risks: formRisks || 'Riesgo de absorción del mercado y plazos de licencia.',
      opportunities: formOpportunities || 'Optimización de superficies y mejora de calificación energética.',
      recommendation: formRecommendation,
      status: 'aprobado',
      branch: asset.branch,
      phase: asset.phase,
    });

    setIsNewAnalysisOpen(false);
    success('Análisis registrado', 'La oportunidad de inversión se ha guardado correctamente.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        category="Análisis de Inversión"
        title="Investment"
        description="Oportunidades sobre el inventario del CRM. Hipótesis, escenarios y decisiones vinculados a cada activo."
        actions={
          <Button onClick={handleOpenNewModal} className="text-xs px-3">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nuevo análisis
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Buscar por activo o referencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs h-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="text-xs h-9 w-40"
          >
            <option value="todos">Todas las ramas</option>
            <option value="open_market">Open Market</option>
            <option value="run_off">Run Off</option>
            <option value="npl">NPL</option>
            <option value="institutional">Institucional</option>
          </Select>

          <Select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="text-xs h-9 w-40"
          >
            <option value="todos">Todas las fases</option>
            <option value="originacion">Originación</option>
            <option value="analisis">Análisis</option>
            <option value="comercializacion">Comercialización</option>
            <option value="negociacion">Negociación</option>
            <option value="operacion">Operación</option>
            <option value="cierre">Cierre</option>
          </Select>
        </div>
      </div>

      {/* Analyses List */}
      {filteredAnalyses.length === 0 ? (
        <EmptyState
          title="No hay análisis en esta selección"
          description="Selecciona un activo existente para comenzar o amplía los filtros de búsqueda."
          actionLabel="Crear nuevo análisis"
          onAction={handleOpenNewModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAnalyses.map((analysis) => (
            <Card
              key={analysis.id}
              className="flex flex-col justify-between hover:border-neutral-400 transition-colors shadow-2xs"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="font-mono text-[10px] uppercase">
                        {analysis.branch || 'open_market'}
                      </Badge>
                      <Badge
                        variant={
                          analysis.recommendation === 'comprar'
                            ? 'success'
                            : analysis.recommendation === 'analizar'
                            ? 'warning'
                            : 'neutral'
                        }
                        className="text-[10px] capitalize"
                      >
                        {analysis.recommendation}
                      </Badge>
                    </div>
                    <CardTitle className="text-base line-clamp-1">{analysis.title}</CardTitle>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Activo: <span className="font-medium text-neutral-700 dark:text-neutral-300">{analysis.asset_title}</span> ({analysis.asset_reference})
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2">
                  {analysis.thesis}
                </p>

                {/* Financial Metrics Cards */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-center">
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider">TIR Esperada</p>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatPercent(analysis.expected_irr)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Múltiplo</p>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {analysis.expected_multiple}x
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Retorno</p>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatPercent(analysis.expected_return)}
                    </p>
                  </div>
                </div>

                {/* Key figures */}
                <div className="flex items-center justify-between text-xs text-neutral-500 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                  <span>Inversión: <strong className="text-neutral-900 dark:text-neutral-100">{formatCurrency(analysis.investment_amount)}</strong></span>
                  <span>Salida obj.: <strong className="text-neutral-900 dark:text-neutral-100">{formatCurrency(analysis.target_exit_value)}</strong></span>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setSelectedAnalysis(analysis)}
                  >
                    Ver detalles y escenarios
                    <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Analysis Detail Modal */}
      {selectedAnalysis && (
        <Modal
          isOpen={!!selectedAnalysis}
          onClose={() => setSelectedAnalysis(null)}
          title={selectedAnalysis.title}
          description={`Activo: ${selectedAnalysis.asset_title} (${selectedAnalysis.asset_reference})`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs text-neutral-700 dark:text-neutral-300">
            {/* Recommendation badge & key metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-800">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Recomendación</span>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase">
                  {selectedAnalysis.recommendation}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">TIR Estimada</span>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {formatPercent(selectedAnalysis.expected_irr)}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Múltiplo Capital</span>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {selectedAnalysis.expected_multiple}x MoIC
                </p>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Salida Prevista</span>
                <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatDate(selectedAnalysis.target_exit_date)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                Tesis de Inversión
              </h4>
              <p className="leading-relaxed bg-white dark:bg-neutral-900 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                {selectedAnalysis.thesis}
              </p>
            </div>

            {/* Scenarios Comparison */}
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Escenarios y Sensibilidad
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300 block mb-1">
                    Escenario Optimista (Upside)
                  </span>
                  <p className="text-neutral-600 dark:text-neutral-300 text-[11px] leading-relaxed">
                    {selectedAnalysis.upside_case}
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
                  <span className="font-semibold text-blue-800 dark:text-blue-300 block mb-1">
                    Escenario Base
                  </span>
                  <p className="text-neutral-600 dark:text-neutral-300 text-[11px] leading-relaxed">
                    {selectedAnalysis.base_case}
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/20">
                  <span className="font-semibold text-rose-800 dark:text-rose-300 block mb-1">
                    Escenario Conservador (Downside)
                  </span>
                  <p className="text-neutral-600 dark:text-neutral-300 text-[11px] leading-relaxed">
                    {selectedAnalysis.downside_case}
                  </p>
                </div>
              </div>
            </div>

            {/* Assumptions & Risks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                  Hipótesis Operativas
                </h4>
                <p className="text-neutral-600 dark:text-neutral-400 text-xs bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg">
                  {selectedAnalysis.assumptions}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                  Riesgos Identificados
                </h4>
                <p className="text-neutral-600 dark:text-neutral-400 text-xs bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg">
                  {selectedAnalysis.risks}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* New Analysis Modal */}
      <Modal
        isOpen={isNewAnalysisOpen}
        onClose={() => setIsNewAnalysisOpen(false)}
        title="Nuevo Análisis de Inversión"
        description="Registra una nueva hipótesis y modelización financiera vinculada a un activo."
        maxWidth="xl"
      >
        <form onSubmit={handleCreateAnalysis} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1">Activo Vinculado *</label>
            <Select
              value={formAssetId}
              onChange={(e) => {
                setFormAssetId(e.target.value);
                const ast = assets.find((a) => a.id === e.target.value);
                if (ast) {
                  setFormTitle(`Análisis de inversión: ${ast.title}`);
                  setFormInvestmentAmount(ast.current_value);
                  setFormTargetExitValue(Math.round(ast.current_value * 1.35));
                }
              }}
              required
            >
              {assets.map((ast) => (
                <option key={ast.id} value={ast.id}>
                  {ast.reference} — {ast.title} ({ast.city})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block font-medium mb-1">Título del Análisis *</label>
            <Input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Tesis de Inversión *</label>
            <textarea
              rows={3}
              className="w-full rounded-md border border-neutral-300 bg-white p-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900"
              value={formThesis}
              onChange={(e) => setFormThesis(e.target.value)}
              placeholder="Describa el ángulo de inversión, creación de valor y estrategia de desinversión..."
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium mb-1">TIR Esperada (%)</label>
              <Input
                type="number"
                step="0.1"
                value={formIrr}
                onChange={(e) => setFormIrr(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Múltiplo (x)</label>
              <Input
                type="number"
                step="0.05"
                value={formMultiple}
                onChange={(e) => setFormMultiple(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Retorno Total (%)</label>
              <Input
                type="number"
                step="0.1"
                value={formReturn}
                onChange={(e) => setFormReturn(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Importe Inversión (€)</label>
              <Input
                type="number"
                value={formInvestmentAmount}
                onChange={(e) => setFormInvestmentAmount(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Valor Objetivo de Salida (€)</label>
              <Input
                type="number"
                value={formTargetExitValue}
                onChange={(e) => setFormTargetExitValue(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Fecha Salida Prevista</label>
              <Input
                type="date"
                value={formTargetExitDate}
                onChange={(e) => setFormTargetExitDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Recomendación</label>
              <Select
                value={formRecommendation}
                onChange={(e) =>
                  setFormRecommendation(e.target.value as 'comprar' | 'analizar' | 'descartar' | 'mantener')
                }
              >
                <option value="comprar">Comprar</option>
                <option value="analizar">Analizar</option>
                <option value="mantener">Mantener</option>
                <option value="descartar">Descartar</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewAnalysisOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Guardar análisis</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
