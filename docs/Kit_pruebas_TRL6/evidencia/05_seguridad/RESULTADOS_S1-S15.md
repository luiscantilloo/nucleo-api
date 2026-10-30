# Resultados de seguridad S1–S15 — Parienta

**Fecha UTC:** 2026-10-30 · **Commit API:** `7532fde…` (fix cuidador local `d51d880` pendiente de deploy)

| ID | Prueba | Estado | Evidencia |
|---|---|---|---|
| S1 | IDOR (people archive) | **PASS** | `S1_idor_*.log` / `S1_idor_*.json` |
| S2 / S4 / S5 | Matriz rol × recurso | **PASS** 6/6 | `matriz_*.log` |
| S3 | Cookie HttpOnly / SameSite / Secure | **PASS** (G-05) | `01_integracion/corrida_e2e_*.log` |
| S4 | Rutas sin sesión → 401 | **PASS** (G-04) | idem |
| S6 | Bloqueo por intentos | **PASS** | `S6_bloqueo_*.log` / `S6_bloqueo_*.json` |
| S7 | Política de claves | **Corregido** (pendiente re-corrida post-deploy) | `S7_claves_*.log` + commit política |
| S8 | Inyección / NoSQL login | **PASS** 2/2 | `S8_inyeccion_*.log` |
| S9 | Cabeceras HSTS / XCTO | **PASS** | `cabeceras_app_*.txt`, `cabeceras_api_*.txt` + G-07 |
| S10 | TLS (testssl) | Pendiente (sin Docker en runner) | — |
| S11 | npm audit | Generado | `npm_audit_nucleo-api.json`, `npm_audit_parienta-web.json` |
| S12 | gitleaks | Pendiente (sin Docker) | — |
| S13 | Webhooks | **N/A** | `N8N_WEBHOOK_SECRET` vacío en entorno; sin webhook entrante activo |
| S14–S15 | IA adversarial | Pendiente | — |

## S6 · detalle

- Cuenta dedicada `6.bloqueo.prueba@test.com` (no está en `roles`).
- Tras 5 fallos (`LOCK_MAX_FAILS`), la clave correcta responde **429** / mensaje de bloqueo.

## S7 · hallazgo y corrección

La política aceptaba claves débiles de ≥8 chars (`password`, `aaaaaaaaaaaa`).

- **Corrección:** `libs/common/src/password-policy.ts` — lista de comunes + rechazo de repetición de un solo carácter.
- **Verificación:** re-correr `claves.spec.js` tras el deploy de este commit.

## S8 · detalle

- Login NoSQL (`$ne`) → 4xx, sin 5xx.
- POST `/api/people` con cargas XSS/SQL/NoSQL/tamaño → sin 5xx; listado JSON sin reflejo HTML.

## S9 · cabeceras

- Front Vercel: `strict-transport-security`, `x-content-type-options`, CSP, `x-frame-options`.
- API Render: `strict-transport-security`, `x-content-type-options`, `x-frame-options: DENY`.

## S13

Sin secreto de webhook configurado en el entorno de prueba → no se ejecuta el caso positivo (obligatorio del kit). Marcar como fuera de alcance o configurar secreto y re-correr.
