import * as XLSX from 'xlsx';
import { Client, ClientStatus, ClientType } from '@/types';

export interface SheetInfo {
  name: string;
  rowCount: number;
}

export interface ParseResult {
  sheetNames: string[];
  selectedSheet: string;
  headers: string[];
  rawRows: Record<string, any>[];
  totalRows: number;
}

export interface ClientColumnMapping {
  legal_name: string;
  trade_name?: string;
  tax_id?: string;
  email?: string;
  phone?: string;
  assigned_user_name?: string;
  address?: string;
  city?: string;
  status?: string;
  notes_columns: string[];
}

// Synonyms and aliases for automatic matching
const CLIENT_FIELD_ALIASES: Record<string, string[]> = {
  legal_name: ['name', 'nombre', 'cliente', 'razon social', 'razón social', 'titular', 'apellidos', 'empresa', 'contacto', 'full name', 'fullname'],
  trade_name: ['nombre comercial', 'trade name', 'comercial', 'marca', 'alias'],
  tax_id: ['id', 'nif', 'cif', 'dni', 'nie', 'identificador', 'doc', 'documento', 'tax', 'codigo', 'código'],
  email: ['@', 'email', 'e-mail', 'correo', 'mail', 'correo electronico', 'correo electrónico'],
  phone: ['📞', 'tel', 'telefono', 'teléfono', 'phone', 'movil', 'móvil', 'celular', 'whatsapp', 'telf'],
  assigned_user_name: ['asesor', 'comercial', 'gestor', 'responsable', 'broker', 'assigned', 'agente', 'propietario', 'personas'],
  address: ['macro', 'direccion', 'dirección', 'inmueble', 'calle', 'domicilio', 'address', 'ubicacion', 'ubicación'],
  city: ['ciudad', 'municipio', 'localidad', 'provincia', 'poblacion', 'población', 'city'],
  status: ['estado', 'status', 'situacion', 'situación', 'fase'],
};

/**
 * Normalizes text for fuzzy header matching (lowercase, no accents, trimmed)
 */
function normalizeHeader(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Checks if a header looks like a phone number header
 */
function isPhoneHeader(header: string): boolean {
  if (header.includes('📞') || header.charCodeAt(0) === 0xf4de || header === '') return true;
  const norm = normalizeHeader(header);
  return norm.includes('tel') || norm.includes('movil') || norm.includes('phone') || norm.includes('celular') || norm === 'telf';
}

/**
 * Reads an Excel or CSV file in the browser and parses sheet data
 */
export async function parseExcelOrCsvFile(file: File, targetSheetName?: string): Promise<ParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  const sheetNames = workbook.SheetNames;
  if (!sheetNames || sheetNames.length === 0) {
    throw new Error('El archivo no contiene ninguna hoja de cálculo.');
  }

  // Pick target sheet or find the one with the most data
  let selectedSheet = targetSheetName && sheetNames.includes(targetSheetName) ? targetSheetName : sheetNames[0];

  if (!targetSheetName && sheetNames.length > 1) {
    // Find sheet with highest row count (e.g. 'Clientes' with 5296 rows vs 'Resumen' with 17 rows)
    let maxRows = -1;
    for (const name of sheetNames) {
      const ws = workbook.Sheets[name];
      if (ws) {
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        if (rows.length > maxRows) {
          maxRows = rows.length;
          selectedSheet = name;
        }
      }
    }
  }

  const worksheet = workbook.Sheets[selectedSheet];
  const rawRowsGrid = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];

  if (rawRowsGrid.length === 0) {
    throw new Error('La hoja seleccionada está vacía.');
  }

  // Detect header row index (scanning first 10 rows to skip decorative titles like 'CLIENTES' / 'Consolidado')
  let headerRowIndex = 0;
  let maxColCount = 0;

  for (let i = 0; i < Math.min(10, rawRowsGrid.length); i++) {
    const row = rawRowsGrid[i];
    if (!Array.isArray(row)) continue;
    const nonEmptyCells = row.filter((c) => c !== undefined && c !== null && String(c).trim().length > 0);
    // Favor rows with 3+ non-empty cells
    if (nonEmptyCells.length > maxColCount && nonEmptyCells.length >= 3) {
      maxColCount = nonEmptyCells.length;
      headerRowIndex = i;
    }
  }

  const rawHeaders = (rawRowsGrid[headerRowIndex] || []).map((h, idx) => {
    const str = String(h || '').trim();
    return str || `Columna_${idx + 1}`;
  });

  // Extract data rows
  const parsedRows: Record<string, any>[] = [];
  for (let i = headerRowIndex + 1; i < rawRowsGrid.length; i++) {
    const gridRow = rawRowsGrid[i];
    if (!gridRow || !Array.isArray(gridRow)) continue;

    const rowObj: Record<string, any> = {};
    let hasAnyData = false;

    rawHeaders.forEach((header, colIdx) => {
      const val = gridRow[colIdx];
      const strVal = val !== undefined && val !== null ? String(val).trim() : '';
      if (strVal) hasAnyData = true;
      rowObj[header] = strVal;
    });

    if (hasAnyData) {
      parsedRows.push(rowObj);
    }
  }

  return {
    sheetNames,
    selectedSheet,
    headers: rawHeaders,
    rawRows: parsedRows,
    totalRows: parsedRows.length,
  };
}

/**
 * Suggests best column mappings based on headers and sample values
 */
export function autoDetectClientMapping(headers: string[], sampleRows: Record<string, any>[]): ClientColumnMapping {
  const mapping: ClientColumnMapping = {
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
  };

  const usedHeaders = new Set<string>();

  // Check each field's aliases
  for (const [field, aliases] of Object.entries(CLIENT_FIELD_ALIASES)) {
    for (const h of headers) {
      if (usedHeaders.has(h)) continue;

      if (field === 'phone' && isPhoneHeader(h)) {
        (mapping as any)[field] = h;
        usedHeaders.add(h);
        break;
      }

      const norm = normalizeHeader(h);
      const isMatch = aliases.some((alias) => {
        const normAlias = normalizeHeader(alias);
        return norm === normAlias || (normAlias.length > 2 && norm.includes(normAlias));
      });

      if (isMatch) {
        (mapping as any)[field] = h;
        usedHeaders.add(h);
        break;
      }
    }
  }

  // Heuristic: If email or phone were not detected by header name, check first 5 rows for @ or phone format
  if (!mapping.email && sampleRows.length > 0) {
    for (const h of headers) {
      if (usedHeaders.has(h)) continue;
      const hasAt = sampleRows.some((r) => String(r[h] || '').includes('@'));
      if (hasAt) {
        mapping.email = h;
        usedHeaders.add(h);
        break;
      }
    }
  }

  if (!mapping.phone && sampleRows.length > 0) {
    for (const h of headers) {
      if (usedHeaders.has(h)) continue;
      const looksLikePhone = sampleRows.some((r) => {
        const v = String(r[h] || '').replace(/[\s\-\+\(\)\/]/g, '');
        return v.length >= 8 && /^[0-9]+$/.test(v);
      });
      if (looksLikePhone) {
        mapping.phone = h;
        usedHeaders.add(h);
        break;
      }
    }
  }

  // Any remaining headers with valuable metadata (like Presupuesto, Situación, Origen, etc.) default to notes
  const notesCols: string[] = [];
  for (const h of headers) {
    if (!usedHeaders.has(h)) {
      const norm = normalizeHeader(h);
      if (
        norm.includes('presupuesto') ||
        norm.includes('situacion') ||
        norm.includes('origen') ||
        norm.includes('macro') ||
        norm.includes('inmueble') ||
        norm.includes('actualiz') ||
        norm.includes('observ') ||
        norm.includes('coment')
      ) {
        notesCols.push(h);
      }
    }
  }
  mapping.notes_columns = notesCols;

  return mapping;
}

/**
 * Transforms raw parsed rows into CRM Client objects ready for insertion
 */
export function transformRowsToClients(
  rawRows: Record<string, any>[],
  mapping: ClientColumnMapping,
  options?: {
    defaultStatus?: ClientStatus;
    defaultType?: ClientType;
    skipPlaceholders?: boolean;
    autoBlacklist?: boolean;
  }
): {
  validClients: Array<Omit<Client, 'id' | 'reference' | 'created_at' | 'updated_at'>>;
  skippedCount: number;
} {
  const opts = {
    defaultStatus: 'activo' as ClientStatus,
    defaultType: 'persona' as ClientType,
    skipPlaceholders: true,
    autoBlacklist: true,
    ...options,
  };

  const validClients: Array<Omit<Client, 'id' | 'reference' | 'created_at' | 'updated_at'>> = [];
  let skippedCount = 0;

  for (const row of rawRows) {
    const rawName = String(row[mapping.legal_name] || '').trim();

    // Check placeholders or empty names
    if (!rawName) {
      skippedCount++;
      continue;
    }

    if (
      opts.skipPlaceholders &&
      (rawName.toLowerCase() === 'agregar elemento' ||
        rawName.toLowerCase() === 'nuevo elemento' ||
        rawName.toLowerCase() === 'add item' ||
        rawName.toLowerCase() === 'elemento sin nombre')
    ) {
      skippedCount++;
      continue;
    }

    const rawEmail = mapping.email ? String(row[mapping.email] || '').trim() : '';
    const rawPhone = mapping.phone ? String(row[mapping.phone] || '').trim() : '';
    const rawTaxId = mapping.tax_id ? String(row[mapping.tax_id] || '').trim() : '';
    const rawCity = mapping.city ? String(row[mapping.city] || '').trim() : 'Madrid';
    const rawAddress = mapping.address ? String(row[mapping.address] || '').trim() : '';
    const rawAssigned = mapping.assigned_user_name ? String(row[mapping.assigned_user_name] || '').trim() : '';

    // Status logic: check if row or origen contains 'blacklist', 'descarta', etc.
    let status: ClientStatus = opts.defaultStatus;
    const origenVal = String(row['Origen'] || row['origen'] || row['ORIGEN'] || '').toLowerCase();
    const estadoVal = mapping.status ? String(row[mapping.status] || '').toLowerCase() : '';

    if (opts.autoBlacklist && (origenVal.includes('black') || estadoVal.includes('black') || rawAssigned.toLowerCase().includes('black'))) {
      status = 'bloqueado';
    } else if (origenVal.includes('descarta') || estadoVal.includes('descarta') || estadoVal.includes('inactiv')) {
      status = 'inactivo';
    } else if (estadoVal.includes('prospect') || estadoVal.includes('contact')) {
      status = 'prospecto';
    }

    // Client type detection (empresa vs persona)
    let type: ClientType = opts.defaultType;
    const nameLower = rawName.toLowerCase();
    if (
      nameLower.includes(' s.l') ||
      nameLower.includes(' sl') ||
      nameLower.includes(' s.a') ||
      nameLower.includes(' sa') ||
      nameLower.includes('socimi') ||
      nameLower.includes('promociones') ||
      nameLower.includes('inversiones') ||
      nameLower.includes('holding') ||
      nameLower.includes('capital')
    ) {
      type = 'empresa';
    }

    // Build rich notes from unmapped or selected extra columns
    const notesParts: string[] = [];
    if (mapping.notes_columns && mapping.notes_columns.length > 0) {
      mapping.notes_columns.forEach((col) => {
        const val = row[col];
        if (val !== undefined && val !== null && String(val).trim().length > 0) {
          const str = String(val).trim();
          if (normalizeHeader(col).includes('presupuesto')) {
            const num = parseFloat(str.replace(/[€.,\s]/g, ''));
            notesParts.push(`Presupuesto: ${!isNaN(num) && num > 0 ? num.toLocaleString('es-ES') + ' €' : str}`);
          } else {
            notesParts.push(`${col}: ${str}`);
          }
        }
      });
    }

    // Safe email fallback if empty
    const cleanEmail = rawEmail.includes('@')
      ? rawEmail
      : rawTaxId
      ? `id_${rawTaxId.replace(/[^a-zA-Z0-9]/g, '')}@cliente-orbanix.es`
      : `contacto_${Math.random().toString(36).substring(2, 8)}@cliente-orbanix.es`;

    validClients.push({
      type,
      legal_name: rawName,
      trade_name: mapping.trade_name ? String(row[mapping.trade_name] || rawName).trim() : rawName,
      tax_id: rawTaxId || `CLI-${Math.floor(100000 + Math.random() * 900000)}`,
      email: cleanEmail,
      phone: rawPhone || undefined,
      city: rawCity || 'España',
      address: rawAddress || undefined,
      country: 'España',
      sector: type === 'empresa' ? 'Inmobiliario / Socimi' : 'Inversor Particular',
      status,
      assigned_user_name: rawAssigned || undefined,
      notes: notesParts.length > 0 ? notesParts.join(' | ') : undefined,
    });
  }

  return {
    validClients,
    skippedCount,
  };
}
