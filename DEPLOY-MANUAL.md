# Subida manual — Parienta (sin tocar NARA prod)

Checklist local para que **tú** conectes Render + Vercel a mano.
**No despliega NARA** con estos pasos (prod NARA sigue en su API vieja).

## 0. Antes de nada

- [ ] Tienes Mongo Atlas (o URI) para **Parienta** (`nucleo_parienta`).
- [ ] Repo GitHub **aparte** para `nucleo-api` (este repo hoy puede no tener remote).
- [ ] Repo GitHub **aparte** para Parienta (`plateado-web`).  
  ⚠️ Si `git remote` apunta a `nara-web`, **no hagas push ahí**. Crea un repo nuevo, p. ej. `parienta-web`, y:
  ```bash
  cd /Users/daniiel/Movies/plateado-web
  git remote rename origin nara-legacy   # opcional, por si acaso
  git remote add origin https://github.com/TU-ORG/parienta-web.git
  ```
- [ ] `nara-web` local tiene cambios hacia el núcleo: **no los subas** a prod NARA hasta migrar.

## 1. nucleo-api → Render (Parienta)

### Build / Start (panel Web Service)

| Campo | Valor |
|-------|--------|
| Root Directory | `.` (raíz del repo) |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm run start:prod` |
| Instance | Web service |

El start usa `scripts/start-prod.mjs`: gateway en `$PORT` (Render) + auth/people/ops/ai en `127.0.0.1:4001–4004`.

### Variables

Copia desde `deploy/RENDER-PARIENTA.env.example` y rellena secretos.

Importante:
- `PROGRAM_ID=parienta`
- `CORS_ORIGIN` = dominio real de Vercel (y preview si quieres)
- `MONGODB_URI` / `MONGODB_DB=nucleo_parienta`

### Smoke

```text
GET https://TU-SERVICIO.onrender.com/api/health
→ programId: "parienta"
```

## 2. plateado-web → Vercel (Parienta)

| Campo | Valor |
|-------|--------|
| Framework | Next.js |
| Build | `npm run build` (default) |
| Install | `npm ci` |

Variables: `deploy/VERCEL-PARIENTA.env.example`  
`NUCLEO_API_URL` = URL **https** del servicio Render (sin `/api` al final).

Tras el primer deploy, vuelve a Render y añade ese dominio a `CORS_ORIGIN`. Redeploy API si hace falta.

### Smoke

- Abrir `/ingreso`, login admin/cuidador/paciente.
- Cuidador → Reportar crisis → aparece en clínico/admin.
- Paciente debería ver pantalla roja (si falla, no es el deploy: es el bug de sync local).

## 3. Qué NO hacer

- No apuntar Parienta a la API NARA vieja.
- No poner `PROGRAM_ID=nara` en el servicio Parienta.
- No pushear `plateado-web` al remote de `nara-web`.
- No desplegar cambios locales de `nara-web` contra `nara-api` prod con `NUCLEO_API_URL` nuevo.

## 4. Verificación local (ya hecha / repetible)

```bash
# API
cd /Users/daniiel/Movies/nucleo-api
npm run build
npm run test:parienta

# Front Parienta
cd /Users/daniiel/Movies/plateado-web
npm run build
```
