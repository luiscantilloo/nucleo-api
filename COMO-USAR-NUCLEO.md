# Cómo usar el núcleo — 1 API, 2 endpoints, 1 `.env`

Todo vive en **un solo** archivo `.env`: URI compartida, las **2 bases**, los **2 bloques de puertos** y los **2 secretos**.

| App | Front | Endpoint | Atlas (en `.env`) |
|-----|-------|----------|-------------------|
| Parienta | `:3003` | **:4000** | `PLATEADO_MONGODB_URI` + DB `nucleo_parienta` |
| NARA | `:3000` | **:4100** | `NARA_MONGODB_URI` + DB `nara` |

```
parienta-web ──► :4000  (PROGRAM_ID=parienta)
nara-web     ──► :4100  (PROGRAM_ID=nara)
        \______ mismo código + mismo .env ______/
```

## Arranque

```bash
cd nucleo-api
# Edita .env (copiar de .env.example si parte de cero)

npm run db:init:parienta
npm run db:init:nara
npm run start:dev:ambos
```

Fronts:

- `parienta-web` → `NUCLEO_API_URL=http://127.0.0.1:4000`
- `nara-web` → `NUCLEO_API_URL=http://127.0.0.1:4100`

## Qué hay en el `.env`

- **Compartido:** keys IA, webhooks  
- **Parienta:** `PLATEADO_MONGODB_URI`, `PLATEADO_MONGODB_DB`, secreto, puertos `:4000–4004`  
- **NARA:** `NARA_MONGODB_URI`, `NARA_MONGODB_DB`, secreto, puertos `:4100–4104`  

Cada programa usa **su** URI de Atlas (no localhost).

## Comprobar

```bash
curl -s http://127.0.0.1:4000/api/health   # parienta
curl -s http://127.0.0.1:4100/api/health   # nara
```
