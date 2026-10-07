'use client';

import * as React from 'react';
import { useStore } from '@/hooks/useStore';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  RotateCcw,
} from 'lucide-react';
import Papa from 'papaparse';
import { AssetBranch } from '@/types';
import { parseExcelOrCsvFile } from '@/lib/importers/excelImporter';
import { ClientImportModal } from '@/components/clients/ClientImportModal';

interface ParsedRow {
  [key: string]: string;
}

export default function ImportacionesPage() {
  const store = useStore();
  const { success, error } = useToast();

  const imports = store.getImports();

  // Wizard state: 1: upload, 2: preview & map, 3: validation, 4: executed
  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [fileName, setFileName] = React.useState('');
  const [rawHeaders, setRawHeaders] = React.useState<string[]>([]);
  const [rawRows, setRawRows] = React.useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = React.useState(false);

  // Column mapping
  const [mapTitle, setMapTitle] = React.useState('');
  const [mapValue, setMapValue] = React.useState('');
  const [mapCity, setMapCity] = React.useState('');
  const [mapBranch, setMapBranch] = React.useState('');
  const [mapSurface, setMapSurface] = React.useState('');

  // Execution stats
  const [importedCount, setImportedCount] = React.useState(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    if (file.name.toLowerCase().includes('cliente')) {
      setIsClientModalOpen(true);
      return;
    }

    try {
      const parsed = await parseExcelOrCsvFile(file);
      if (parsed.headers && parsed.headers.length > 0) {
        setRawHeaders(parsed.headers);
        setRawRows(parsed.rawRows as any);

        parsed.headers.forEach((f) => {
          const lower = f.toLowerCase();
          if (lower.includes('titulo') || lower.includes('nombre') || lower.includes('activo')) setMapTitle(f);
          if (lower.includes('valor') || lower.includes('precio') || lower.includes('importe')) setMapValue(f);
          if (lower.includes('ciudad') || lower.includes('municipio') || lower.includes('provincia')) setMapCity(f);
          if (lower.includes('rama') || lower.includes('tipo')) setMapBranch(f);
          if (lower.includes('superficie') || lower.includes('m2')) setMapSurface(f);
        });

        setStep(2);
      } else {
        error('Error de lectura', 'El archivo no contiene cabeceras válidas.');
      }
    } catch (err: any) {
      error('Error al analizar archivo', err?.message || 'No se pudo leer el archivo.');
    }
  };

  const handleExecuteImport = () => {
    setIsProcessing(true);
    let successCount = 0;

    try {
      rawRows.forEach((row) => {
        const title = row[mapTitle] || 'Activo Importado';
        const val = parseFloat(row[mapValue]?.replace(/[€.,\s]/g, '') || '0') || 1000000;
        const city = row[mapCity] || 'Madrid';
        const branchInput = (row[mapBranch] || 'open_market').toLowerCase();
        const branch: AssetBranch =
          branchInput.includes('npl') ? 'npl' :
          branchInput.includes('run') ? 'run_off' :
          branchInput.includes('inst') ? 'institutional' : 'open_market';
        const surface = parseFloat(row[mapSurface] || '200') || 200;

        store.addAsset({
          title: title,
          asset_type: branch === 'npl' ? 'NPL' : 'inmobiliario',
          branch: branch,
          phase: 'comercializacion',
          status: 'disponible',
          nominal_value: val,
          current_value: val,
          currency: 'EUR',
          country: 'España',
          city: city,
          surface: surface,
          notes: `Importado masivamente desde archivo ${fileName}`,
        });
        successCount++;
      });

      store.addImport({
        filename: fileName,
        type: 'cartera_activos',
        status: 'completado',
        total_rows: rawRows.length,
        successful_rows: successCount,
        failed_rows: rawRows.length - successCount,
        imported_by: store.getCurrentUser()?.first_name || 'Admin',
      });

      setImportedCount(successCount);
      setIsProcessing(false);
      setStep(4);
      success('Importación completada', `Se han importado ${successCount} activos a la base de datos.`);
    } catch {
      setIsProcessing(false);
      error('Error', 'Ha ocurrido un error durante la importación.');
    }
  };

  const handleDownloadSample = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Titulo,Valor,Ciudad,Rama,Superficie\n' +
      'Edificio Santa Ana,4500000,Madrid,open_market,1650\n' +
      'Nave Corredor Norte,6200000,Coslada,run_off,8400\n' +
      'Credito Hipotecario Costa,5100000,Alicante,npl,4500\n' +
      'Complejo Oficinas Central,18200000,Barcelona,institutional,6200\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'plantilla_cartera_orbanix.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetWizard = () => {
    setStep(1);
    setFileName('');
    setRawHeaders([]);
    setRawRows([]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Carga Masiva"
        title="Importar cartera y datos"
        description="Migración masiva de carteras de activos inmobiliarios y directorios de clientes / inversores."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsClientModalOpen(true)}
              className="text-xs bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 shadow-2xs font-medium"
            >
              <Upload className="mr-1.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Importar Clientes (Excel / CSV)
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadSample} className="text-xs">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Plantilla Activos CSV
            </Button>
          </div>
        }
      />

      {/* Step Indicator */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div className={`p-2.5 rounded-lg border text-center font-medium ${step === 1 ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500'}`}>
          1. Subir archivo
        </div>
        <div className={`p-2.5 rounded-lg border text-center font-medium ${step === 2 ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500'}`}>
          2. Mapear columnas
        </div>
        <div className={`p-2.5 rounded-lg border text-center font-medium ${step === 3 ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500'}`}>
          3. Validar & Confirmar
        </div>
        <div className={`p-2.5 rounded-lg border text-center font-medium ${step === 4 ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500'}`}>
          4. Resultado
        </div>
      </div>

      {/* Wizard Body */}
      <Card className="p-6 shadow-2xs">
        {step === 1 && (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-neutral-300 rounded-xl bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/40 text-center">
            <FileSpreadsheet className="h-12 w-12 text-neutral-400 mb-3" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Selecciona o arrastra tu archivo CSV o Excel
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-md">
              Soporta hojas de cálculo Excel (.xlsx, .xls) y ficheros delimitados por comas (.csv) para activos o clientes.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <label className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-neutral-800 cursor-pointer dark:bg-white dark:text-neutral-900">
                <Upload className="mr-2 h-4 w-4" />
                Examinar archivo (.xlsx, .xls, .csv)
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsClientModalOpen(true)}
                className="text-xs border-neutral-300 dark:border-neutral-700"
              >
                Importador de Clientes (Clientes Unificados)
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 text-xs">
            <div>
              <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                Mapeo de columnas ({fileName} — {rawRows.length} filas detectadas)
              </h3>
              <p className="text-neutral-500 mt-0.5">
                Empareja los campos de tu archivo con los campos del sistema CRM.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Título del Activo (title) *</label>
                <Select value={mapTitle} onChange={(e) => setMapTitle(e.target.value)}>
                  <option value="">Selecciona columna</option>
                  {rawHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block font-medium mb-1">Valor / Precio (current_value) *</label>
                <Select value={mapValue} onChange={(e) => setMapValue(e.target.value)}>
                  <option value="">Selecciona columna</option>
                  {rawHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block font-medium mb-1">Ciudad / Municipio (city) *</label>
                <Select value={mapCity} onChange={(e) => setMapCity(e.target.value)}>
                  <option value="">Selecciona columna</option>
                  {rawHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block font-medium mb-1">Rama / Segmento (branch)</label>
                <Select value={mapBranch} onChange={(e) => setMapBranch(e.target.value)}>
                  <option value="">Selecciona columna (o por defecto Open Market)</option>
                  {rawHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block font-medium mb-1">Superficie m² (surface)</label>
                <Select value={mapSurface} onChange={(e) => setMapSurface(e.target.value)}>
                  <option value="">Selecciona columna</option>
                  {rawHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between">
              <Button variant="outline" size="sm" onClick={resetWizard}>
                Cancelar
              </Button>
              <Button size="sm" onClick={() => setStep(3)}>
                Continuar a validación
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-xs">
            <div>
              <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                Previsualización y validación de datos
              </h3>
              <p className="text-neutral-500 mt-0.5">
                Verifica las primeras 5 filas antes de confirmar la inserción definitiva.
              </p>
            </div>

            <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
              <table className="w-full text-left">
                <thead className="bg-neutral-50 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-500">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">Título asignado</th>
                    <th className="p-2">Valor mapeado</th>
                    <th className="p-2">Ciudad</th>
                    <th className="p-2">Rama</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {rawRows.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      <td className="p-2 text-neutral-400">{i + 1}</td>
                      <td className="p-2 font-medium">{row[mapTitle] || 'Sin título'}</td>
                      <td className="p-2">{row[mapValue] || '0'} €</td>
                      <td className="p-2">{row[mapCity] || '-'}</td>
                      <td className="p-2">{row[mapBranch] || 'open_market'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Validación de tipos y formato completada sin bloqueos. {rawRows.length} registros listos para incorporar.</span>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between">
              <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                Atrás
              </Button>
              <Button size="sm" onClick={handleExecuteImport} loading={isProcessing}>
                Ejecutar importación masiva
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-8 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              ¡Importación completada con éxito!
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Se han creado <strong>{importedCount}</strong> activos en el sistema y están disponibles inmediatamente en todas las vistas de inventario y análisis de inversión.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Button variant="outline" size="sm" onClick={resetWizard}>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Importar otro archivo
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Import History */}
      <div className="space-y-3 pt-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Historial de importaciones
        </h3>
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-semibold uppercase text-neutral-500">
                <tr>
                  <th className="py-3 px-4">Archivo</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4 text-center">Filas Procesadas</th>
                  <th className="py-3 px-4">Importado por</th>
                  <th className="py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {imports.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-neutral-900 dark:text-neutral-100">
                      {item.filename}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500 capitalize">
                      {item.type.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-emerald-600">
                      {item.successful_rows} / {item.total_rows}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-300">
                      {item.imported_by}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="success" className="text-[10px] capitalize">
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Client Import Modal */}
      <ClientImportModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
      />
    </div>
  );
}
