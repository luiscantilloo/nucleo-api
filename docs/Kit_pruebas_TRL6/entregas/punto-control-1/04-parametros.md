# Parámetros de las pruebas (E1) — Parienta

**Se llena antes de correr cualquier prueba y lo firman el responsable técnico y el responsable del proyecto.** Desde la firma, estos valores no cambian. Todo cambio posterior va en la sección 9 o en una adenda (`plantillas/adenda-parametros.md`), y solo vale con la firma del responsable del proyecto.

**Sistema:** Parienta (NucleoCare / `nucleo-api` con `x-program-id: parienta`) · **Objetivo:** TRL 6 · **Versión del documento:** `2` · **Fecha:** `2026-10-30`

> Alcance de esta corrida: **solo Parienta**. NARA queda fuera del paquete de pruebas.

### 1. Sistema y entorno

| Campo | Valor |
|---|---|
| Nombre del sistema | **Parienta** — front `parienta-web` + API `nucleo-api` (programa `parienta`) |
| Qué hace (una línea) | Acompañamiento en salud mental comunitaria: cuidadores, crisis/GPS, tablero clínico y ruta del paciente |
| URL de la aplicación (entorno de pruebas) | `https://parienta-web.vercel.app` |
| URL de la API | `https://nucleo-api-k3fo.onrender.com` (cabecera `x-program-id: parienta`) |
| Endpoint de salud que devuelve el commit desplegado | `GET /api/health` con `x-program-id: parienta` → `{ ok, service:"nucleo-gateway", programId:"parienta", commit }` |
| ¿Producción o entorno equivalente? | **Producción** (Render 1c-2g + Vercel Production) |
| Si es equivalente, la tabla de equivalencia | N/A — se prueba sobre la infraestructura real |
| Repositorios y rama | `luiscantilloo/nucleo-api` → `main` · `luiscantilloo/plateado-web` (Parienta) → `main` |
| Tecnología (frontend, API y base de datos) | Front: Next.js (Vercel) · API: NestJS + proxy · DB: MongoDB Atlas `nucleo_parienta` |
| Hosting de cada parte | Front: Vercel · API: Render Ohio `1c-2g` · Mongo: Atlas |

### 2. Roles y cuentas de prueba

**Las claves no van aquí.** Canal privado → variables `PASS_<ROL>` (p. ej. `PASS_ADMIN`).

| Rol | Qué hace | Cuenta de prueba | Cuenta de reserva / IDOR | Activa |
|---|---|---|---|---|
| admin | Administración del programa | `1.admin.prueba@test.com` | `1b.admin2.prueba@test.com` (IDOR mismo rol) · `admin.prueba@parienta.co` | Sí |
| experto | Campo / visitas | `2.experto.prueba@test.com` | — | Sí |
| clinico | Tablero clínico / crisis | `3.clinico.prueba@test.com` | — | Sí |
| paciente | Pantalla paciente | `4.paciente.prueba@test.com` | `4b.paciente2.prueba@test.com` (IDOR) | Sí |
| observador | Solo lectura | `5.observador.prueba@test.com` | — | Sí |
| cuidador | Crisis + GPS | `cuidador.prueba1@parienta.co` | `cuidador.prueba2@parienta.co` | Sí (clave aparte) |
| bloqueo (S6) | Solo bloqueo | (crear cuenta dedicada) | — | Pendiente |

- **Prefijo de los datos de prueba:** `TRL-QA-2026-10-30-`
- **Espacio de prueba:** DB Atlas `nucleo_parienta`

### 3. Flujos principales

| ID | Flujo | Roles | ¿Es el de punta a punta? |
|---|---|---|---|
| F1 | Alta/paciente → cuidador reporta crisis+GPS → clínico toma/gestiona | admin/cuidador → clinico | **Sí** |
| F2 | Ingreso por rol y pantallas de inicio | todos los roles de la tabla | No (C1 G-02) |
| F3 | TEO / IA (si habilitado) | paciente o clínico | No (C6 / S15) |

### 4. Carga y estabilidad

| Parámetro | Valor | Cómo se calculó |
|---|---|---|
| **Concurrencia objetivo** | **20** VU | Pico demo Parienta × margen; ajustable solo con adenda |
| Mezcla de roles | admin 5 %, experto 25 %, clínico 15 %, paciente 45 %, observador 10 % | k6.config.json |
| Rutas por rol | `/api/auth/me`, `/api/accounts`, `/api/patients`, `/api/people`, `/api/territories`, `/api/flags`, `/api/accounts/me` | Medidas en gateway |
| Duración del soak | 2 h mínimo | Kit |
| Estrés | Hasta 4 × 20 = **80** VU | Kit |
| Umbrales | p95 < 2 s · errores < 1 % · degradación ≤ 10 % | **Fijos** |

### 5. Recuperación

| Parámetro | Valor |
|---|---|
| **RTO** | **60 minutos** |
| **RPO** | **24 horas** |
| Entorno de restauración | DB temporal `nucleo_parienta_restore_*` (nunca sobre producción) |

### 6. Integraciones

| Integración | Para qué | ¿Recibe datos personales? | Autenticación | **¿En C6?** | ¿Webhook entrante? (S13) |
|---|---|---|---|---|---|
| (completar según despliegue) | — | — | — | — | — |

### 7–9. Firmas

Ver `entregas/punto-control-1/04-parametros.md` y firmas E1 / D5 / D4 del PC1.
