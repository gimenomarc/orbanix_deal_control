export type UserRole = 
  | 'admin' 
  | 'direction'
  | 'coordinator'
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
  direction: {
    role: 'direction',
    label: 'Dirección General & Estratégica',
    shortLabel: 'Dirección',
    description: 'Supervisión ejecutiva, estrategia corporativa, comités de inversión, pipeline global y reporting consolidado.',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
  },
  coordinator: {
    role: 'coordinator',
    label: 'Coordinadora de Operaciones',
    shortLabel: 'Coordinadora',
    description: 'Coordinación central de agendas, soporte operativo a comerciales, tramitación de activos y expedientes.',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
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
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800',
  },
  commercial: {
    role: 'commercial',
    label: 'Comercial / Broker (Deals)',
    shortLabel: 'Comercial',
    description: 'Pipeline de operaciones (Kanban), relación directa con inversores, mandatos, visitas y prescripción entre áreas.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
  },
  compliance: {
    role: 'compliance',
    label: 'Analista PBC & Legal (Compliance)',
    shortLabel: 'Analista PBC',
    description: 'Control de prevención de blanqueo de capitales, KYC, validación de fondos y prescripciones judiciales.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
  },
  accounting: {
    role: 'accounting',
    label: 'Contabilidad & Finanzas',
    shortLabel: 'Contabilidad',
    description: 'Liquidación de honorarios, control de facturación, balances y comisiones devengadas por operaciones y prescripciones.',
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

export type AppModule =
  | 'investment'
  | 'inicio'
  | 'objetivos'
  | 'prescripciones'
  | 'reporting'
  | 'equipo'
  | 'agenda'
  | 'colaboradores'
  | 'contabilidad'
  | 'avisos'
  | 'leads'
  | 'clientes'
  | 'operaciones'
  | 'pbc'
  | 'activos'
  | 'propietarios'
  | 'importaciones'
  | 'configuracion';

export interface AppModuleInfo {
  module: AppModule;
  label: string;
  category: 'core' | 'gestion' | 'activos' | 'sistema';
  description: string;
}

export const APP_MODULES: AppModuleInfo[] = [
  { module: 'inicio', label: 'Inicio (Dashboard Global)', category: 'core', description: 'Métricas agregadas y resúmenes ejecutivos.' },
  { module: 'investment', label: 'Investment & Análisis', category: 'core', description: 'Tesis de inversión, cálculo de TIR y múltiplos.' },
  { module: 'objetivos', label: 'Objetivos & KPI', category: 'core', description: 'Metas comerciales, hitos de volumen y captaciones.' },
  { module: 'prescripciones', label: 'Prescripciones', category: 'core', description: 'Derivación inter-área de mandatos con reparto de comisiones.' },
  { module: 'reporting', label: 'Reporting & Auditoría', category: 'core', description: 'Informes ejecutivos consolidados e historial de cambios.' },
  { module: 'equipo', label: 'Gestión de Equipo', category: 'core', description: 'Directorio de miembros, altas, bajas y asignación de roles.' },
  { module: 'agenda', label: 'Agenda & Calendario', category: 'core', description: 'Citas, visitas técnicas, comités y firmas de operaciones.' },
  { module: 'colaboradores', label: 'Colaboradores Externos', category: 'core', description: 'Directorio de letrados, tasadores RICS/ECO y asesores.' },
  { module: 'contabilidad', label: 'Contabilidad & Honorarios', category: 'core', description: 'Control de cobros, facturas emitidas y liquidación de comisiones.' },
  { module: 'avisos', label: 'Avisos & Alertas', category: 'core', description: 'Notificaciones automáticas del sistema y vencimientos.' },
  { module: 'leads', label: 'Leads & Captación', category: 'core', description: 'Oportunidades de entrada vía web, portales y canal comercial.' },
  { module: 'clientes', label: 'Clientes (Inversores)', category: 'gestion', description: 'Fondos, socimis, family offices y compradores cualificados.' },
  { module: 'operaciones', label: 'Operaciones (Deals)', category: 'gestion', description: 'Kanban y tracking de compraventas, cesiones y subastas.' },
  { module: 'pbc', label: 'PBC & Compliance', category: 'gestion', description: 'Prevención de blanqueo, KYC y origen de fondos.' },
  { module: 'activos', label: 'Cartera de Activos', category: 'activos', description: 'Inventario: Open Market, Run Off, NPL e Institucional.' },
  { module: 'propietarios', label: 'Propietarios & Carteras', category: 'sistema', description: 'Bancos cedentes, servicers y fondos originadores.' },
  { module: 'importaciones', label: 'Importador Masivo', category: 'sistema', description: 'Carga masiva de carteras desde archivos Excel o CSV.' },
  { module: 'configuracion', label: 'Configuración & Seguridad', category: 'sistema', description: 'Parámetros del sistema, permisos de roles y servicios.' },
];

export type RolePermissions = Record<UserRole, AppModule[]>;

export const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    'investment',
    'inicio',
    'objetivos',
    'prescripciones',
    'reporting',
    'equipo',
    'agenda',
    'colaboradores',
    'contabilidad',
    'avisos',
    'leads',
    'clientes',
    'operaciones',
    'pbc',
    'activos',
    'propietarios',
    'importaciones',
    'configuracion',
  ],
  direction: [
    'investment',
    'inicio',
    'objetivos',
    'prescripciones',
    'reporting',
    'equipo',
    'agenda',
    'colaboradores',
    'contabilidad',
    'avisos',
    'leads',
    'clientes',
    'operaciones',
    'pbc',
    'activos',
    'propietarios',
  ],
  coordinator: [
    'inicio',
    'agenda',
    'avisos',
    'leads',
    'clientes',
    'operaciones',
    'activos',
    'colaboradores',
    'prescripciones',
    'propietarios',
  ],
  manager: [
    'inicio',
    'activos',
    'operaciones',
    'clientes',
    'agenda',
    'colaboradores',
    'prescripciones',
    'avisos',
    'propietarios',
    'importaciones',
  ],
  analyst: [
    'inicio',
    'investment',
    'activos',
    'operaciones',
    'reporting',
    'agenda',
    'avisos',
  ],
  commercial: [
    'inicio',
    'leads',
    'clientes',
    'operaciones',
    'activos',
    'prescripciones',
    'agenda',
    'avisos',
  ],
  compliance: [
    'inicio',
    'pbc',
    'clientes',
    'operaciones',
    'prescripciones',
    'colaboradores',
    'avisos',
    'agenda',
  ],
  accounting: [
    'inicio',
    'contabilidad',
    'prescripciones',
    'operaciones',
    'reporting',
    'avisos',
  ],
  viewer: [
    'inicio',
    'activos',
    'reporting',
  ],
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

export type BusinessArea = 'open_market' | 'run_off' | 'npl' | 'institutional';

export const BUSINESS_AREA_LABELS: Record<BusinessArea, { label: string; code: string; badgeColor: string }> = {
  npl: {
    label: 'NPL (Crédito y Adjudicados)',
    code: 'NPL',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
  },
  open_market: {
    label: 'Open Market (Inmuebles Singulares)',
    code: 'Open Market',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
  },
  run_off: {
    label: 'Run Off (Carteras & Desinversión)',
    code: 'Run Off',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
  },
  institutional: {
    label: 'Institucional (Grandes Patrimonios & Fondos)',
    code: 'Institucional',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
  },
};

export interface PrescriptionTimelineItem {
  id: string;
  date: string;
  author: string;
  action: string;
  comment?: string;
}

export type PrescriptionStatus = 
  | 'derivada' 
  | 'aceptada' 
  | 'en_gestion' 
  | 'cerrada_exito' 
  | 'descartada' 
  | 'vigente' 
  | 'proximo' 
  | 'vencido' 
  | 'resuelto';

export interface Prescription {
  id: string;
  reference: string;
  // Modelo de Prescripción Comercial Inter-Áreas
  origin_area?: BusinessArea;
  origin_user_id?: string;
  origin_user_name?: string;
  destination_area?: BusinessArea;
  destination_user_id?: string;
  destination_user_name?: string;
  client_id?: string;
  client_name?: string;
  asset_id?: string;
  asset_title?: string;
  deal_estimated_value?: number;
  commission_rate?: number; // % para el comercial originador (ej: 15%)
  commission_amount?: number; // Importe estimado/devengado (€)
  commission_status?: 'pendiente' | 'devengada' | 'liquidada' | 'cancelada';
  timeline?: PrescriptionTimelineItem[];

  // Campos de compatibilidad procesal/documental
  entity_type?: 'asset' | 'operation' | 'client' | 'procedimiento';
  entity_id?: string;
  entity_title?: string;
  type?: 'vencimiento_contrato' | 'prescripcion_deuda' | 'subasta' | 'notificacion_judicial' | 'garantia' | 'prescripcion_comercial';
  due_date?: string;
  status: PrescriptionStatus;
  responsible_name?: string;
  notes?: string;
  auto_alert?: boolean;
  days_remaining?: number;
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
