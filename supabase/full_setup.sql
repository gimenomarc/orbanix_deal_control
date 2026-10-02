-- ============================================================
-- ORBANIX DEAL CONTROL — COMPLETE DATABASE SETUP (ALL-IN-ONE)
-- Execute this script in Supabase Dashboard -> SQL Editor
-- URL: https://supabase.com/dashboard/project/xsxganwihqrefmuikkte/sql/new
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('admin', 'manager', 'analyst', 'commercial', 'accounting', 'viewer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE client_type_enum AS ENUM ('persona', 'empresa', 'fondo', 'family_office', 'institucional', 'otro');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE client_status_enum AS ENUM ('activo', 'prospecto', 'inactivo', 'bloqueado');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE owner_type_enum AS ENUM ('persona', 'empresa', 'banco', 'fondo', 'servicer', 'otro');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE asset_branch_enum AS ENUM ('open_market', 'run_off', 'npl', 'institutional');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE asset_type_enum AS ENUM ('inmobiliario', 'credito', 'NPL', 'cartera', 'institucional', 'otro');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE asset_phase_enum AS ENUM ('originacion', 'analisis', 'comercializacion', 'negociacion', 'operacion', 'cierre', 'post_cierre', 'cerrado');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE asset_status_enum AS ENUM ('disponible', 'en_proceso', 'reservado', 'vendido', 'baja', 'en_litigio');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE operation_phase_enum AS ENUM ('nueva', 'analisis', 'propuesta', 'negociacion', 'documentacion', 'cierre', 'completada', 'cancelada');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE lead_status_enum AS ENUM ('nuevo', 'contactado', 'cualificado', 'propuesta', 'negociacion', 'convertido', 'perdido');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE pbc_status_enum AS ENUM ('pendiente', 'en_revision', 'incompleto', 'completo', 'rechazado', 'expirado');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. TABLES

-- Profiles
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

-- Owners
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

-- Portfolios
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

-- Clients
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

-- Assets
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

-- Operations
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

-- Leads
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

-- Events (Agenda)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    all_day BOOLEAN NOT NULL DEFAULT false,
    location TEXT,
    event_type TEXT NOT NULL DEFAULT 'reunion',
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

-- Activities
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    activity_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documents
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
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'info',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Objectives
CREATE TABLE IF NOT EXISTS objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    period TEXT NOT NULL,
    period_label TEXT NOT NULL,
    target_value NUMERIC(15,2) NOT NULL,
    current_value NUMERIC(15,2) NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'eur',
    status TEXT NOT NULL DEFAULT 'en_progreso',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Investment Analyses
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
    recommendation TEXT NOT NULL DEFAULT 'analizar',
    status TEXT NOT NULL DEFAULT 'borrador',
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Compliance PBC
CREATE TABLE IF NOT EXISTS compliance_pbc (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT NOT NULL UNIQUE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    risk_level TEXT NOT NULL DEFAULT 'medio',
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

-- Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT NOT NULL UNIQUE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    entity_title TEXT NOT NULL,
    type TEXT NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'vigente',
    responsible_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    responsible_name TEXT NOT NULL DEFAULT 'Responsable Legal',
    days_remaining INTEGER NOT NULL DEFAULT 30,
    notes TEXT,
    auto_alert BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Safeguard in case table already exists from previous run
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS responsible_name TEXT NOT NULL DEFAULT 'Responsable Legal';
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS days_remaining INTEGER NOT NULL DEFAULT 30;

-- Accounting Transactions
CREATE TABLE IF NOT EXISTS accounting_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    concept TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendiente',
    invoice_number TEXT,
    operation_id UUID REFERENCES operations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Collaborators
CREATE TABLE IF NOT EXISTS collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company TEXT,
    type TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    specialty TEXT,
    status TEXT NOT NULL DEFAULT 'activo',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Imports
CREATE TABLE IF NOT EXISTS imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    total_rows INTEGER NOT NULL DEFAULT 0,
    successful_rows INTEGER NOT NULL DEFAULT 0,
    failed_rows INTEGER NOT NULL DEFAULT 0,
    imported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit Logs
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

-- System Connections
CREATE TABLE IF NOT EXISTS system_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    status TEXT NOT NULL,
    description TEXT NOT NULL,
    detail_link TEXT,
    last_verified TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. RLS POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_pbc ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_connections ENABLE ROW LEVEL SECURITY;

-- Grants & Permissive Policies for public/authenticated
DROP POLICY IF EXISTS "Public read profiles" ON profiles;
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write profiles" ON profiles;
CREATE POLICY "Public write profiles" ON profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read owners" ON owners;
CREATE POLICY "Public read owners" ON owners FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write owners" ON owners;
CREATE POLICY "Public write owners" ON owners FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read portfolios" ON portfolios;
CREATE POLICY "Public read portfolios" ON portfolios FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write portfolios" ON portfolios;
CREATE POLICY "Public write portfolios" ON portfolios FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read clients" ON clients;
CREATE POLICY "Public read clients" ON clients FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write clients" ON clients FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read assets" ON assets;
CREATE POLICY "Public read assets" ON assets FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write assets" ON assets FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read operations" ON operations;
CREATE POLICY "Public read operations" ON operations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write operations" ON operations FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read leads" ON leads;
CREATE POLICY "Public read leads" ON leads FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write leads" ON leads FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read events" ON events;
CREATE POLICY "Public read events" ON events FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write events" ON events FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read activities" ON activities;
CREATE POLICY "Public read activities" ON activities FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write activities" ON activities FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read documents" ON documents;
CREATE POLICY "Public read documents" ON documents FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write documents" ON documents FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read notifications" ON notifications;
CREATE POLICY "Public read notifications" ON notifications FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write notifications" ON notifications FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read objectives" ON objectives;
CREATE POLICY "Public read objectives" ON objectives FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write objectives" ON objectives FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read analyses" ON investment_analyses;
CREATE POLICY "Public read analyses" ON investment_analyses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write analyses" ON investment_analyses FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read pbc" ON compliance_pbc;
CREATE POLICY "Public read pbc" ON compliance_pbc FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write pbc" ON compliance_pbc FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read prescriptions" ON prescriptions;
CREATE POLICY "Public read prescriptions" ON prescriptions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write prescriptions" ON prescriptions FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read accounting" ON accounting_transactions;
CREATE POLICY "Public read accounting" ON accounting_transactions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write accounting" ON accounting_transactions FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read collaborators" ON collaborators;
CREATE POLICY "Public read collaborators" ON collaborators FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write collaborators" ON collaborators FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read imports" ON imports;
CREATE POLICY "Public read imports" ON imports FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write imports" ON imports FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read audit_logs" ON audit_logs;
CREATE POLICY "Public read audit_logs" ON audit_logs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write audit_logs" ON audit_logs FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read connections" ON system_connections;
CREATE POLICY "Public read connections" ON system_connections FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write connections" ON system_connections FOR ALL USING (true);

-- 5. INITIAL SEED DATA
INSERT INTO profiles (id, first_name, last_name, email, role, department, active) VALUES
('a0000000-0000-0000-0000-000000000001', 'Administración', 'ORBANIX GROUP', 'admin@orbanixgroup.com', 'admin', 'Dirección General', true),
('a0000000-0000-0000-0000-000000000002', 'Lucía', 'Serrano Vega', 'lserrano@orbanixgroup.com', 'manager', 'Gestión de Activos', true),
('a0000000-0000-0000-0000-000000000003', 'Carlos', 'Gómez Vidal', 'cgomez@orbanixgroup.com', 'analyst', 'Análisis & Investment', true),
('a0000000-0000-0000-0000-000000000004', 'Elena', 'Romero Ruiz', 'eromero@orbanixgroup.com', 'commercial', 'Desarrollo de Negocio', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO system_connections (id, service_name, display_name, status, description) VALUES
('c0000000-0000-0000-0000-000000000001', 'database', 'Base de datos', 'Conectado', 'Lectura verificada.'),
('c0000000-0000-0000-0000-000000000002', 'storage', 'Archivos', 'Conectado', 'Lectura del almacenamiento verificada.'),
('c0000000-0000-0000-0000-000000000003', 'event_log', 'Registro de eventos', 'Conectado', 'Registro persistente disponible.'),
('c0000000-0000-0000-0000-000000000004', 'corporate_web', 'Web corporativa', 'Pendiente', 'Configurada; falta verificar el intercambio entre servidores.'),
('c0000000-0000-0000-0000-000000000005', 'orbanix_private', 'ORBANIX Private', 'Pendiente', 'Falta comprobar una sesión externa de extremo a extremo.'),
('c0000000-0000-0000-0000-000000000006', 'corporate_email', 'Correo corporativo', 'Sin conexión', 'Nuvalink - info@orbanixgroup.com. Conexión del buzón pendiente.'),
('c0000000-0000-0000-0000-000000000007', 'idealista', 'Idealista', 'Sin conexión', 'Configuración de credenciales de portal pendiente.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO owners (id, reference, name, type, tax_id, email, phone, city, country, status) VALUES
('b0000000-0000-0000-0000-000000000001', 'OWN-000001', 'Santander Real Estate S.A.', 'banco', 'A-28000001', 'activos@santanderinmuebles.es', '+34 912 345 678', 'Madrid', 'España', 'activo'),
('b0000000-0000-0000-0000-000000000002', 'OWN-000002', 'Blackstone Iberia Capital', 'fondo', 'B-87000002', 'dispositions@blackstoneiberia.com', '+34 914 567 890', 'Madrid', 'España', 'activo'),
('b0000000-0000-0000-0000-000000000003', 'OWN-000003', 'Servihabitat RE Opportunities', 'servicer', 'A-08000003', 'carteras@servihabitat.com', '+34 932 112 233', 'Barcelona', 'España', 'activo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO portfolios (id, reference, name, owner_id, description, status, total_assets, total_nominal, total_value) VALUES
('d0000000-0000-0000-0000-000000000001', 'PORT-000001', 'Cartera Residencial Prime Madrid', 'b0000000-0000-0000-0000-000000000001', 'Activos residenciales de alta rentabilidad en zona centro', 'activa', 4, 18500000.00, 21200000.00),
('d0000000-0000-0000-0000-000000000002', 'PORT-000002', 'Cartera NPL Levante 2026', 'b0000000-0000-0000-0000-000000000002', 'Créditos hipotecarios asegurados con primera carga inmobiliaria', 'activa', 8, 34200000.00, 19800000.00),
('d0000000-0000-0000-0000-000000000003', 'PORT-000003', 'Run-off Comercial & Logístico', 'b0000000-0000-0000-0000-000000000003', 'Desinversión ordenada de naves logísticas y medianas superficies', 'activa', 3, 12800000.00, 14500000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO clients (id, reference, type, legal_name, trade_name, tax_id, email, phone, city, status, sector) VALUES
('e0000000-0000-0000-0000-000000000001', 'CLI-000001', 'fondo', 'Merlin Properties SOCIMI S.A.', 'Merlin Properties', 'A-86847214', 'inversiones@merlinprop.com', '+34 917 875 530', 'Madrid', 'activo', 'Inmobiliario Terciario'),
('e0000000-0000-0000-0000-000000000002', 'CLI-000002', 'family_office', 'Azora Capital Partners S.L.', 'Azora', 'B-83675841', 'deals@azora.com', '+34 913 106 370', 'Madrid', 'activo', 'Gestión Patrimonial'),
('e0000000-0000-0000-0000-000000000003', 'CLI-000003', 'institucional', 'Pamplona Capital Management', 'Pamplona Capital', 'A-08223344', 'contact@pamplonacap.com', '+34 934 990 011', 'Barcelona', 'activo', 'Private Equity')
ON CONFLICT (id) DO NOTHING;

INSERT INTO assets (id, reference, title, asset_type, branch, phase, status, portfolio_id, owner_id, assigned_user_id, nominal_value, current_value, asking_price, city, address, surface) VALUES
('f0000000-0000-0000-0000-000000000001', 'AST-000001', 'Edificio Residencial Santa Engracia', 'inmobiliario', 'open_market', 'comercializacion', 'disponible', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 4500000.00, 5200000.00, 5450000.00, 'Madrid', 'Calle Santa Engracia 42', 1850.00),
('f0000000-0000-0000-0000-000000000002', 'AST-000002', 'Promoción Residencial Diagonal Mar', 'inmobiliario', 'open_market', 'negociacion', 'en_proceso', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 3800000.00, 4100000.00, 4250000.00, 'Barcelona', 'Avinguda Diagonal 12', 1240.00),
('f0000000-0000-0000-0000-000000000003', 'AST-000003', 'Nave Logística Corredor del Henares', 'inmobiliario', 'run_off', 'analisis', 'disponible', 'd0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 6200000.00, 6800000.00, 7100000.00, 'Coslada', 'Av. de la Industria 88', 8400.00),
('f0000000-0000-0000-0000-000000000004', 'AST-000004', 'Cesión de Crédito Complejo San Juan', 'NPL', 'npl', 'operacion', 'en_proceso', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 8900000.00, 4900000.00, 5200000.00, 'Alicante', 'Playa San Juan s/n', 4500.00),
('f0000000-0000-0000-0000-000000000005', 'AST-000005', 'Sede Corporativa Distrito 22@', 'institucional', 'institutional', 'analisis', 'disponible', NULL, 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 16500000.00, 18200000.00, 18900000.00, 'Barcelona', 'Carrer de Pujades 100', 6200.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO operations (id, reference, title, asset_id, client_id, assigned_user_id, type, status, phase, amount, expected_value, probability, expected_close_date) VALUES
('10000000-0000-0000-0000-000000000001', 'OP-000001', 'Venta Santa Engracia a Merlin', 'f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'venta', 'activa', 'propuesta', 5300000.00, 5300000.00, 70, '2026-11-15'),
('10000000-0000-0000-0000-000000000002', 'OP-000002', 'Adquisición NPL San Juan por Azora', 'f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'cesion_credito', 'activa', 'negociacion', 5050000.00, 5100000.00, 85, '2026-10-30')
ON CONFLICT (id) DO NOTHING;

INSERT INTO leads (id, reference, name, company, email, phone, source, status, priority, estimated_value, next_action, next_action_date) VALUES
('20000000-0000-0000-0000-000000000001', 'LEAD-000001', 'Javier Fernández', 'Iberian Core Partners', 'jfernandez@ibercore.com', '+34 600 112 233', 'web', 'cualificado', 'alta', 7500000.00, 'Enviar dossier técnico de Santa Engracia', '2026-10-06 10:00:00+02'),
('20000000-0000-0000-0000-000000000002', 'LEAD-000002', 'Beatriz Montero', 'Aliseda Advisory', 'bmontero@aliseda.es', '+34 622 334 455', 'idealista', 'nuevo', 'media', 3200000.00, 'Primer contacto telefónico', '2026-10-05 16:30:00+02')
ON CONFLICT (id) DO NOTHING;

INSERT INTO investment_analyses (id, asset_id, title, thesis, assumptions, base_case, upside_case, downside_case, expected_return, expected_irr, expected_multiple, investment_amount, target_exit_value, target_exit_date, recommendation, status) VALUES
('30000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'Plan Transformación Santa Engracia', 'Rehabilitación integral para build-to-rent prime en Madrid centro', 'Coste de obra 1.200 €/m2, periodo de ejecución 14 meses', 'Rentabilidad neta del 7.2% con desinversión a yield 4.5%', 'Salida unitaria a 7.500 €/m2 residencial', 'Demoras en licencias de 6 meses adicionales', 24.50, 18.20, 1.45, 5200000.00, 7540000.00, '2028-06-30', 'comprar', 'aprobado')
ON CONFLICT (id) DO NOTHING;

INSERT INTO compliance_pbc (id, reference, client_id, risk_level, status, kyc_verified, funds_source_verified, pep_check, sanctions_check, verification_date, expiration_date) VALUES
('40000000-0000-0000-0000-000000000001', 'PBC-000001', 'e0000000-0000-0000-0000-000000000001', 'bajo', 'completo', true, true, true, true, '2026-01-15', '2027-01-15'),
('40000000-0000-0000-0000-000000000002', 'PBC-000002', 'e0000000-0000-0000-0000-000000000002', 'medio', 'en_revision', true, false, true, true, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO prescriptions (id, reference, entity_type, entity_id, entity_title, type, due_date, status, responsible_name, days_remaining) VALUES
('50000000-0000-0000-0000-000000000001', 'PRE-000001', 'asset', 'f0000000-0000-0000-0000-000000000004', 'Cesión de Crédito San Juan', 'prescripcion_deuda', '2026-11-20', 'proximo', 'Lucía Serrano', 49),
('50000000-0000-0000-0000-000000000002', 'PRE-000002', 'operation', '10000000-0000-0000-0000-000000000001', 'Venta Santa Engracia a Merlin', 'vencimiento_contrato', '2026-12-15', 'vigente', 'Elena Romero', 74)
ON CONFLICT (id) DO NOTHING;

INSERT INTO objectives (id, title, user_id, period, period_label, target_value, current_value, unit, status) VALUES
('60000000-0000-0000-0000-000000000001', 'Volumen de Transacciones Q4 2026', 'a0000000-0000-0000-0000-000000000002', 'trimestral', 'Q4 2026', 15000000.00, 10350000.00, 'eur', 'en_progreso'),
('60000000-0000-0000-0000-000000000002', 'Nuevos Mandatos Institucionales', 'a0000000-0000-0000-0000-000000000004', 'mensual', 'Octubre 2026', 4.00, 3.00, 'captaciones', 'en_progreso')
ON CONFLICT (id) DO NOTHING;

INSERT INTO accounting_transactions (id, reference, type, category, concept, amount, date, status, invoice_number) VALUES
('70000000-0000-0000-0000-000000000001', 'ACC-000001', 'ingreso', 'comision', 'Comisión de éxito cierre Cartera Valencia', 78500.00, '2026-09-28', 'cobrado', 'FRA-2026-089'),
('70000000-0000-0000-0000-000000000002', 'ACC-000002', 'gasto', 'tasacion', 'Due Diligence técnica Edificio Santa Engracia (Tinsa)', 4200.00, '2026-10-01', 'pagado', 'EXP-2026-112')
ON CONFLICT (id) DO NOTHING;

INSERT INTO collaborators (id, name, company, type, email, phone, specialty, status) VALUES
('80000000-0000-0000-0000-000000000001', 'Rodrigo Gómez-Acebo', 'Gómez-Acebo & Pombo Abogados', 'abogado', 'rgomez@gap.es', '+34 915 829 100', 'Derecho Inmobiliario y NPL', 'activo'),
('80000000-0000-0000-0000-000000000002', 'Teresa Navarro', 'CBRE Valuation Services', 'tasador', 'tnavarro@cbre.es', '+34 915 981 900', 'Valoraciones RICS & ECO', 'activo')
ON CONFLICT (id) DO NOTHING;
