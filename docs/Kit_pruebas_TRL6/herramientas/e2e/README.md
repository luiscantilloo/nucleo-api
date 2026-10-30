# Pruebas con Playwright

## Instalación
```
npm install
npx playwright install chromium
cp config.ejemplo.json config.json      # y llenarlo
```

## Variables (nunca en archivos)
```
BASE_URL=<aplicación>  API_URL=<API, si es otra>
PASS_<ROL>=<clave de la cuenta de prueba>    # una por rol de config.json, por ejemplo PASS_ADMIN
EVIDENCIA=<ruta a la carpeta evidencia/ del kit>  # reparte cada .json en su subcarpeta (recomendado)
EVID_DIR=<carpeta>                           # alternativa: todo a una sola carpeta
E2E_EFECTOS=1                                # solo para correr casos con efectos, con aviso previo
EVIDENCIA_VISUAL=1                           # trazas y videos; NO en producción con datos reales
```

## Comandos
| Prueba | Comando | Sección de `config.json` |
|---|---|---|
| C1 casos generales y flujos | `npx playwright test e2e.spec.js flujos.spec.js` | `ingreso`, `roles`, `salud`, `rutasProtegidas`, `cabecerasEsperadas` |
| C1 en celular | `MOVIL=1 npx playwright test e2e.spec.js flujos.spec.js --project=movil` | Igual |
| C1 solo los que fallaron | `npx playwright test --grep "<nombre del caso>"` | — |
| C5 matriz de acceso (S2, S4, S5) | `npx playwright test matriz-acceso.spec.js` | `matriz-acceso.json` |
| C5 IDOR (S1) | `npx playwright test idor.spec.js` | `idor` (y la segunda cuenta del mismo rol en `roles`) |
| C5 inyección y XSS (S8) | `npx playwright test inyeccion.spec.js` | `inyeccion` |
| C5 bloqueo por intentos (S6) | `BLOQUEO=1 PASS_BLOQUEO=... npx playwright test bloqueo.spec.js` | `bloqueo` (cuenta dedicada, fuera de `roles`) |
| C5 política de claves (S7) | `npx playwright test claves.spec.js` | `claves` |
| C5 integraciones autenticadas (S13) | `SECRETO_WEBHOOK=... npx playwright test webhooks.spec.js` | `webhooks` |
| C6 interoperabilidad | `npx playwright test interoperabilidad.spec.js` | `interoperabilidad` |
| C7 pérdida de red (R4) | `npx playwright test perdida-red.spec.js` | `perdidaRed` |
| Capturas por rol (manuales, V5) | `MOVIL=1 npx playwright test capturas.spec.js` | `capturas` |

En PowerShell, las variables se definen así: `$env:BASE_URL = "https://..."`, `$env:PASS_ADMIN = "..."`. Las de una sola línea, como `BLOQUEO=1`, se definen antes: `$env:BLOQUEO = "1"`.

**Todos los scripts se probaron contra una aplicación de prueba,** incluido un caso vulnerable a propósito para confirmar que IDOR lo detecta. Contra su sistema, lo único que cambia es `config.json`, `matriz-acceso.json` y los flujos de `flujos.spec.js`.

Guarde la salida de consola en la carpeta de evidencia: `... | tee ../../evidencia/01_integracion/corrida_<fecha>.log`.
