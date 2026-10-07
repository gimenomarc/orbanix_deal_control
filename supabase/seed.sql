-- ============================================================
-- ORBANIX DEAL CONTROL — COMPLETE SEED DATA
-- ============================================================

-- 1. Profiles (Usuarios y roles reales de la organización)
INSERT INTO profiles (id, first_name, last_name, email, role, department, active) VALUES
('a0000000-0000-0000-0000-000000000001', 'Christian', 'Gracia', 'cgracia@orbanixgroup.com', 'admin', 'Administrador', true),
('a0000000-0000-0000-0000-000000000002', 'Astrid', 'Gracia', 'agracia@orbanixgroup.com', 'admin', 'Direcció & Administració', true),
('a0000000-0000-0000-0000-000000000003', 'Silvia', 'Illán', 'sillan@orbanixgroup.com', 'accounting', 'Comptabilitat', true),
('a0000000-0000-0000-0000-000000000004', 'Sandra', 'Sánchez', 'ssanchez@orbanixgroup.com', 'coordinator', 'Coordinadora', true),
('a0000000-0000-0000-0000-000000000005', 'Angélica', 'Narciso', 'anarciso@orbanixgroup.com', 'compliance', 'Analista PBC', true),
('a0000000-0000-0000-0000-000000000006', 'Juan Antonio', 'Aparicio', 'japaricio@orbanixgroup.com', 'commercial', 'Comercial', true),
('a0000000-0000-0000-0000-000000000007', 'Adrià', 'Llobet', 'allobet@orbanixgroup.com', 'commercial', 'Comercial', true),
('a0000000-0000-0000-0000-000000000008', 'Sergio', 'Ramírez', 'sramirez@orbanixgroup.com', 'commercial', 'Comercial', true),
('a0000000-0000-0000-0000-000000000009', 'Eric', 'Mauri', 'emauri@orbanixgroup.com', 'commercial', 'Comercial', true),
('a0000000-0000-0000-0000-000000000010', 'Víctor', 'Hangan', 'vhangan@orbanixgroup.com', 'commercial', 'Comercial', true),
('a0000000-0000-0000-0000-000000000000', 'Marc', 'Gimeno Cervantes', 'mgimeno@orbanixgroup.com', 'admin', 'Administración Técnica & IT', true)
ON CONFLICT (id) DO UPDATE SET 
  first_name = EXCLUDED.first_name, 
  last_name = EXCLUDED.last_name, 
  email = EXCLUDED.email, 
  role = EXCLUDED.role, 
  department = EXCLUDED.department, 
  active = EXCLUDED.active;

-- 2. System Connections
INSERT INTO system_connections (id, service_name, display_name, status, description) VALUES
('c0000000-0000-0000-0000-000000000001', 'database', 'Base de datos', 'Conectado', 'Lectura verificada.'),
('c0000000-0000-0000-0000-000000000002', 'storage', 'Archivos', 'Conectado', 'Lectura del almacenamiento verificada.'),
('c0000000-0000-0000-0000-000000000003', 'event_log', 'Registro de eventos', 'Conectado', 'Registro persistente disponible.'),
('c0000000-0000-0000-0000-000000000004', 'corporate_web', 'Web corporativa', 'Pendiente', 'Configurada; falta verificar el intercambio entre servidores.'),
('c0000000-0000-0000-0000-000000000005', 'orbanix_private', 'ORBANIX Private', 'Pendiente', 'Falta comprobar una sesión externa de extremo a extremo.'),
('c0000000-0000-0000-0000-000000000006', 'corporate_email', 'Correo corporativo', 'Sin conexión', 'Nuvalink - info@orbanixgroup.com. Conexión del buzón pendiente.'),
('c0000000-0000-0000-0000-000000000007', 'idealista', 'Idealista', 'Sin conexión', 'Configuración de credenciales de portal pendiente.')
ON CONFLICT (id) DO NOTHING;

-- 3. Entidades operativas (vacías para producción / entrada de datos reales)
-- Las tablas de operaciones, activos, clientes, leads, análisis, prescripciones, 
-- objetivos, transacciones contables y colaboradores quedan limpias.
