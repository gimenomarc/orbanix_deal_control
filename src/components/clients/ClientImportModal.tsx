'use client';

import * as React from 'react';
import { useStore } from '@/hooks/useStore';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Settings2,
  Table as TableIcon,
  ShieldAlert,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  parseExcelOrCsvFile,
  autoDetectClientMapping,
  transformRowsToClients,
  ClientColumnMapping,
  ParseResult,
} from '@/lib/importers/excelImporter';
import { ClientStatus, ClientType } from '@/types';

interface ClientImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (importedCount: number) => void;
}

export function ClientImportModal({ isOpen, onClose, onSuccess }: ClientImportModalProps) {
  const store = useStore();
  const { success, error } = useToast();

  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = React.useState<File | null>(null);
  const [isReadingFile, setIsReadingFile] = React.useState(false);
  const [parseResult, setParseResult] = React.useState<ParseResult | null>(null);
  const [selectedSheet, setSelectedSheet] = React.useState<string>('');

  // Column Mapping
  const [mapping, setMapping] = React.useState<ClientColumnMapping>({
    legal_name: '',
    trade_name: '',
    tax_id: '',
    email: '',
    phone: '',
    assigned_user_name: '',
    address: '',
    city: '',
    status: '',
    notes_columns: [],
  });

  // Settings
  const [skipPlaceholders, setSkipPlaceholders] = React.useState(true);
  const [autoBlacklist, setAutoBlacklist] = React.useState(true);
  const [defaultStatus, setDefaultStatus] = React.useState<ClientStatus>('activo');
  const [defaultType, setDefaultType] = React.useState<ClientType>('persona');

  // Execution
  const [isImporting, setIsImporting] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [importedCount, setImportedCount] = React.useState(0);

  const resetState = () => {
    setStep(1);
    setFile(null);
    setParseResult(null);
    setSelectedSheet('');
    setMapping({
      legal_name: '',
      trade_name: '',
      tax_id: '',
      email: '',
      phone: '',
      assigned_user_name: '',
      address: '',
      city: '',
      status: '',
      notes_columns: [],
    });
    setProgress(0);
    setImportedCount(0);
  };

  const handleModalClose = () => {
    if (!isImporting) {
      resetState();
      onClose();
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    try {
      setIsReadingFile(true);
      setFile(selectedFile);

      const parsed = await parseExcelOrCsvFile(selectedFile);
      setParseResult(parsed);
      setSelectedSheet(parsed.selectedSheet);

      // Auto-detect mappings
      const detected = autoDetectClientMapping(parsed.headers, parsed.rawRows.slice(0, 10));
      setMapping(detected);

      setIsReadingFile(false);
    } catch (err: any) {
      setIsReadingFile(false);
      error('Error al leer el archivo', err?.message || 'No se pudo interpretar el archivo.');
    }
  };

  const handleSheetChange = async (sheetName: string) => {
    if (!file) return;
    try {
      setIsReadingFile(true);
      setSelectedSheet(sheetName);
      const parsed = await parseExcelOrCsvFile(file, sheetName);
      setParseResult(parsed);

      const detected = autoDetectClientMapping(parsed.headers, parsed.rawRows.slice(0, 10));
      setMapping(detected);
      setIsReadingFile(false);
    } catch (err: any) {
      setIsReadingFile(false);
      error('Error al cambiar de hoja', err?.message || 'Error en la hoja seleccionada.');
    }
  };

  const transformedPreview = React.useMemo(() => {
    if (!parseResult || !mapping.legal_name) return { validClients: [], skippedCount: 0 };
    return transformRowsToClients(parseResult.rawRows, mapping, {
      defaultStatus,
      defaultType,
      skipPlaceholders,
      autoBlacklist,
    });
  }, [parseResult, mapping, defaultStatus, defaultType, skipPlaceholders, autoBlacklist]);

  const handleExecuteImport = async () => {
    if (!parseResult || transformedPreview.validClients.length === 0) {
      error('Sin datos', 'No hay registros válidos para importar.');
      return;
    }

    setIsImporting(true);
    setStep(4);
    setProgress(10);

    const total = transformedPreview.validClients.length;
    const chunkSize = 500;
    let processed = 0;

    // Small async loop to keep UI thread fluid and update progress bar
    setTimeout(() => {
      try {
        const created = store.addClientsBatch(transformedPreview.validClients);

        // Record import in audit log
        store.addImport({
          filename: file?.name || 'clientes.xlsx',
          type: 'clientes',
          status: 'completado',
          total_rows: parseResult.totalRows,
          successful_rows: created.length,
          failed_rows: transformedPreview.skippedCount,
          imported_by: store.getCurrentUser()?.first_name || 'Admin',
        });

        setProgress(100);
        setImportedCount(created.length);
        setIsImporting(false);
        success('Importación exitosa', `Se han importado ${created.length.toLocaleString('es-ES')} clientes.`);
        if (onSuccess) onSuccess(created.length);
      } catch (err: any) {
        setIsImporting(false);
        error('Error en importación', err?.message || 'Ocurrió un error inesperado.');
      }
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Asistente de Importación de Clientes"
      description="Carga masiva de contactos e inversores desde Excel (.xlsx, .xls) o CSV con mapeo inteligente."
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Wizard Steps Header */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div
            className={`p-2.5 rounded-lg border text-center font-medium transition-all ${
              step === 1
                ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : step > 1
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'border-neutral-200 bg-neutral-50 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900'
            }`}
          >
            1. Archivo
          </div>
          <div
            className={`p-2.5 rounded-lg border text-center font-medium transition-all ${
              step === 2
                ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : step > 2
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'border-neutral-200 bg-neutral-50 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900'
            }`}
          >
            2. Mapeo Columnas
          </div>
          <div
            className={`p-2.5 rounded-lg border text-center font-medium transition-all ${
              step === 3
                ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : step > 3
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'border-neutral-200 bg-neutral-50 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900'
            }`}
          >
            3. Previsualizar
          </div>
          <div
            className={`p-2.5 rounded-lg border text-center font-medium transition-all ${
              step === 4
                ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'border-neutral-200 bg-neutral-50 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900'
            }`}
          >
            4. Resultado
          </div>
        </div>

        {/* STEP 1: Upload File */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-8 text-center hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
              <input
                type="file"
                id="client-import-input"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                disabled={isReadingFile}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
              <label
                htmlFor="client-import-input"
                className="cursor-pointer flex flex-col items-center justify-center space-y-3"
              >
                <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                  {isReadingFile ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {file ? file.name : 'Haz clic o arrastra tu archivo Excel / CSV aquí'}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Formatos compatibles: .xlsx, .xls, .csv (e.g. CLIENTES_UNIFICADOS.xlsx)
                  </p>
                </div>
                {file && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.name}
                  </Badge>
                )}
              </label>
            </div>

            {/* Sheet selector if workbook has multiple sheets */}
            {parseResult && parseResult.sheetNames.length > 1 && (
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-between gap-4">
                <div className="text-xs">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Hoja de cálculo detectada:
                  </span>
                  <p className="text-neutral-500">
                    El archivo contiene {parseResult.sheetNames.length} pestañas.
                  </p>
                </div>
                <Select
                  value={selectedSheet}
                  onChange={(e) => handleSheetChange(e.target.value)}
                  className="w-56 text-xs h-9"
                  disabled={isReadingFile}
                >
                  {parseResult.sheetNames.map((s) => (
                    <option key={s} value={s}>
                      Hoja: {s}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {parseResult && (
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-neutral-500 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  <span>
                    Detectadas {parseResult.headers.length} columnas y {parseResult.totalRows.toLocaleString('es-ES')} filas de datos en "{selectedSheet}".
                  </span>
                </div>
                <Button size="sm" onClick={() => setStep(2)}>
                  Continuar al mapeo
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Column Mapping */}
        {step === 2 && parseResult && (
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 p-3 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
              <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium">Mapeo inteligente activado</p>
                <p className="text-[11px] text-blue-700 dark:text-blue-300/80 mt-0.5">
                  Hemos emparejado automáticamente las columnas detectadas. Si tu Excel usa nombres diferentes (ej: "Contacto", "Móvil", "ID"), puedes seleccionarlos o cambiarlos en los desplegables.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Legal Name */}
              <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1">
                <label className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center justify-between">
                  <span>Nombre / Razón Social <span className="text-red-500">*</span></span>
                  <Badge variant="outline" className="text-[10px]">Requerido</Badge>
                </label>
                <Select
                  value={mapping.legal_name}
                  onChange={(e) => setMapping({ ...mapping, legal_name: e.target.value })}
                  className="w-full h-8 text-xs"
                >
                  <option value="">-- Seleccionar columna --</option>
                  {parseResult.headers.map((h) => (
                    <option key={h} value={h}>
                      Columna: {h}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Phone */}
              <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1">
                <label className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Teléfono
                </label>
                <Select
                  value={mapping.phone || ''}
                  onChange={(e) => setMapping({ ...mapping, phone: e.target.value })}
                  className="w-full h-8 text-xs"
                >
                  <option value="">-- No asignar --</option>
                  {parseResult.headers.map((h) => (
                    <option key={h} value={h}>
                      Columna: {h}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Email */}
              <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1">
                <label className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Correo Electrónico (@)
                </label>
                <Select
                  value={mapping.email || ''}
                  onChange={(e) => setMapping({ ...mapping, email: e.target.value })}
                  className="w-full h-8 text-xs"
                >
                  <option value="">-- No asignar --</option>
                  {parseResult.headers.map((h) => (
                    <option key={h} value={h}>
                      Columna: {h}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Tax ID / ID */}
              <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1">
                <label className="font-semibold text-neutral-900 dark:text-neutral-100">
                  NIF / CIF / Identificador (ID)
                </label>
                <Select
                  value={mapping.tax_id || ''}
                  onChange={(e) => setMapping({ ...mapping, tax_id: e.target.value })}
                  className="w-full h-8 text-xs"
                >
                  <option value="">-- No asignar (Auto-generar) --</option>
                  {parseResult.headers.map((h) => (
                    <option key={h} value={h}>
                      Columna: {h}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Asesor */}
              <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1">
                <label className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Asesor Asignado
                </label>
                <Select
                  value={mapping.assigned_user_name || ''}
                  onChange={(e) => setMapping({ ...mapping, assigned_user_name: e.target.value })}
                  className="w-full h-8 text-xs"
                >
                  <option value="">-- No asignar --</option>
                  {parseResult.headers.map((h) => (
                    <option key={h} value={h}>
                      Columna: {h}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Address / Macro */}
              <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1">
                <label className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Inmueble de interés / Dirección (Macro)
                </label>
                <Select
                  value={mapping.address || ''}
                  onChange={(e) => setMapping({ ...mapping, address: e.target.value })}
                  className="w-full h-8 text-xs"
                >
                  <option value="">-- No asignar --</option>
                  {parseResult.headers.map((h) => (
                    <option key={h} value={h}>
                      Columna: {h}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Extra Columns to Notes */}
            <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 space-y-2">
              <label className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 flex items-center justify-between">
                <span>Guardar otras columnas en el historial de Notas del cliente</span>
                <span className="text-[11px] font-normal text-neutral-500">
                  (Para no perder Presupuesto, Situación, Origen u otros datos personalizados)
                </span>
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {parseResult.headers.map((h) => {
                  const isMappedToMain =
                    h === mapping.legal_name ||
                    h === mapping.phone ||
                    h === mapping.email ||
                    h === mapping.tax_id ||
                    h === mapping.assigned_user_name ||
                    h === mapping.address;
                  if (isMappedToMain) return null;

                  const isChecked = mapping.notes_columns.includes(h);

                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setMapping({
                            ...mapping,
                            notes_columns: mapping.notes_columns.filter((c) => c !== h),
                          });
                        } else {
                          setMapping({
                            ...mapping,
                            notes_columns: [...mapping.notes_columns, h],
                          });
                        }
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-md border transition-all ${
                        isChecked
                          ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                          : 'border-neutral-200 bg-white text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 hover:border-neutral-400'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '} {h}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Volver
              </Button>
              <Button
                size="sm"
                disabled={!mapping.legal_name}
                onClick={() => setStep(3)}
              >
                Previsualizar datos
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Preview & Rules */}
        {step === 3 && parseResult && (
          <div className="space-y-4">
            {/* Summary statistics */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                <span className="text-emerald-700 dark:text-emerald-300 font-medium">Clientes válidos</span>
                <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100 mt-0.5">
                  {transformedPreview.validClients.length.toLocaleString('es-ES')}
                </p>
              </div>
              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20">
                <span className="text-amber-700 dark:text-amber-300 font-medium">Filas vacías / descartes</span>
                <p className="text-lg font-bold text-amber-900 dark:text-amber-100 mt-0.5">
                  {transformedPreview.skippedCount.toLocaleString('es-ES')}
                </p>
              </div>
              <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                <span className="text-neutral-600 dark:text-neutral-400 font-medium">Total filas leídas</span>
                <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {parseResult.totalRows.toLocaleString('es-ES')}
                </p>
              </div>
            </div>

            {/* Smart Rules */}
            <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs space-y-2">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">Reglas de limpieza automática:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-600 dark:text-neutral-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipPlaceholders}
                    onChange={(e) => setSkipPlaceholders(e.target.checked)}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <span>Omitir placeholders (ej. "Agregar elemento")</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoBlacklist}
                    onChange={(e) => setAutoBlacklist(e.target.checked)}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <span>Auto-bloquear contactos marcados como "Blacklist"</span>
                </label>
              </div>
            </div>

            {/* Preview Table of first 5 items */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                Muestra de los primeros registros a importar:
              </span>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-x-auto max-h-52 bg-white dark:bg-neutral-900">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 text-[10px] uppercase font-semibold text-neutral-500">
                    <tr>
                      <th className="p-2">Nombre / Razón</th>
                      <th className="p-2">Teléfono</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Asesor</th>
                      <th className="p-2">Estado</th>
                      <th className="p-2">Notas / Metadatos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {transformedPreview.validClients.slice(0, 5).map((c, i) => (
                      <tr key={i} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                        <td className="p-2 font-medium text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                          {c.legal_name}
                        </td>
                        <td className="p-2 text-neutral-600 dark:text-neutral-400 whitespace-nowrap font-mono">
                          {c.phone || '-'}
                        </td>
                        <td className="p-2 text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                          {c.email}
                        </td>
                        <td className="p-2 text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                          {c.assigned_user_name || '-'}
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <Badge
                            variant={
                              c.status === 'activo'
                                ? 'success'
                                : c.status === 'bloqueado'
                                ? 'destructive'
                                : 'warning'
                            }
                            className="text-[10px] capitalize"
                          >
                            {c.status}
                          </Badge>
                        </td>
                        <td className="p-2 text-neutral-500 text-[11px] max-w-xs truncate" title={c.notes}>
                          {c.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Ajustar mapeo
              </Button>
              <Button
                size="sm"
                onClick={handleExecuteImport}
                disabled={transformedPreview.validClients.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                Confirmar e Importar {transformedPreview.validClients.length.toLocaleString('es-ES')} clientes
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Execution & Completed */}
        {step === 4 && (
          <div className="py-6 text-center space-y-4">
            {isImporting ? (
              <div className="space-y-3">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-neutral-900 dark:text-white" />
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Importando clientes al sistema...
                </p>
                <div className="w-full max-w-xs mx-auto bg-neutral-200 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-neutral-500">
                  Optimizando almacenamiento y registrando en la base de datos...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    ¡Importación completada con éxito!
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Se han incorporado{' '}
                    <strong className="text-neutral-900 dark:text-neutral-100">
                      {importedCount.toLocaleString('es-ES')} clientes
                    </strong>{' '}
                    a la base de datos de Orbanix Deal Control.
                  </p>
                </div>
                <div className="pt-2">
                  <Button size="sm" onClick={handleModalClose}>
                    Ver clientes importados
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
