# Herramientas: inventario completo

Todo lo que se corre está aquí. Cada script se configura con un archivo `*.ejemplo.json` que se copia y se llena. **Las claves nunca van en los archivos**: van en variables de entorno (`PASS_<ROL>`, `PASS_BLOQUEO`, `SECRETO_<…>`).

| Carpeta y archivo | Prueba | Qué hace | Configuración |
|---|---|---|---|
| `e2e/e2e.spec.js` | C1, C5 (S3, S4, S9) | Salud y versión (G-01), ingreso por rol (G-02), ingreso inválido (G-03), rutas protegidas (G-04), cookie (G-05), sesión alterada (G-06), cabeceras (G-07), sesión por API (G-08) | `e2e/config.json` |
| `e2e/flujos.spec.js` | C1 | **Plantilla** de los flujos del sistema y del de punta a punta (se escribe con ayuda de `npx playwright codegen`) | — |
| `e2e/matriz-acceso.spec.js` + `matriz-acceso.json` | C5 (S2, S4, S5) | Compara el estado HTTP real de cada rol × recurso con el esperado | `matriz-acceso.json` |
| `e2e/idor.spec.js` | C5 (S1) | Otra cuenta del mismo rol y una de otro rol intentan leer, modificar y borrar un recurso ajeno | `config.json` › `idor` |
| `e2e/bloqueo.spec.js` | C5 (S6) | Intentos fallidos hasta el bloqueo; la clave correcta ya no entra; mensaje genérico | `config.json` › `bloqueo` |
| `e2e/claves.spec.js` | C5 (S7) | Claves débiles rechazadas y una fuerte aceptada | `config.json` › `claves` |
| `e2e/inyeccion.spec.js` | C5 (S8) | Cargas de XSS, SQL, NoSQL y tamaños extremos: sin 5xx, sin HTML sin escapar; ingreso NoSQL rechazado | `config.json` › `inyeccion` |
| `e2e/webhooks.spec.js` | C5 (S13) | Cada webhook en uso: sin secreto, con uno incorrecto, con el cuerpo alterado (si es firma HMAC) y con el correcto (obligatorio) | `config.json` › `webhooks` |
| `e2e/interoperabilidad.spec.js` | C6 | Una operación real por integración, con estado, tiempo y resumen | `config.json` › `interoperabilidad` |
| `e2e/perdida-red.spec.js` | C7 (R4) | Corta la red al guardar y comprueba las 5 condiciones | `config.json` › `perdidaRed` |
| `e2e/capturas.spec.js` | Visuales (opcional en TRL 6) | Capturas por rol y pantalla, en escritorio y celular. Falla si una pantalla queda en la de ingreso | `config.json` › `capturas` |
| `e2e/lib.js`, `playwright.config.js`, `package.json` | — | Funciones comunes y configuración de Playwright (escritorio; celular con `MOVIL=1`) | — |
| `k6/carga.js` | C3 (y recuperación, C4) | Carga con la mezcla de roles y perfil fijo; `ESCALONES_CORTOS=1` para la recuperación | `k6/k6.config.json` |
| `k6/estres.js` | C4 | 8 escalones hasta `VUS_MAX` para hallar el quiebre | Igual |
| `k6/soak.js` | C4 | Carga sostenida (2 h o más) | Igual |
| `k6/degradacion.js` | C4 | Degradación del soak y p95 por minuto del estrés, desde el CSV de k6. **Es el cálculo oficial: no se reemplaza** | — |
| `k6/comun.js` | — | Ingreso, mezcla de roles, umbrales y detección de mitigación del hosting | — |
| `datos/sembrar.js` | C3 | Carga datos sintéticos por la API para un volumen realista | `datos/sembrar.json` |
| `datos/limpiar.js` | Todas | Borra, archiva o desactiva lo que tiene el prefijo `TRL-QA-` (simulación por defecto; `--ejecutar` para hacerlo) | `datos/limpiar.json` |
| `resiliencia/medir-disponibilidad.js` | C7 (R1 a R3) | Consulta la salud cada N segundos y mide la duración de cada caída. **Se detiene al terminar cada escenario** | — |
| `resiliencia/caidas.md` | C7 (R1 a R3, R5) | Cómo provocar y registrar cada caída | — |
| `seguridad/correr-escaneos.sh` y `seguridad/correr-escaneos.ps1` | C5 (S9 a S12) | Cabeceras, ZAP base y autenticado, TLS, dependencias y secretos, todo a la carpeta de evidencia | Variables de entorno |
| `seguridad/seguridad.md` | C5 | Cada comando explicado, más S7 y S13 a mano si los scripts no aplican | — |
| `ia/prueba-adversarial-ia.md` | C5 (S15) | Minimización de datos, captura del envío, inyección de instrucciones y protocolos sin IA | — |
| `graficas/graficas.py` | C3, C4, C8 (V8, V9) | Gráficas de k6 (p95, usuarios y errores) y del SUS por rol | — |
| `excel/generar_excel.py` + `roles.ejemplo.json` | C2, C8 | Genera el Excel de pruebas con usuarios (casos, resultado, SUS y resumen automático) | `excel/roles.json` |
| `revisar-evidencia.js` | Cierre | Busca claves, tokens, cookies, cadenas de conexión, correos y teléfonos en la evidencia | — |

**Probado:** todos los scripts se corrieron contra una aplicación de prueba, incluidas versiones vulnerables a propósito, para confirmar que IDOR y la política de claves detectan la falla. Contra su sistema solo cambian los archivos de configuración y los flujos.
