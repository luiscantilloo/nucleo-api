# nucleo-api

Una API para los programas Care. Hoy: **Parienta**.

| Programa | Comando | Puerto gateway | Mongo |
|----------|---------|----------------|-------|
| Parienta | `npm run start:dev:parienta` | `:4000` | `nucleo_parienta` |
| NARA     | `npm run start:dev:nara`     | `:4100` | `nara` |

Config: `programs/parienta/` y `programs/nara/`.

**Subida manual (Render):** ver [`DEPLOY-MANUAL.md`](./DEPLOY-MANUAL.md).  
Prod Parienta: `npm run build` → `npm run start:prod` (env flat en `deploy/RENDER-PARIENTA.env.example`).
