# nucleo-api

Una API para los programas Care. Hoy: **Parienta**.

| Programa | Comando | Puerto gateway | Mongo |
|----------|---------|----------------|-------|
| Parienta | `npm run start:dev:parienta` | `:4000` | `nucleo_parienta` |
| NARA     | `npm run start:dev:nara`     | `:4100` | `nara` |
| QUINTIA (Consiente) | `npm run start:dev:quintia` | `:4200` | `nucleo_consiente` |

Config: `programs/parienta/`, `programs/nara/` y `programs/quintia/`.

**Demo QUINTIA:** `npm run db:init:quintia` → `SEED_QUINTIA_DEMO_PASSWORD=… npm run db:seed:quintia` (ver `programs/quintia/LEEME.md`).

**Subida manual (Render):** ver [`DEPLOY-MANUAL.md`](./DEPLOY-MANUAL.md).  
Prod Parienta: `npm run build` → `npm run start:prod` (env flat en `deploy/RENDER-PARIENTA.env.example`).
