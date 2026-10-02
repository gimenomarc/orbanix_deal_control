-- ============================================================
-- ORBANIX DEAL CONTROL — INITIAL SCHEMA
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum Types
CREATE TYPE user_role_enum AS ENUM ('admin', 'manager', 'analyst', 'commercial', 'accounting', 'viewer');
CREATE TYPE client_type_enum AS ENUM ('persona', 'empresa', 'fondo', 'family_office', 'institucional', 'otro');
CREATE TYPE client_status_enum AS ENUM ('activo', 'prospecto', 'inactivo', 'bloqueado');
CREATE TYPE owner_type_enum AS ENUM ('persona', 'empresa', 'banco', 'fondo', 'servicer', 'otro');
CREATE TYPE asset_branch_enum AS ENUM ('open_market', 'run_off', 'npl', 'institutional');
CREATE TYPE asset_type_enum AS ENUM ('inmobiliario', 'credito', 'NPL', 'cartera', 'institucional', 'otro');
CREATE TYPE asset_phase_enum AS ENUM ('originacion', 'analisis', 'comercializacion', 'negociacion', 'operacion', 'cierre', 'post_cierre', 'cerrado');
CREATE TYPE asset_status_enum AS ENUM ('disponible', 'en_proceso', 'reservado', 'vendido', 'baja', 'en_litigio');
CREATE TYPE operation_phase_enum AS ENUM ('nueva', 'analisis', 'propuesta', 'negociacion', 'documentacion', 'cierre', 'completada', 'cancelada');
CREATE TYPE lead_status_enum AS ENUM ('nuevo', 'contactado', 'cualificado', 'propuesta', 'negociacion', 'convertido', 'perdido');
CREATE TYPE pbc_status_enum AS ENUM ('pendiente', 'en_revision', 'incompleto', 'completo', 'rechazado', 'expirado');

-- 1. PROFILES (USERS)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    avatar_url TEXT,
    role user_role_enum NOT NULL DEFAULT 'viewer',
    department TEXT NOT NULL DEFAULT 'Inversión',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. OWNERS
CREATE TABLE IF NOT EXISTS owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type owner_type_enum NOT NULL DEFAULT 'empresa',
    tax_id TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    country TEXT NOT NULL DEFAULT 'España',
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo')),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. PORTFOLIOS
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'activa' CHECK (status IN ('activa', 'en_analisis', 'cerrada', 'liquidada')),
    total_assets INTEGER NOT NULL DEFAULT 0,
    total_nominal NUMERIC(15,2) NOT NULL DEFAULT 0,
    total_value NUMERIC(15,2) NOT NULL DEFAULT 0,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. CLIENTS
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT NOT NULL UNIQUE,
    type client_type_enum NOT NULL DEFAULT 'empresa',
    legal_name TEXT NOT NULL,
    trade_name TEXT,
    tax_id TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    website TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT NOT NULL DEFAULT 'España',
    sector TEXT,
    status client_status_enum NOT NULL DEFAULT 'activo',
    owner_id UUID REFERENCES owners(id) ON DELETE SET NULL,
    assigned_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    notes TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. ASSETS
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    asset_type asset_type_enum NOT NULL DEFAULT 'inmobiliario',
    branch asset_branch_enum NOT NULL DEFAULT 'open_market',
    phase asset_phase_enum NOT NULL DEFAULT 'originacion',
    status asset_status_enum NOT NULL DEFAULT 'disponible',
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES owners(id) ON DELETE SET NULL,
    assigned_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    nominal_value NUMERIC(15,2) NOT NULL DEFAULT 0,
    acquisition_value NUMERIC(15,2),
    current_value NUMERIC(15,2) NOT NULL DEFAULT 0,
    asking_price NUMERIC(15,2),
    currency TEXT NOT NULL DEFAULT 'EUR',
    country TEXT NOT NULL DEFAULT 'España',
    region TEXT,
    city TEXT NOT NULL,
    address TEXT,
    postal_code TEXT,
    surface NUMERIC(10,2),
    bedrooms INTEGER,
    bathrooms INTEGER,
    property_status TEXT,
    acquisition_date DATE,
    maturity_date DATE,
    recovery_estimate NUMERIC(15,2),
    collateral_description TEXT,
    notes TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. OPERATIONS
CREATE TABLE IF NOT EXISTS operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES owners(id) ON DELETE SET NULL,
    assigned_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    type TEXT NOT NULL DEFAULT 'venta' CHECK (type IN ('compra', 'venta', 'cesion_credito', 'subasta', 'arrendamiento', 'otro')),
    status TEXT NOT NULL DEFAULT 'activa' CHECK (status IN ('activa', 'en_espera', 'ganada', 'perdida', 'cancelada')),
    phase operation_phase_enum NOT NULL DEFAULT 'nueva',
    amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    expected_value NUMERIC(15,2) NOT NULL DEFAULT 0,
    final_value NUMERIC(15,2),
    probability INTEGER NOT NULL DEFAULT 50,
    expected_close_date DATE,
    actual_close_date DATE,
    notes TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. LEADS
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    source TEXT NOT NULL DEFAULT 'web',
    status lead_status_enum NOT NULL DEFAULT 'nuevo',
    priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('baja', 'media', 'alta', 'urgente')),
    assigned_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    estimated_value NUMERIC(15,2),
    next_action TEXT,
    next_action_date TIMESTAMPTZ,
    notes TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. EVENTS (AGENDA)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    all_day BOOLEAN NOT NULL DEFAULT false,
    location TEXT,
    event_type TEXT NOT NULL DEFAULT 'reunion' CHECK (event_type IN ('reunion', 'llamada', 'visita', 'firma', 'subasta', 'vencimiento', 'otro')),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    operation_id UUID REFERENCES operations(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'programado' CHECK (status IN ('programado', 'completado', 'cancelado')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. ACTIVITIES
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('llamada', 'email', 'reunion', 'nota', 'cambio_fase', 'tarea', 'documento', 'sistema')),
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size BIGINT NOT NULL DEFAULT 0,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN ('contrato', 'nota_simple', 'tasacion', 'identificacion', 'financiero', 'pbc', 'otro')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. NOTIFICATIONS (AVISOS)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'alerta', 'vencimiento', 'operacion', 'sistema')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. OBJECTIVES
CREATE TABLE IF NOT EXISTS objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    period TEXT NOT NULL CHECK (period IN ('mensual', 'trimestral', 'anual')),
    period_label TEXT NOT NULL,
    target_value NUMERIC(15,2) NOT NULL,
    current_value NUMERIC(15,2) NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'eur' CHECK (unit IN ('eur', 'operaciones', 'captaciones', 'visitas')),
    status TEXT NOT NULL DEFAULT 'en_progreso' CHECK (status IN ('en_progreso', 'alcanzado', 'riesgo')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. INVESTMENT ANALYSES
CREATE TABLE IF NOT EXISTS investment_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    thesis TEXT NOT NULL,
    assumptions TEXT,
    base_case TEXT,
    upside_case TEXT,
    downside_case TEXT,
    expected_return NUMERIC(10,2) NOT NULL DEFAULT 0,
    expected_irr NUMERIC(10,2) NOT NULL DEFAULT 0,
    expected_multiple NUMERIC(10,2) NOT NULL DEFAULT 0,
    investment_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    target_exit_value NUMERIC(15,2) NOT NULL DEFAULT 0,
    target_exit_date DATE,
    risks TEXT,
    opportunities TEXT,
    recommendation TEXT NOT NULL DEFAULT 'analizar' CHECK (recommendation IN ('comprar', 'analizar', 'descartar', 'mantener')),
    status TEXT NOT NULL DEFAULT 'borrador' CHECK (status IN ('borrador', 'en_revision', 'aprobado', 'descartado')),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. COMPLIANCE PBC
CREATE TABLE IF NOT EXISTS compliance_pbc (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT NOT NULL UNIQUE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    risk_level TEXT NOT NULL DEFAULT 'medio' CHECK (risk_level IN ('bajo', 'medio', 'alto')),
    status pbc_status_enum NOT NULL DEFAULT 'pendiente',
    kyc_verified BOOLEAN NOT NULL DEFAULT false,
    funds_source_verified BOOLEAN NOT NULL DEFAULT false,
    pep_check BOOLEAN NOT NULL DEFAULT false,
    sanctions_check BOOLEAN NOT NULL DEFAULT false,
    verification_date DATE,
    expiration_date DATE,
    incidents_count INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. PRESCRIPTIONS
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT NOT NULL UNIQUE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    entity_title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('vencimiento_contrato', 'prescripcion_deuda', 'subasta', 'notificacion_judicial', 'garantia')),
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'vigente' CHECK (status IN ('vigente', 'proximo', 'vencido', 'resuelto')),
    responsible_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    responsible_name TEXT NOT NULL DEFAULT 'Responsable Legal',
    days_remaining INTEGER NOT NULL DEFAULT 30,
    notes TEXT,
    auto_alert BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. ACCOUNTING TRANSACTIONS
CREATE TABLE IF NOT EXISTS accounting_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('ingreso', 'gasto')),
    category TEXT NOT NULL CHECK (category IN ('comision', 'honorarios', 'tasacion', 'notaria', 'registro', 'marketing', 'gestion', 'otros')),
    concept TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pagado', 'pendiente', 'cobrado', 'anulado')),
    invoice_number TEXT,
    operation_id UUID REFERENCES operations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. COLLABORATORS
CREATE TABLE IF NOT EXISTS collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company TEXT,
    type TEXT NOT NULL CHECK (type IN ('abogado', 'tasador', 'procurador', 'notario', 'agente', 'consultor', 'otro')),
    email TEXT NOT NULL,
    phone TEXT,
    specialty TEXT,
    status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 18. IMPORTS
CREATE TABLE IF NOT EXISTS imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('completado', 'en_proceso', 'fallido', 'previsualizado')),
    total_rows INTEGER NOT NULL DEFAULT 0,
    successful_rows INTEGER NOT NULL DEFAULT 0,
    failed_rows INTEGER NOT NULL DEFAULT 0,
    imported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 19. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 20. SYSTEM CONNECTIONS (Status displayed in Inicio)
CREATE TABLE IF NOT EXISTS system_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Conectado', 'Pendiente', 'Sin conexión')),
    description TEXT NOT NULL,
    detail_link TEXT,
    last_verified TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_reference ON clients(reference);
CREATE INDEX IF NOT EXISTS idx_assets_branch ON assets(branch);
CREATE INDEX IF NOT EXISTS idx_assets_phase ON assets(phase);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_reference ON assets(reference);
CREATE INDEX IF NOT EXISTS idx_operations_status ON operations(status);
CREATE INDEX IF NOT EXISTS idx_operations_phase ON operations(phase);
CREATE INDEX IF NOT EXISTS idx_operations_reference ON operations(reference);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_events_start_at ON events(start_at);
CREATE INDEX IF NOT EXISTS idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_prescriptions_due_date ON prescriptions(due_date);
