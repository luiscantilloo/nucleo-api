# Estabilizar: 1 código nucleo-api → 2 servicios Render → 2 fronts

Mismo repo `nucleo-api`. **Dos** Web Services en Render (no se mezclan datos ni `PROGRAM_ID`).

```
parienta-web (Vercel) ──► Render «nucleo-parienta»  PROGRAM_ID=parienta  DB=nucleo_parienta
nara-web     (Vercel) ──► Render «nucleo-nara»      PROGRAM_ID=nara      DB=nara
```

Build/Start en **ambos** servicios:

| Campo | Valor |
|-------|--------|
| Repo | `luiscantilloo/nucleo-api` |
| Build | `npm ci && npm run build` |
| Start | `npm run start:prod` |

---

## Orden recomendado (sin tumbar NARA)

### 1. Render · nucleo-parienta (nuevo)

Env: `deploy/RENDER-PARIENTA.env.example`  
Smoke: `GET …/api/health` → `programId: "parienta"`

### 2. Vercel · parienta-web

Repo: `luiscantilloo/parienta-web`  
Env: `../plateado-web/deploy/VERCEL-PARIENTA.env.example` → URL del servicio **parienta**  
Actualiza `CORS_ORIGIN` en ese servicio Render.

### 3. Render · nucleo-nara (nuevo, paralelo a nara-api vieja)

Env: `deploy/RENDER-NARA.env.example`  
- Misma (o copia) Mongo de NARA prod si ya tienes datos.  
- `PROGRAM_ID=nara`  
- `AUTH_SECRET`: si cambias el secreto, **todas las sesiones NARA se invalidan** (usuarios re-login). Preferible reutilizar el de nara-api si migras en caliente.  
Smoke: `GET …/api/health` → `programId: "nara"`

**No apagues nara-api** hasta el paso 5.

### 4. Vercel · nara-web (cutover)

Env: `../nara-web/deploy/VERCEL-NARA.env.example` → URL del servicio **nucleo-nara**  
Redeploy. Prueba login + una pantalla clínica/paciente.

### 5. Apagar nara-api vieja

Solo cuando el smoke de NARA contra el núcleo esté OK 24h (o el tiempo que definan).

---

## Errores típicos

| Síntoma | Causa |
|---------|--------|
| Parienta habla con datos NARA | Un solo servicio / mismo `PROGRAM_ID` o misma DB |
| 401 / sesión inválida | `AUTH_SECRET` distinto al de la API anterior |
| CORS | Falta el dominio Vercel en `CORS_ORIGIN` de **ese** servicio |
| Front NARA caído tras deploy | Apuntó a nucleo-parienta o a nara-api con código nuevo |

---

## Repos

| Pieza | GitHub |
|-------|--------|
| API | https://github.com/luiscantilloo/nucleo-api |
| Parienta | https://github.com/luiscantilloo/parienta-web |
| NARA | https://github.com/luiscantilloo/nara-web |
