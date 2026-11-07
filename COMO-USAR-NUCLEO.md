# Cómo usar el núcleo — 1 API, varios endpoints, 1 `.env`

Todo vive en **un solo** archivo `.env`: URI por programa, bloques de puertos y secretos.

| App | Front | Endpoint | Atlas (en `.env`) |
|-----|-------|----------|-------------------|
| Parienta | `:3003` | **:4000** | `PARIENTA_MONGODB_URI` + DB `nucleo_parienta` |
| NARA | `:3000` | **:4100** | `NARA_MONGODB_URI` + DB `nara` |
| QUINTIA | `:3004` | **:4200** | `QUINTIA_MONGODB_URI` + DB `nucleo_consiente` |

```
parienta-web  ──► :4000  (PROGRAM_ID=parienta)
nara-web      ──► :4100  (PROGRAM_ID=nara)
consiente-web ──► :4200  (PROGRAM_ID=quintia)
        \______ mismo código + mismo .env ______/
```

## Arranque

```bash
cd nucleo-api
# Edita .env (copiar de .env.example si parte de cero)

npm run db:init:parienta
npm run db:init:nara
npm run db:init:quintia
npm run start:dev:ambos
```

Demo QUINTIA: `SEED_QUINTIA_DEMO_PASSWORD=… npm run db:seed:quintia` (tras init).

Fronts:

- `parienta-web` → `NUCLEO_API_URL=http://127.0.0.1:4000`
- `nara-web` → `NUCLEO_API_URL=http://127.0.0.1:4100`
- `consiente-web` → `NUCLEO_API_URL=http://127.0.0.1:4200` + `NEXT_PUBLIC_PROGRAM_ID=quintia` (prod: misma URL Render para todos; ver `DEPLOY-MANUAL.md`)

## Qué hay en el `.env`

- **Compartido:** keys IA, webhooks  
- **Parienta:** `PLATEADO_MONGODB_URI`, `PLATEADO_MONGODB_DB`, secreto, puertos `:4000–4004`  
- **NARA:** `NARA_MONGODB_URI`, `NARA_MONGODB_DB`, secreto, puertos `:4100–4104`  
- **QUINTIA:** `QUINTIA_MONGODB_URI` (o `CONSCIENTE_*`), DB `nucleo_consiente`, puertos `:4200–4204`

Cada programa usa **su** URI de Atlas (no localhost).

## Comprobar

```bash
curl -s http://127.0.0.1:4000/api/health   # parienta
curl -s http://127.0.0.1:4100/api/health   # nara
curl -s http://127.0.0.1:4200/api/health   # quintia
npm run test:quintia
```
