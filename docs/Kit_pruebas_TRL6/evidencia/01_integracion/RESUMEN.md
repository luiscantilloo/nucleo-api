# C1 · Integración (Parienta)

**Fecha UTC:** 2026-10-30 · **Commit:** `7532fde359824a582c4f3dd068062dd8e0f27a3e` · **Front:** `https://parienta-web.vercel.app` · **API:** `https://nucleo-api-k3fo.onrender.com` (`x-program-id: parienta`)

## Resultado

| Suite | Casos | Estado | Log |
|---|---|---|---|
| `e2e.spec.js` (G-01…G-08) | 20 | **PASS** | `corrida_e2e_*.log` |
| `flujos.spec.js` F1 crisis→clínico | 4 | **PASS** | `corrida_flujos_f1_*.log` |

## Notas

- Alcance: **solo Parienta** (NARA fuera de este paquete).
- `/api/auth/me` sin sesión → `200` + `user:null` (contrato del front); G-04 usa `/api/accounts` y `/api/patients`.
- Roles ejercidos: admin, admin2, experto, clínico, paciente, paciente2, observador, cuidador.
- F1: alta persona → alerta crisis+GPS → clínico la ve en `/api/app-state`; cuidador alerta sobre persona ya vinculada.

## Fallas / omisiones

Ninguna en C1. Ver hallazgo **S7** en `05_seguridad/RESULTADOS_S1-S15.md`.
