# C3 · Carga corta (Parienta)

**Fecha UTC:** 2026-10-30 · **Perfil:** `ESCALONES_CORTOS=1` · **VUs:** 10 · **Commit:** `7532fde359824a582c4f3dd068062dd8e0f27a3e`

## Configuración

- `herramientas/k6/k6.config.json` (programa `parienta`)
- Mezcla: admin / experto / clínico / paciente / observador
- API: `https://nucleo-api-k3fo.onrender.com`

## Umbrales (kit)

| Umbral | Resultado |
|---|---|
| p95 duración < 2 s | **OK** — p95 ≈ 237 ms |
| http_req_failed < 1 % | **OK** — 0 % |
| tasa_error < 1 % | **OK** — 0 % |

## Archivos

- `k6_*.log`
- `resumen_*.json`
- `series_*.csv.gz`

## Nota

Corrida de recuperación / primera pasada (escalones cortos). La carga completa (sin `ESCALONES_CORTOS`) queda para PC2 / corrida final.
