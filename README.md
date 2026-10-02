# ORBANIX DEAL CONTROL

> Plataforma profesional CRM y Deal Control de gestión de activos, operaciones, carteras y análisis de inversión inmobiliaria y financiera.

---

## 1. Stack Tecnológico

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend:** Next.js Server Actions, Route Handlers, Supabase PostgreSQL.
- **Autenticación:** Supabase Auth (RBAC: Admin, Manager, Analyst, Commercial, Accounting, Viewer).
- **Base de Datos & RLS:** PostgreSQL con Row Level Security y triggers automáticos.
- **Almacenamiento:** Supabase Storage (expedientes, documentos de activo y auditoría).
- **Hosting:** Optimizado para Vercel.

---

## 2. Estructura de Navegación

### Primer Grupo
- **Investment** (`/investment`): Tesis de inversión, escenarios (Base, Upside, Downside), cálculo de TIR, múltiplos y recomendaciones.
- **Inicio** (`/inicio`): Dashboard ejecutivo con estado de conexiones y servicios, métricas clave y agenda.
- **Objetivos** (`/objetivos`): Seguimiento de objetivos por período (mensual, trimestral, anual).
- **Prescripciones** (`/prescripciones`): Control de plazos procesales, vencimientos de contratos y prescripciones de deuda.
- **Reporting** (`/reporting`): Análisis de pipeline, volumen por rama y ratios de conversión.
- **Equipo** (`/equipo`): Directorio de usuarios, roles de acceso y departamentos.
- **Agenda** (`/agenda`): Calendario de reuniones, visitas a inmuebles y firmas notariales.
- **Colaboradores** (`/colaboradores`): Directorio de despachos de abogados, tasadores homologados y notarios.
- **Contabilidad** (`/contabilidad`): Libro financiero de comisiones, honorarios y gastos de operaciones.
- **Avisos** (`/avisos`): Centro de notificaciones y alertas urgentes.
- **Leads** (`/leads`): Embudo de captación con conversión directa a cliente/operación.

### Gestión
- **Clientes** (`/clientes`): Gestión de fondos, family offices, SOCIMIs y empresas.
- **Operaciones** (`/operaciones`): Deal pipeline en vista tabla y vista Kanban por fases.
- **PBC** (`/pbc`): Diligencia debida KYC, origen de fondos, cotejo PEP y sanciones.

### Activos (Por Ramas)
- **Open Market** (`/activos/open_market`): Activos en comercialización activa.
- **Run Off** (`/activos/run_off`): Desinversión ordenada de carteras.
- **NPL** (`/activos/npl`): Cesión de créditos y carteras en ejecución hipotecaria.
- **Institucional** (`/activos/institutional`): Operaciones de gran volumen y activos singulares.

### Footer
- **Propietarios y carteras** (`/propietarios`): Jerarquía Propietario -> Cartera -> Activos -> Operaciones.
- **Importar cartera** (`/importaciones`): Asistente de 10 pasos para migración masiva CSV/Excel.
- **Configuración** (`/configuracion`): Parámetros corporativos y verificación de servicios.

---

## 3. Instalación y Ejecución Local

### Prerrequisitos
- Node.js 18+ o superior
- npm 9+ o superior

### Pasos
```bash
# 1. Clonar el repositorio y entrar en el directorio
cd orbanix_deal_control

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local

# 4. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará accesible en: `http://localhost:3000`.

---

## 4. Configuración de Supabase

1. Crea un proyecto en [Supabase](https://supabase.com).
2. En el panel de Supabase, ve a **SQL Editor**.
3. Ejecuta la migración inicial: `supabase/migrations/00001_initial_schema.sql`.
4. Ejecuta las políticas de seguridad RLS: `supabase/migrations/00002_rls_policies.sql`.
5. Inserta los datos demo ejecutando: `supabase/seed.sql`.
6. En **Settings > API**, copia las claves y agrégalas a tu `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   ```

---

## 5. Despliegue en Vercel

1. Sube el código a tu repositorio de GitHub.
2. Inicia sesión en [Vercel](https://vercel.com) e importa el proyecto.
3. En la sección **Environment Variables**, añade:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Pulsa **Deploy**.

---

## 6. Comprobaciones de Calidad

```bash
# Verificación de TypeScript y compilación
npm run build

# Verificación de linter
npm run lint
```
