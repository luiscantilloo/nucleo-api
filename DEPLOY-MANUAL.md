# Un solo nucleo-api en Render (2–3 bases, 2–3 fronts)

```
parienta-web  ─┐
nara-web      ─┼──►  Render «nucleo-api»  (1 servicio, proxy :$PORT)
consiente-web ─┘         ├─ Mongo Parienta (nucleo_parienta)
                         ├─ Mongo NARA (nara)
                         └─ Mongo QUINTIA (nucleo_consiente)  [opcional]
```

Los fronts mandan `x-program-id` / `NEXT_PUBLIC_PROGRAM_ID` (`parienta` | `nara` | `quintia`). El proxy interno elige la instancia (`:4000` · `:4100` · `:4200`) y cada una su Mongo.

## Render (reemplaza nara-api)

1. Servicio Web → repo `luiscantilloo/nucleo-api`
2. Build: `npm ci && npm run build`
3. Start: `npm run start:prod`
4. Variables: pegar `deploy/RENDER-UNICO.env.example` (URIs Mongo + secretos + CORS de cada Vercel)
5. Smoke: `GET …/api/health` con header `x-program-id: nara` (o el front) → `"mode":"dual"` o `"triple"` y lista `programs`

## Vercel

Ambos fronts apuntan a **la misma** URL del Render:

| Front | Env |
|-------|-----|
| parienta-web | `NUCLEO_API_URL=https://TU-NUCLEO.onrender.com` + `NEXT_PUBLIC_PROGRAM_ID=parienta` |
| nara-web | `NUCLEO_API_URL=https://TU-NUCLEO.onrender.com` + `NEXT_PUBLIC_PROGRAM_ID=nara` |
| consiente-web (QUINTIA) | misma URL + `NEXT_PUBLIC_PROGRAM_ID=quintia` → ver `consiente-web/deploy/DEPLOY-QUINTIA.md` |

## QUINTIA (modo triple)

1. Añadir bloque `QUINTIA_*` en Render (ver `deploy/RENDER-UNICO.env.example`): URI, `QUINTIA_MONGODB_DB=nucleo_consiente`, secreto, CORS del Vercel QUINTIA.
2. En Atlas, la base **recomendada** es `nucleo_consiente` (local y scripts `db:init:quintia`). Si prefieres otro nombre (p. ej. `nucleo_quintia`), define `QUINTIA_MONGODB_DB` igual en Render y al sembrar.
3. Antes del deploy: `npm run db:init:quintia` y `SEED_QUINTIA_DEMO_PASSWORD=… npm run db:seed:quintia` (solo local/CI; **nunca** commitear contraseñas).
4. Incluir origen `https://TU-QUINTIA.vercel.app` en `QUINTIA_CORS_ORIGIN`.

Servicio **solo QUINTIA** (legacy, 1 instancia): `deploy/RENDER-QUINTIA.env.example` — no mezclar `PROGRAM_ID` ni DB con Parienta/NARA.

## Orden

1. Subir código a GitHub (`nucleo-api`, fronts).
2. Servicio Render en repo núcleo + env según programas activos (dual o triple).
3. Apuntar cada Vercel a **la misma** URL del núcleo.
4. Probar login por programa (Parienta, NARA, QUINTIA).
