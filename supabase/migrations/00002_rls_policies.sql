-- ============================================================
-- ORBANIX DEAL CONTROL — RLS POLICIES & TRIGGERS
-- ============================================================

-- Function: update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_owners_updated_at BEFORE UPDATE ON owners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_portfolios_updated_at BEFORE UPDATE ON portfolios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_operations_updated_at BEFORE UPDATE ON operations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_investment_analyses_updated_at BEFORE UPDATE ON investment_analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_compliance_pbc_updated_at BEFORE UPDATE ON compliance_pbc FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on all tables
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

-- Helper function: get current user role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role_enum AS $$
  SELECT role FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS Policies

-- 1. Profiles
CREATE POLICY "Profiles readable by authenticated users" ON profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile or admins can update any" ON profiles
    FOR UPDATE TO authenticated
    USING (auth_user_id = auth.uid() OR get_current_user_role() = 'admin');

-- 2. System Connections
CREATE POLICY "System connections readable by all authenticated" ON system_connections
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "System connections manageable by admin" ON system_connections
    FOR ALL TO authenticated
    USING (get_current_user_role() = 'admin');

-- 3. Clients
CREATE POLICY "Clients readable by authenticated" ON clients
    FOR SELECT TO authenticated USING (deleted_at IS NULL);

CREATE POLICY "Clients insertable by authenticated" ON clients
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Clients updatable by authenticated" ON clients
    FOR UPDATE TO authenticated USING (deleted_at IS NULL);

CREATE POLICY "Clients deletable by admin and manager" ON clients
    FOR DELETE TO authenticated USING (get_current_user_role() IN ('admin', 'manager'));

-- 4. Owners & Portfolios
CREATE POLICY "Owners readable by authenticated" ON owners
    FOR SELECT TO authenticated USING (deleted_at IS NULL);

CREATE POLICY "Owners manageable by authenticated" ON owners
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Portfolios readable by authenticated" ON portfolios
    FOR SELECT TO authenticated USING (deleted_at IS NULL);

CREATE POLICY "Portfolios manageable by authenticated" ON portfolios
    FOR ALL TO authenticated USING (true);

-- 5. Assets
CREATE POLICY "Assets readable by authenticated" ON assets
    FOR SELECT TO authenticated USING (deleted_at IS NULL);

CREATE POLICY "Assets manageable by authenticated staff" ON assets
    FOR ALL TO authenticated USING (get_current_user_role() IN ('admin', 'manager', 'analyst', 'commercial'));

-- 6. Operations
CREATE POLICY "Operations readable by authenticated" ON operations
    FOR SELECT TO authenticated USING (deleted_at IS NULL);

CREATE POLICY "Operations manageable by authenticated staff" ON operations
    FOR ALL TO authenticated USING (get_current_user_role() IN ('admin', 'manager', 'commercial', 'accounting'));

-- 7. Leads
CREATE POLICY "Leads readable by authenticated" ON leads
    FOR SELECT TO authenticated USING (deleted_at IS NULL);

CREATE POLICY "Leads manageable by authenticated staff" ON leads
    FOR ALL TO authenticated USING (get_current_user_role() IN ('admin', 'manager', 'commercial'));

-- 8. Events (Agenda)
CREATE POLICY "Events readable by authenticated" ON events
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Events manageable by authenticated" ON events
    FOR ALL TO authenticated USING (true);

-- 9. Activities & Documents
CREATE POLICY "Activities readable by authenticated" ON activities
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Activities insertable by authenticated" ON activities
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Documents readable by authenticated" ON documents
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Documents manageable by authenticated" ON documents
    FOR ALL TO authenticated USING (true);

-- 10. Notifications
CREATE POLICY "Notifications visible to assigned user" ON notifications
    FOR SELECT TO authenticated
    USING (user_id IS NULL OR user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Notifications updatable by user" ON notifications
    FOR UPDATE TO authenticated
    USING (user_id IS NULL OR user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

-- 11. Investment Analyses
CREATE POLICY "Investment analyses readable by authenticated" ON investment_analyses
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Investment analyses manageable by analysts and managers" ON investment_analyses
    FOR ALL TO authenticated USING (get_current_user_role() IN ('admin', 'manager', 'analyst'));

-- 12. Compliance PBC
CREATE POLICY "PBC readable by staff" ON compliance_pbc
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "PBC manageable by admin and managers" ON compliance_pbc
    FOR ALL TO authenticated USING (get_current_user_role() IN ('admin', 'manager'));

-- 13. Prescriptions
CREATE POLICY "Prescriptions readable by authenticated" ON prescriptions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Prescriptions manageable by authenticated" ON prescriptions
    FOR ALL TO authenticated USING (true);

-- 14. Accounting
CREATE POLICY "Accounting readable by admin and accounting" ON accounting_transactions
    FOR SELECT TO authenticated USING (get_current_user_role() IN ('admin', 'accounting', 'manager'));

CREATE POLICY "Accounting manageable by admin and accounting" ON accounting_transactions
    FOR ALL TO authenticated USING (get_current_user_role() IN ('admin', 'accounting'));

-- 15. Collaborators, Imports, Audit Logs
CREATE POLICY "Collaborators readable by authenticated" ON collaborators
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Collaborators manageable by authenticated" ON collaborators
    FOR ALL TO authenticated USING (get_current_user_role() IN ('admin', 'manager', 'commercial'));

CREATE POLICY "Imports readable by authenticated" ON imports
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Imports insertable by authenticated" ON imports
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Audit logs readable by admin" ON audit_logs
    FOR SELECT TO authenticated USING (get_current_user_role() = 'admin');

CREATE POLICY "Audit logs insertable by all" ON audit_logs
    FOR INSERT TO authenticated WITH CHECK (true);
