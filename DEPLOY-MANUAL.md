# Un solo nucleo-api en Render (2 bases, 2 fronts)

```
parienta-web ─┐
              ├──►  Render «nucleo-api»  (1 servicio)
nara-web     ─┘         ├─ Mongo Parienta
                        └─ Mongo NARA
```

Los fronts ya mandan `x-program-id`. El servicio elige la base correcta.

## Render (reemplaza nara-api)

1. Servicio Web → repo `luiscantilloo/nucleo-api`
2. Build: `npm ci && npm run build`
3. Start: `npm run start:prod`
4. Variables: pegar `deploy/RENDER-UNICO.env.example` (las 2 URIs Mongo + secretos + CORS de ambos Vercel)
5. Smoke: `GET …/api/health` → `"mode":"dual"`, `"programs":["parienta","nara"]`

## Vercel

Ambos fronts apuntan a **la misma** URL del Render:

| Front | Env |
|-------|-----|
| parienta-web | `NUCLEO_API_URL=https://TU-NUCLEO.onrender.com` + `NEXT_PUBLIC_PROGRAM_ID=parienta` |
| nara-web | `NUCLEO_API_URL=https://TU-NUCLEO.onrender.com` + `NEXT_PUBLIC_PROGRAM_ID=nara` |

## Orden

1. Subir código a GitHub (`nucleo-api`, `parienta-web`, `nara-web`).
2. Cambiar el servicio Render (antes nara-api) al repo núcleo + env dual.
3. Apuntar ambos Vercel a esa URL.
4. Probar login NARA y login Parienta.
