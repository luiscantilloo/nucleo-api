# Cómo usar el Núcleo (1 API + 2 fronts)

## Qué quedó

| Pieza | Dónde | Rol |
|-------|--------|-----|
| **nucleo-api** | carpeta `nucleo-api` | **Única API**. Lógica de NARA y Parienta |
| **parienta-web** | `parienta-web` | Front marca Parienta |
| **nara-web** | `nara-web` | Front marca NARA |
| **nara-api** | `nara-api` | **Congelado** — no seguir desarrollando features |

```
nara-web  ──┐                    programs/nara/      + Mongo nucleo_nara
            ├──► nucleo-api ──►
parienta-web┘                    programs/parienta/  + Mongo nucleo_parienta
```

La llave es `PROGRAM_ID`. Mismo código; distinta carpeta de programa + distinta base.

---

## Arrancar Parienta (día a día)

```bash
# Terminal 1 — API
cd nucleo-api   # = nucleo-api
cp -n .env.example .env   # si aún no tienes .env
# .env: PROGRAM_ID=parienta · MONGODB_DB=nucleo_parienta · CORS → :3003
npm run start:dev:all

# Terminal 2 — Front
cd parienta-web
cp -n .env.example .env.local
# .env.local: NUCLEO_API_URL=http://127.0.0.1:4000
npm run dev -- -p 3003
```

Abre `http://localhost:3003`. Health: `GET http://127.0.0.1:4000/api/health` → `programId: "parienta"`.

---

## Arrancar NARA contra el núcleo

```bash
# Terminal 1 — misma API, otra instancia / otro .env
cd nucleo-api
PROGRAM_ID=nara MONGODB_DB=nucleo_nara \
  AUTH_SECRET=secreto-largo-nara \
  CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000 \
  npm run start:dev:all

# Terminal 2 — Front NARA
cd nara-web
cp -n .env.example .env.local
# NUCLEO_API_URL=http://127.0.0.1:4000
npm run dev -- -p 3000
```

Comprueba: `GET /api/program` → `nombre: "NARA"` y roles experto/paciente (no gestor/persona).

> En local, **una sola** instancia del gateway en el puerto 4000 a la vez.  
> Para NARA y Parienta a la vez hace falta otro set de puertos o dos máquinas/deploys.

---

## Qué debes saber tú (operador / producto)

1. **Un bug de cocina se corrige una vez** en `nucleo-api`. No abras PRs de feature en `nara-api`.
2. **Cambiar marca/colores** → solo el front (`nara-web` o `parienta-web`).
3. **Cambiar roles, crisis, perfiles, TEO** → `programs/<id>/` en el núcleo.
4. **Datos no se mezclan**: cada programa tiene su Mongo (`nucleo_nara` ≠ `nucleo_parienta`).
5. **Sesión atada al programa**: el token lleva `programId`; una sesión Parienta no vale en instancia NARA.
6. **Fronts** hablan al núcleo con rewrite `/api/*` → `NUCLEO_API_URL`.
7. **Migración prod NARA**: copiar datos a `nucleo_nara`, apuntar `nara-web` al deploy del núcleo con `PROGRAM_ID=nara`, luego apagar `nara-api`.

---

## Carpetas de programa

| Path | Programa |
|------|----------|
| `programs/parienta/` | Parienta (PL, cuidadora, etc.) |
| `programs/nara/` | NARA (roles clásicos, perfiles P01–P15 documentados) |
| `programs/prueba/` | Medición V9 / smoke multiprograma |

---

## Comandos útiles

```bash
cd nucleo-api
npm run test:parienta          # crisis/reglas Parienta
PROGRAM_ID=nara node -e "const {loadProgram,resetProgramCache}=require('./dist/...');"
# o en tests:
PROGRAM_ID=nara npm run test:prueba   # adaptar; smoke crisis genérico
```

Smoke rápido multiprograma:

```bash
PROGRAM_ID=nara node --import tsx -e "
import { loadProgram, resetProgramCache } from './libs/program/src/load-program.ts';
resetProgramCache();
const p = loadProgram('nara');
console.log(p.id, p.nombre, p.roles.map(r => r.id).join(','));
"
```

---

## Checklist “¿ya estamos en 1 API?”

- [x] `programs/nara` y `programs/parienta` en el mismo repo API  
- [x] Fronts con `NUCLEO_API_URL`  
- [x] `nara-api` marcado congelado  
- [ ] Deploy prod NARA apunta al núcleo (migración de datos)  
- [ ] Apagar proceso `nara-api` en hosting  

Hasta que el último ítem esté hecho, prod NARA puede seguir en `nara-api`; el desarrollo nuevo va al núcleo.
