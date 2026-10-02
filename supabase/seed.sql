-- ============================================================
-- ORBANIX DEAL CONTROL — COMPLETE SEED DATA
-- ============================================================

-- 1. Profiles
INSERT INTO profiles (id, first_name, last_name, email, role, department, active) VALUES
('a0000000-0000-0000-0000-000000000001', 'Administración', 'ORBANIX GROUP', 'admin@orbanixgroup.com', 'admin', 'Dirección General', true),
('a0000000-0000-0000-0000-000000000002', 'Lucía', 'Serrano Vega', 'lserrano@orbanixgroup.com', 'manager', 'Gestión de Activos', true),
('a0000000-0000-0000-0000-000000000003', 'Carlos', 'Gómez Vidal', 'cgomez@orbanixgroup.com', 'analyst', 'Análisis & Investment', true),
('a0000000-0000-0000-0000-000000000004', 'Elena', 'Romero Ruiz', 'eromero@orbanixgroup.com', 'commercial', 'Desarrollo de Negocio', true)
ON CONFLICT (id) DO NOTHING;

-- 2. System Connections (matches reference screenshot exactly)
INSERT INTO system_connections (id, service_name, display_name, status, description) VALUES
('c0000000-0000-0000-0000-000000000001', 'database', 'Base de datos', 'Conectado', 'Lectura verificada.'),
('c0000000-0000-0000-0000-000000000002', 'storage', 'Archivos', 'Conectado', 'Lectura del almacenamiento verificada.'),
('c0000000-0000-0000-0000-000000000003', 'event_log', 'Registro de eventos', 'Conectado', 'Registro persistente disponible.'),
('c0000000-0000-0000-0000-000000000004', 'corporate_web', 'Web corporativa', 'Pendiente', 'Configurada; falta verificar el intercambio entre servidores.'),
('c0000000-0000-0000-0000-000000000005', 'orbanix_private', 'ORBANIX Private', 'Pendiente', 'Falta comprobar una sesión externa de extremo a extremo.'),
('c0000000-0000-0000-0000-000000000006', 'corporate_email', 'Correo corporativo', 'Sin conexión', 'Nuvalink - info@orbanixgroup.com. Conexión del buzón pendiente.'),
('c0000000-0000-0000-0000-000000000007', 'idealista', 'Idealista', 'Sin conexión', 'Configuración de credenciales de portal pendiente.')
ON CONFLICT (id) DO NOTHING;

-- 3. Owners
INSERT INTO owners (id, reference, name, type, tax_id, email, phone, city, country, status) VALUES
('b0000000-0000-0000-0000-000000000001', 'OWN-000001', 'Santander Real Estate S.A.', 'banco', 'A-28000001', 'activos@santanderinmuebles.es', '+34 912 345 678', 'Madrid', 'España', 'activo'),
('b0000000-0000-0000-0000-000000000002', 'OWN-000002', 'Blackstone Iberia Capital', 'fondo', 'B-87000002', 'dispositions@blackstoneiberia.com', '+34 914 567 890', 'Madrid', 'España', 'activo'),
('b0000000-0000-0000-0000-000000000003', 'OWN-000003', 'Servihabitat RE Opportunities', 'servicer', 'A-08000003', 'carteras@servihabitat.com', '+34 932 112 233', 'Barcelona', 'España', 'activo')
ON CONFLICT (id) DO NOTHING;

-- 4. Portfolios
INSERT INTO portfolios (id, reference, name, owner_id, description, status, total_assets, total_nominal, total_value) VALUES
('d0000000-0000-0000-0000-000000000001', 'PORT-000001', 'Cartera Residencial Prime Madrid', 'b0000000-0000-0000-0000-000000000001', 'Activos residenciales de alta rentabilidad en zona centro', 'activa', 4, 18500000.00, 21200000.00),
('d0000000-0000-0000-0000-000000000002', 'PORT-000002', 'Cartera NPL Levante 2026', 'b0000000-0000-0000-0000-000000000002', 'Créditos hipotecarios asegurados con primera carga inmobiliaria', 'activa', 8, 34200000.00, 19800000.00),
('d0000000-0000-0000-0000-000000000003', 'PORT-000003', 'Run-off Comercial & Logístico', 'b0000000-0000-0000-0000-000000000003', 'Desinversión ordenada de naves logísticas y medianas superficies', 'activa', 3, 12800000.00, 14500000.00)
ON CONFLICT (id) DO NOTHING;

-- 5. Clients
INSERT INTO clients (id, reference, type, legal_name, trade_name, tax_id, email, phone, city, status, sector) VALUES
('e0000000-0000-0000-0000-000000000001', 'CLI-000001', 'fondo', 'Merlin Properties SOCIMI S.A.', 'Merlin Properties', 'A-86847214', 'inversiones@merlinprop.com', '+34 917 875 530', 'Madrid', 'activo', 'Inmobiliario Terciario'),
('e0000000-0000-0000-0000-000000000002', 'CLI-000002', 'family_office', 'Azora Capital Partners S.L.', 'Azora', 'B-83675841', 'deals@azora.com', '+34 913 106 370', 'Madrid', 'activo', 'Gestión Patrimonial'),
('e0000000-0000-0000-0000-000000000003', 'CLI-000003', 'institucional', 'Pamplona Capital Management', 'Pamplona Capital', 'A-08223344', 'contact@pamplonacap.com', '+34 934 990 011', 'Barcelona', 'activo', 'Private Equity')
ON CONFLICT (id) DO NOTHING;

-- 6. Assets
INSERT INTO assets (id, reference, title, asset_type, branch, phase, status, portfolio_id, owner_id, assigned_user_id, nominal_value, current_value, asking_price, city, address, surface) VALUES
('f0000000-0000-0000-0000-000000000001', 'AST-000001', 'Edificio Residencial Santa Engracia', 'inmobiliario', 'open_market', 'comercializacion', 'disponible', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 4500000.00, 5200000.00, 5450000.00, 'Madrid', 'Calle Santa Engracia 42', 1850.00),
('f0000000-0000-0000-0000-000000000002', 'AST-000002', 'Promoción Residencial Diagonal Mar', 'inmobiliario', 'open_market', 'negociacion', 'en_proceso', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 3800000.00, 4100000.00, 4250000.00, 'Barcelona', 'Avinguda Diagonal 12', 1240.00),
('f0000000-0000-0000-0000-000000000003', 'AST-000003', 'Nave Logística Corredor del Henares', 'inmobiliario', 'run_off', 'analisis', 'disponible', 'd0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 6200000.00, 6800000.00, 7100000.00, 'Coslada', 'Av. de la Industria 88', 8400.00),
('f0000000-0000-0000-0000-000000000004', 'AST-000004', 'Cesión de Crédito Complejo San Juan', 'NPL', 'npl', 'operacion', 'en_proceso', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 8900000.00, 4900000.00, 5200000.00, 'Alicante', 'Playa San Juan s/n', 4500.00),
('f0000000-0000-0000-0000-000000000005', 'AST-000005', 'Sede Corporativa Distrito 22@', 'institucional', 'institutional', 'analisis', 'disponible', NULL, 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 16500000.00, 18200000.00, 18900000.00, 'Barcelona', 'Carrer de Pujades 100', 6200.00)
ON CONFLICT (id) DO NOTHING;

-- 7. Operations
INSERT INTO operations (id, reference, title, asset_id, client_id, assigned_user_id, type, status, phase, amount, expected_value, probability, expected_close_date) VALUES
('10000000-0000-0000-0000-000000000001', 'OP-000001', 'Venta Santa Engracia a Merlin', 'f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'venta', 'activa', 'propuesta', 5300000.00, 5300000.00, 70, '2026-11-15'),
('10000000-0000-0000-0000-000000000002', 'OP-000002', 'Adquisición NPL San Juan por Azora', 'f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'cesion_credito', 'activa', 'negociacion', 5050000.00, 5100000.00, 85, '2026-10-30')
ON CONFLICT (id) DO NOTHING;

-- 8. Leads
INSERT INTO leads (id, reference, name, company, email, phone, source, status, priority, estimated_value, next_action, next_action_date) VALUES
('20000000-0000-0000-0000-000000000001', 'LEAD-000001', 'Javier Fernández', 'Iberian Core Partners', 'jfernandez@ibercore.com', '+34 600 112 233', 'web', 'cualificado', 'alta', 7500000.00, 'Enviar dossier técnico de Santa Engracia', '2026-10-06 10:00:00+02'),
('20000000-0000-0000-0000-000000000002', 'LEAD-000002', 'Beatriz Montero', 'Aliseda Advisory', 'bmontero@aliseda.es', '+34 622 334 455', 'idealista', 'nuevo', 'media', 3200000.00, 'Primer contacto telefónico', '2026-10-05 16:30:00+02')
ON CONFLICT (id) DO NOTHING;

-- 9. Investment Analyses
INSERT INTO investment_analyses (id, asset_id, title, thesis, assumptions, base_case, upside_case, downside_case, expected_return, expected_irr, expected_multiple, investment_amount, target_exit_value, target_exit_date, recommendation, status) VALUES
('30000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'Plan Transformación Santa Engracia', 'Rehabilitación integral para build-to-rent prime en Madrid centro', 'Coste de obra 1.200 €/m2, periodo de ejecución 14 meses', 'Rentabilidad neta del 7.2% con desinversión a yield 4.5%', 'Salida unitaria a 7.500 €/m2 residencial', 'Demoras en licencias de 6 meses adicionales', 24.50, 18.20, 1.45, 5200000.00, 7540000.00, '2028-06-30', 'comprar', 'aprobado')
ON CONFLICT (id) DO NOTHING;

-- 10. Compliance PBC
INSERT INTO compliance_pbc (id, reference, client_id, risk_level, status, kyc_verified, funds_source_verified, pep_check, sanctions_check, verification_date, expiration_date) VALUES
('40000000-0000-0000-0000-000000000001', 'PBC-000001', 'e0000000-0000-0000-0000-000000000001', 'bajo', 'completo', true, true, true, true, '2026-01-15', '2027-01-15'),
('40000000-0000-0000-0000-000000000002', 'PBC-000002', 'e0000000-0000-0000-0000-000000000002', 'medio', 'en_revision', true, false, true, true, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- 11. Prescriptions
INSERT INTO prescriptions (id, reference, entity_type, entity_id, entity_title, type, due_date, status, responsible_name, days_remaining) VALUES
('50000000-0000-0000-0000-000000000001', 'PRE-000001', 'asset', 'f0000000-0000-0000-0000-000000000004', 'Cesión de Crédito San Juan', 'prescripcion_deuda', '2026-11-20', 'proximo', 'Lucía Serrano', 49),
('50000000-0000-0000-0000-000000000002', 'PRE-000002', 'operation', '10000000-0000-0000-0000-000000000001', 'Venta Santa Engracia a Merlin', 'vencimiento_contrato', '2026-12-15', 'vigente', 'Elena Romero', 74)
ON CONFLICT (id) DO NOTHING;

-- 12. Objectives
INSERT INTO objectives (id, title, user_id, period, period_label, target_value, current_value, unit, status) VALUES
('60000000-0000-0000-0000-000000000001', 'Volumen de Transacciones Q4 2026', 'a0000000-0000-0000-0000-000000000002', 'trimestral', 'Q4 2026', 15000000.00, 10350000.00, 'eur', 'en_progreso'),
('60000000-0000-0000-0000-000000000002', 'Nuevos Mandatos Institucionales', 'a0000000-0000-0000-0000-000000000004', 'mensual', 'Octubre 2026', 4.00, 3.00, 'captaciones', 'en_progreso')
ON CONFLICT (id) DO NOTHING;

-- 13. Accounting
INSERT INTO accounting_transactions (id, reference, type, category, concept, amount, date, status, invoice_number) VALUES
('70000000-0000-0000-0000-000000000001', 'ACC-000001', 'ingreso', 'comision', 'Comisión de éxito cierre Cartera Valencia', 78500.00, '2026-09-28', 'cobrado', 'FRA-2026-089'),
('70000000-0000-0000-0000-000000000002', 'ACC-000002', 'gasto', 'tasacion', 'Due Diligence técnica Edificio Santa Engracia (Tinsa)', 4200.00, '2026-10-01', 'pagado', 'EXP-2026-112')
ON CONFLICT (id) DO NOTHING;

-- 14. Collaborators
INSERT INTO collaborators (id, name, company, type, email, phone, specialty, status) VALUES
('80000000-0000-0000-0000-000000000001', 'Rodrigo Gómez-Acebo', 'Gómez-Acebo & Pombo Abogados', 'abogado', 'rgomez@gap.es', '+34 915 829 100', 'Derecho Inmobiliario y NPL', 'activo'),
('80000000-0000-0000-0000-000000000002', 'Teresa Navarro', 'CBRE Valuation Services', 'tasador', 'tnavarro@cbre.es', '+34 915 981 900', 'Valoraciones RICS & ECO', 'activo')
ON CONFLICT (id) DO NOTHING;

-- 15. Notifications
INSERT INTO notifications (id, user_id, type, title, message, entity_type, entity_id) VALUES
('90000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'alerta', 'Vencimiento de prescripción próximo', 'El activo Cesión de Crédito San Juan vence en 49 días.', 'asset', 'f0000000-0000-0000-0000-000000000004'),
('90000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'info', 'Nuevo análisis de inversión registrado', 'Se ha creado el análisis para Edificio Santa Engracia.', 'investment', '30000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;
