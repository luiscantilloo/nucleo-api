# Evidencia — Parienta (TRL 6)

Alcance de este paquete: **solo Parienta** (`parienta-web` + `nucleo-api` con `x-program-id: parienta`).

Una carpeta por prueba. Cada carpeta lleva un `RESUMEN.md` o `RESULTADO.md` (puede usar `../plantillas/ficha-de-evidencia.md`) y los archivos que lo respaldan.

| Carpeta | Contenido |
|---|---|
| `capturas/` | Opcional en TRL 6. Capturas por rol (`capturas.spec.js`): cada una revisada antes de entregar |
| `documentacion/` | Los PDF de `05-documentacion-requerida.md`: expediente, técnica, manuales, legales y diagramas, con sus editables |
| `00_version/` | La salud al firmar E2 y al inicio y al final de cada corrida, el registro de despliegue del frontend y la tabla de equivalencia de entornos |
| `01_integracion/` | Salidas de consola de cada corrida de Playwright y `RESUMEN.md` con las fallas, omisiones y causas |
| `02-08_usuarios/` | El Excel de las sesiones lleno, las hojas de registro firmadas y el acta. Si se grabó: los videos difuminados y las autorizaciones |
| `03_carga/` | `resumen.json`, `series.csv.gz`, `k6.log` y `notas.md` (versión, volumen de datos, mezcla, CPU y memoria) |
| `04_estres_estabilidad/` | Estrés, recuperación y soak: resúmenes, series, salida de `degradacion.js`, CPU y memoria, y `RESULTADO.md` |
| `05_seguridad/` | `RESULTADOS_S1-S15.md`, reportes de ZAP, TLS, auditoría de dependencias, gitleaks, matriz de acceso, IDOR, inyección y pruebas de la IA |
| `06_interoperabilidad/` | `INTEGRACIONES.md` y capturas |
| `07_resiliencia/` | Una carpeta por escenario (R1 a R6) con su `RESULTADO.md`, y el runbook lleno |

**Antes de entregar:** correr `node herramientas/revisar-evidencia.js .` sobre todo el paquete y clasificar cada hallazgo en `otros/revision_evidencia_<fecha>.md`. Además se puede buscar a mano:
```
grep -rIiE "password|secret|token|bearer|mongodb(\+srv)?://|postgres://|sk-[A-Za-z0-9]{20}" .
```
