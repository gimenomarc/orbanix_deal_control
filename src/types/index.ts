export type UserRole = 
  | 'admin' 
  | 'manager' 
  | 'analyst' 
  | 'commercial' 
  | 'compliance' 
  | 'accounting' 
  | 'viewer';

export interface RoleInfo {
  role: UserRole;
  label: string;
  shortLabel: string;
  description: string;
  badgeColor: string;
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleInfo> = {
  admin: {
    role: 'admin',
    label: 'Super Administrador',
    shortLabel: 'Admin',
    description: 'Control total de la plataforma, gestión de usuarios, roles, base de datos y auditoría.',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
  },
  manager: {
    role: 'manager',
    label: 'Gestor Inmobiliario (Asset Manager)',
    shortLabel: 'Gestor Inmobiliario',
    description: 'Gestión técnica y comercial de activos (Open Market, Run Off, NPL, Institucional), comercialización y llaves.',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
  },
  analyst: {
    role: 'analyst',
    label: 'Analista de Inversiones (Investment Analyst)',
    shortLabel: 'Analista Inversión',
    description: 'Modelización de rentabilidad, análisis de carteras, cálculo de TIR y Múltiplos, y comités de inversión.',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
  },
  commercial: {
    role: 'commercial',
    label: 'Director Comercial / Broker',
    shortLabel: 'Comercial / Broker',
    description: 'Pipeline de operaciones (Kanban), relación con inversores y compradores, gestión de mandatos y leads.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
  },
  compliance: {
    role: 'compliance',
    label: 'Responsable PBC & Legal (Compliance)',
    shortLabel: 'Compliance & PBC',
    description: 'Control de prevención de blanqueo de capitales, KYC, validación de fondos y prescripciones judiciales.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
  },
  accounting: {
    role: 'accounting',
    label: 'Responsable Financiero (Contabilidad)',
    shortLabel: 'Financiero / Contable',
    description: 'Liquidación de honorarios, comisiones de éxito por deals, control de facturación y balances.',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800',
  },
  viewer: {
    role: 'viewer',
    label: 'Auditor / Lector Institucional',
    shortLabel: 'Auditor / Lector',
    description: 'Acceso de solo consulta para comités de seguimiento, bancos colaboradores y auditorías externas.',
    badgeColor: 'bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700',
  },
};

export interface UserProfile {
  id: string;
  auth_user_id?: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  department: string;
  active: boolean;
  password?: string;
  created_at: string;
  updated_at: string;
}

export type ClientType = 'persona' | 'empresa' | 'fondo' | 'family_office' | 'institucional' | 'otro';
export type ClientStatus = 'activo' | 'prospecto' | 'inactivo' | 'bloqueado';

export interface Client {
  id: string;
  reference: string;
  type: ClientType;
  legal_name: string;
  trade_name?: string;
  tax_id: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country: string;
  sector?: string;
  status: ClientStatus;
  owner_id?: string;
  assigned_user_id?: string;
  assigned_user_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type OwnerType = 'persona' | 'empresa' | 'banco' | 'fondo' | 'servicer' | 'otro';

export interface Owner {
  id: string;
  reference: string;
  name: string;
  type: OwnerType;
  tax_id?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country: string;
  notes?: string;
  status: 'activo' | 'inactivo';
  total_portfolios?: number;
  total_assets?: number;
  total_value?: number;
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  id: string;
  reference: string;
  name: string;
  owner_id: string;
  owner_name?: string;
  description?: string;
  status: 'activa' | 'en_analisis' | 'cerrada' | 'liquidada';
  total_assets: number;
  total_nominal: number;
  total_value: number;
  created_at: string;
  updated_at: string;
}

export type AssetBranch = 'open_market' | 'run_off' | 'npl' | 'institutional';

export type AssetType = 'inmobiliario' | 'credito' | 'NPL' | 'cartera' | 'institucional' | 'otro';

export type AssetPhase = 
  | 'originacion' 
  | 'analisis' 
  | 'comercializacion' 
  | 'negociacion' 
  | 'operacion' 
  | 'cierre' 
  | 'post_cierre' 
  | 'cerrado';

export type AssetStatus = 'disponible' | 'en_proceso' | 'reservado' | 'vendido' | 'baja' | 'en_litigio';

export interface Asset {
  id: string;
  reference: string;
  title: string;
  asset_type: AssetType;
  branch: AssetBranch;
  phase: AssetPhase;
  status: AssetStatus;
  portfolio_id?: string;
  portfolio_name?: string;
  owner_id?: string;
  owner_name?: string;
  assigned_user_id?: string;
  assigned_user_name?: string;
  nominal_value: number;
  acquisition_value?: number;
  current_value: number;
  asking_price?: number;
  currency: string;
  country: string;
  region?: string;
  city: string;
  address?: string;
  postal_code?: string;
  surface?: number;
  bedrooms?: number;
  bathrooms?: number;
  property_status?: string;
  acquisition_date?: string;
  maturity_date?: string;
  recovery_estimate?: number;
  collateral_description?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type OperationPhase = 
  | 'nueva' 
  | 'analisis' 
  | 'propuesta' 
  | 'negociacion' 
  | 'documentacion' 
  | 'cierre' 
  | 'completada' 
  | 'cancelada';

export interface Operation {
  id: string;
  reference: string;
  title: string;
  asset_id?: string;
  asset_reference?: string;
  asset_title?: string;
  client_id?: string;
  client_name?: string;
  owner_id?: string;
  owner_name?: string;
  assigned_user_id?: string;
  assigned_user_name?: string;
  type: 'compra' | 'venta' | 'cesion_credito' | 'subasta' | 'arrendamiento' | 'otro';
  status: 'activa' | 'en_espera' | 'ganada' | 'perdida' | 'cancelada';
  phase: OperationPhase;
  amount: number;
  expected_value: number;
  final_value?: number;
  probability: number;
  expected_close_date?: string;
  actual_close_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type LeadStatus = 'nuevo' | 'contactado' | 'cualificado' | 'propuesta' | 'negociacion' | 'convertido' | 'perdido';
export type LeadPriority = 'baja' | 'media' | 'alta' | 'urgente';

export interface Lead {
  id: string;
  reference: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  source: 'web' | 'idealista' | 'referido' | 'evento' | 'campana' | 'otro';
  status: LeadStatus;
  priority: LeadPriority;
  assigned_user_id?: string;
  assigned_user_name?: string;
  client_id?: string;
  estimated_value?: number;
  next_action?: string;
  next_action_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  all_day: boolean;
  location?: string;
  event_type: 'reunion' | 'llamada' | 'visita' | 'firma' | 'subasta' | 'vencimiento' | 'otro';
  created_by?: string;
  assigned_user_id?: string;
  assigned_user_name?: string;
  client_id?: string;
  client_name?: string;
  asset_id?: string;
  asset_reference?: string;
  operation_id?: string;
  lead_id?: string;
  status: 'programado' | 'completado' | 'cancelado';
  created_at: string;
  updated_at: string;
}

export type ActivityType = 
  | 'llamada' 
  | 'email' 
  | 'reunion' 
  | 'nota' 
  | 'cambio_fase' 
  | 'tarea' 
  | 'documento' 
  | 'sistema';

export interface Activity {
  id: string;
  user_id?: string;
  user_name?: string;
  entity_type: 'asset' | 'client' | 'operation' | 'lead' | 'owner' | 'portfolio' | 'pbc' | 'user';
  entity_id: string;
  entity_reference?: string;
  activity_type: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  mime_type: string;
  size: number;
  entity_type: 'asset' | 'client' | 'operation' | 'owner' | 'lead' | 'pbc';
  entity_id: string;
  uploaded_by?: string;
  uploaded_by_name?: string;
  category: 'contrato' | 'nota_simple' | 'tasacion' | 'identificacion' | 'financiero' | 'pbc' | 'otro';
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id?: string;
  type: 'info' | 'alerta' | 'vencimiento' | 'operacion' | 'sistema';
  title: string;
  message: string;
  entity_type?: string;
  entity_id?: string;
  read_at?: string | null;
  created_at: string;
}

export interface Objective {
  id: string;
  title: string;
  user_id?: string;
  user_name?: string;
  period: 'mensual' | 'trimestral' | 'anual';
  period_label: string;
  target_value: number;
  current_value: number;
  percentage: number;
  unit: 'eur' | 'operaciones' | 'captaciones' | 'visitas';
  status: 'en_progreso' | 'alcanzado' | 'riesgo';
  created_at: string;
}

export interface InvestmentAnalysis {
  id: string;
  asset_id: string;
  asset_reference?: string;
  asset_title?: string;
  title: string;
  thesis: string;
  assumptions: string;
  base_case: string;
  upside_case: string;
  downside_case: string;
  expected_return: number;
  expected_irr: number;
  expected_multiple: number;
  investment_amount: number;
  target_exit_value: number;
  target_exit_date: string;
  risks: string;
  opportunities: string;
  recommendation: 'comprar' | 'analizar' | 'descartar' | 'mantener';
  status: 'borrador' | 'en_revision' | 'aprobado' | 'descartado';
  branch: AssetBranch;
  phase: AssetPhase;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export type PBCStatus = 'pendiente' | 'en_revision' | 'incompleto' | 'completo' | 'rechazado' | 'expirado';

export interface PBCRecord {
  id: string;
  reference: string;
  client_id: string;
  client_name?: string;
  risk_level: 'bajo' | 'medio' | 'alto';
  status: PBCStatus;
  kyc_verified: boolean;
  funds_source_verified: boolean;
  pep_check: boolean;
  sanctions_check: boolean;
  verification_date?: string;
  expiration_date?: string;
  incidents_count: number;
  notes?: string;
  reviewer_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Prescription {
  id: string;
  reference: string;
  entity_type: 'asset' | 'operation' | 'client' | 'procedimiento';
  entity_id: string;
  entity_title: string;
  type: 'vencimiento_contrato' | 'prescripcion_deuda' | 'subasta' | 'notificacion_judicial' | 'garantia';
  due_date: string;
  status: 'vigente' | 'proximo' | 'vencido' | 'resuelto';
  responsible_name: string;
  notes?: string;
  auto_alert: boolean;
  days_remaining: number;
  created_at: string;
  updated_at: string;
}

export interface AccountingTransaction {
  id: string;
  reference: string;
  type: 'ingreso' | 'gasto';
  category: 'comision' | 'honorarios' | 'tasacion' | 'notaria' | 'registro' | 'marketing' | 'gestion' | 'otros';
  concept: string;
  amount: number;
  date: string;
  status: 'pagado' | 'pendiente' | 'cobrado' | 'anulado';
  invoice_number?: string;
  operation_id?: string;
  operation_title?: string;
  client_name?: string;
  created_at: string;
}

export interface Collaborator {
  id: string;
  name: string;
  company?: string;
  type: 'abogado' | 'tasador' | 'procurador' | 'notario' | 'agente' | 'consultor' | 'otro';
  email: string;
  phone?: string;
  specialty?: string;
  status: 'activo' | 'inactivo';
  notes?: string;
  active_cases_count?: number;
  created_at: string;
}

export interface ImportRecord {
  id: string;
  filename: string;
  type: 'cartera_activos' | 'clientes' | 'leads' | 'npl';
  status: 'completado' | 'en_proceso' | 'fallido' | 'previsualizado';
  total_rows: number;
  successful_rows: number;
  failed_rows: number;
  imported_by: string;
  created_at: string;
}

export interface SystemConnection {
  id: string;
  service_name: string;
  display_name: string;
  status: 'Conectado' | 'Pendiente' | 'Sin conexión';
  description: string;
  detail_link?: string;
  last_verified?: string;
}
