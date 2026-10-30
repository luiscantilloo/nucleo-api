# Punto de control 1 · NucleoCare dual (Parienta + NARA)

**Fecha del paquete:** 2026-10-30 (UTC)  
**Estado PC1:** E1, D5 y D4 **aprobados** el 2026-10-30 por Luis Cantillo (dueño del sistema / responsable del proyecto).  
**Siguiente:** siembra cuentas `TRL-QA-*` y corrida automática (fase de corrección → PC2).

## Contenido de este paquete

| Archivo | Descripción |
|---|---|
| `04-parametros.md` | E1 lleno para el sistema dual (producción Render + Vercel) |
| `autorizacion-pruebas-destructivas.md` | D5 borrador listo para firma (periodo 2026-10-30 → 2026-11-20) |
| `aprobacion-flujo-datos-IA.md` | D4 borrador (Gemini / OpenAI / n8n TEO) |
| `participantes-sesiones.md` | Códigos de participantes C2/C8 (nombres en custodia RP) |
| `evidencia/00_version/` | Salud dual + por programa + fronts (commit `7532fde…`) |
| `Kit-TRL6-documento-completo.md` | Guía completa del kit (referencia) |

## Salud capturada (resumen)

- Proxy dual: `mode: dual`, programs `parienta` + `nara`
- Commit API: `7532fde359824a582c4f3dd068062dd8e0f27a3e`
- Fronts reescriben `/api` → `https://nucleo-api-k3fo.onrender.com`

## Pendiente antes de firmar / avanzar a pruebas

1. Firmar E1, D5 y D4 (técnico + **responsable del proyecto**).
2. Sembrar cuentas `TRL-QA-*` (claves solo por canal privado / env).
3. Completar agenda de participantes (códigos ya definidos).
4. Confirmar plan real de respaldos Atlas (RTO/RPO en E1).
5. Merge/deploy del hotfix de login NARA (PR #16) — **ya merged** al preparar este paquete; verificar en prod tras redeploy Vercel.

## Qué NO incluye este paquete

- Resultados de e2e, k6, ZAP, soak, UAT (prohibido antes de firmas PC1).
- Claves, tokens o datos reales de personas.
