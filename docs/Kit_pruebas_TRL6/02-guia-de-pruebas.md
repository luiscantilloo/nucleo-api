# Guía de las 8 pruebas

Cada prueba tiene seis partes: objetivo, herramienta, preparación, pasos, umbral y evidencia. Al final de cada una van los errores comunes, que salen de una evaluación real. La documentación, los manuales y los visuales están en `05-documentacion-requerida.md`.

## Herramientas

Se instalan en la máquina que corre las pruebas, que debe ser **distinta** del servidor probado.

| Herramienta | Para qué | Instalación |
|---|---|---|
| Node.js 18 o superior | Playwright y scripts | nodejs.org |
| Playwright | e2e, matriz de acceso, IDOR, inyección, bloqueo, pérdida de red y capturas | `cd herramientas/e2e && npm install && npx playwright install chromium` |
| k6 | Carga, estrés y soak | grafana.com/docs/k6 (binario único) |
| Python 3 con `matplotlib` y `openpyxl` | Gráficas y Excel de usuarios | `pip install matplotlib openpyxl` |
| Docker | ZAP, testssl y gitleaks | docker.com |
| OWASP ZAP | Escaneo de seguridad | `docker pull ghcr.io/zaproxy/zaproxy:stable` |
| testssl.sh | TLS (o SSL Labs, en línea) | `docker pull drwetter/testssl.sh` |
| gitleaks | Secretos en los repositorios | `docker pull zricethezav/gitleaks` |
| Grabador de pantalla (opcional en TRL 6) | Sesiones con usuarios | OBS Studio, Zoom, Meet o Teams |
| draw.io (diagrams.net) | Diagramas | app.diagrams.net o la aplicación de escritorio |

## Variables de entorno

Nunca se escriben en archivos: se definen en la sesión de la terminal, al momento de correr.

| Bash (Linux, macOS) | PowerShell (Windows) |
|---|---|
| `export BASE_URL=https://app.ejemplo.com` | `$env:BASE_URL = "https://app.ejemplo.com"` |
| `export API_URL=https://api.ejemplo.com` | `$env:API_URL = "https://api.ejemplo.com"` |
| `export PASS_ADMIN='...'` (una por rol: `PASS_<ROL>`) | `$env:PASS_ADMIN = "..."` |
| `export EVIDENCIA="$(pwd)/evidencia"` (desde la raíz del kit) | `$env:EVIDENCIA = "$PWD\evidencia"` |

En k6, las variables se pasan con `-e NOMBRE=valor` en el mismo comando.

**`EVIDENCIA`** apunta a la carpeta `evidencia/` del kit. Con ella, cada script de Playwright guarda su resultado en la subcarpeta que le corresponde:
- la salud, en `00_version/`;
- seguridad, en `05_seguridad/`;
- interoperabilidad, en `06_interoperabilidad/`;
- pérdida de red, en `07_resiliencia/R4_perdida_red/`;
- capturas, en `capturas/`.

La salida de consola se guarda con `| tee <archivo>`, que funciona en Bash y en PowerShell.

---

## 0. Antes de todo: versión, entorno y datos

1. **Versión:** confirmar que el endpoint de salud devuelve la versión desplegada (commit). **Si no existe, se crea:** sin él no se puede probar que las pruebas corrieron sobre la versión final.
2. Guardar la salida en `evidencia/00_version/salud_inicio_<prueba>_<fecha>.json` y `salud_fin_<prueba>_<fecha>.json` **al inicio y al final de cada corrida**, incluidas la carga, el estrés, el soak, ZAP y R1–R6. `e2e.spec.js` (G-01) la guarda sola en la suite. El `startedAt` no debe cambiar dentro de una corrida: si cambia, hubo un reinicio o un despliegue.
3. **Cuentas:** verificar que las de `04-parametros.md` entran y están **activas**.
4. **Volumen de datos:** si la base no tiene un volumen realista, cargar datos **sintéticos** con `herramientas/datos/sembrar.js` (todo con el prefijo `TRL-QA-`). Anotar los conteos.

---

## 1. Integración de extremo a extremo (C1)

**Objetivo:** demostrar que todos los módulos (frontend, API, base de datos e integraciones) funcionan juntos sobre la infraestructura real, para todos los roles.

**Herramienta:** Playwright (`herramientas/e2e/`).

**Preparación:**
1. Copiar `herramientas/e2e/config.ejemplo.json` a `config.json` y llenar:
   - los roles, con su cuenta (sin la clave) y su ruta de inicio;
   - el ingreso por la pantalla y por la API;
   - la salud y las rutas protegidas.
2. Escribir los flujos del sistema en `herramientas/e2e/flujos.spec.js`, a partir de la plantilla: un caso por flujo de `04-parametros.md`, **más el flujo de punta a punta completo**, que encadena los roles con la misma entidad de prueba. **Cada paso se hace con la cuenta de su rol**, hasta el final del flujo (por ejemplo, hasta la liquidación). Si un paso depende de un tercero, se simula con su webhook firmado.
3. **Los casos que en producción generan efectos sobre personas reales** (alertas, notificaciones, cobros, correos) se marcan para correr solo con `E2E_EFECTOS=1`, con aviso previo, o en el entorno equivalente.

**Pasos:**
```
cd herramientas/e2e
npx playwright test e2e.spec.js flujos.spec.js | tee ../../evidencia/01_integracion/corrida1_<fecha>.log
npx playwright test --grep "<caso que falló>" | tee ../../evidencia/01_integracion/corrida2_<fecha>.log
MOVIL=1 npx playwright test e2e.spec.js flujos.spec.js --project=movil     # las mismas pantallas en celular
```
- **Corrida 1:** la suite completa.
- **Corrida 2:** solo las que fallaron, después de entender la causa.
- No se corrige la prueba para que pase si la falla es del sistema.
- **Casos generales que ya trae `e2e.spec.js`:**
  - G-01: salud y versión;
  - G-02: ingreso de cada rol;
  - G-03: ingreso inválido;
  - G-04: rutas protegidas;
  - G-05 y G-06: cookie y sesión alterada;
  - G-07: cabeceras;
  - G-08: sesión por API.

**Umbral:** ≥ 90 % de los casos ejecutados pasan **en la primera pasada** de la corrida final, y cada falla u omisión tiene una causa escrita.

**Evidencia** (en `evidencia/01_integracion/`):
- la salida de consola de cada corrida;
- `RESUMEN.md`, con la tabla de fallas y causas, las omisiones y por qué, y la versión.

**Errores comunes:**
- **Cuentas de prueba en un estado que no es «activo»:** la prueba falla por el dato, no por el sistema. Se revisan antes.
- **Claves fijas en la prueba que la política de claves rechaza:** se generan aleatorias.
- **Trazas, videos y reportes HTML de Playwright con datos reales o cookies:** van apagados por defecto. Si se encienden (`EVIDENCIA_VISUAL=1`), se revisan antes de entregar.
- **Pruebas que cierran sesiones compartidas o bloquean cuentas en producción:** se omiten allí y se declaran.

---

## 2. Funcionales y de aceptación: UAT (C2)

**Objetivo:** que al menos una persona por rol, que no participó en el desarrollo ni en las pruebas, use el sistema para sus tareas, y que el resultado se compare con lo esperado.

**Herramientas:**
- `herramientas/excel/generar_excel.py`: genera el Excel desde `roles.json` (roles, casos y 1 participante previsto por rol);
- `plantillas/guion-sesion-usuarios.md`: guion del facilitador y gravedad de los defectos;
- `plantillas/hoja-de-registro-sesion.md`: una por sesión, firmada por quien la facilita;
- `plantillas/acta-UAT.md`;
- si se graba: `plantillas/autorizacion-grabacion.md`.

**Preparación:**
1. Copiar `roles.ejemplo.json` a `roles.json`, con los casos de cada rol: código (`<ROL>-01`), tarea en lenguaje del usuario y resultado esperado observable. Luego:
   ```
   python3 herramientas/excel/generar_excel.py evidencia/02-08_usuarios/pruebas-usuarios.xlsx roles.json
   ```
2. Marcar los casos del flujo completo (`[Flujo completo]`), que recorren en orden las mismas personas con la misma entidad de prueba.
3. Asignar un código a cada participante (`<ROL>-P01`). Los nombres no van en la evidencia.
4. Preparar las cuentas de prueba el mismo día y verificar que están activas.

**Pasos:**
1. leer cada caso textual, con el participante pensando en voz alta;
2. anotar el resultado (**Cumple**, **Con ayuda** o **No cumple**), el tiempo y los errores;
3. al final, el SUS (prueba 8);
4. llenar y firmar la hoja de registro de la sesión.

**Umbral:** ≥ 90 % de los casos **sin ayuda** (solo «Cumple» cuenta), 0 defectos críticos abiertos y acta firmada.

**Evidencia** (en `evidencia/02-08_usuarios/`): el Excel lleno, las hojas de registro firmadas, la lista de defectos con su gravedad y su estado, y el acta firmada.

**Errores comunes:**
- **Usar a quien desarrolló o probó el sistema:** no cuenta.
- **El facilitador ayuda sin anotarlo:** cualquier ayuda es «Con ayuda».
- **Cuentas que vencen o se bloquean entre sesiones:** se revisan el mismo día.
- **Ingresos lentos sin resolver:** un participante bloqueado al entrar cuenta como tarea fallida.

---

## 3. Rendimiento y carga (C3)

**Objetivo:** demostrar los tiempos de respuesta y la tasa de errores a la concurrencia esperada, con un volumen de datos realista.

**Herramienta:** k6 (`herramientas/k6/carga.js`).

**Preparación:**
1. Copiar `herramientas/k6/k6.config.ejemplo.json` a `k6.config.json` y llenar:
   - el ingreso: endpoint, cuerpo y tipo de sesión (cookie o token);
   - los roles con sus **rutas de lectura** y su **peso** en la mezcla, según `04-parametros.md`.
2. Verificar el volumen de datos y anotarlo. Si hace falta, cargar datos sintéticos con `herramientas/datos/sembrar.js`.
3. **Autorización escrita** del dueño de la infraestructura, y aviso al proveedor de hosting si su política lo pide.
4. Revisar si el hosting tiene protección contra ataques que bloquee el tráfico de k6. El script se detiene solo si detecta que el proveedor está mitigando el tráfico.
5. Preparar la **observación del servidor**: el panel de métricas del proveedor de hosting y de la base de datos (CPU, memoria y conexiones). Si el servidor es propio, `docker stats` o `top` registrados en un archivo.

**Pasos:**
```
cd herramientas/k6
k6 run -e CFG=k6.config.json -e BASE_URL=<api> -e VUS_OBJETIVO=<concurrencia> -e PASS_<ROL>=... \
  --summary-export=../../evidencia/03_carga/resumen.json \
  --out csv=../../evidencia/03_carga/series.csv carga.js | tee ../../evidencia/03_carga/k6.log
python3 ../graficas/graficas.py k6 ../../evidencia/03_carga/series.csv ../../evidencia/03_carga/grafica_carga.png "Carga"
```
- El perfil es fijo: sube al 40 % (2 min), se queda ahí (5 min), sube al 100 % (2 min), se queda ahí (5 min) y baja (2 min).
- Durante la meseta del 100 %, capturar las métricas del servidor.
- **La corrida final de C3 usa siempre este perfil completo.** `ESCALONES_CORTOS=1` solo sirve para la recuperación de C4 y para ensayos.

**Umbral:** p95 < 2 s y errores < 1 % a la concurrencia objetivo. k6 marca los umbrales como ✓ o ✗.

**Evidencia** (en `evidencia/03_carga/`):
- `resumen.json`, `series.csv` (comprimido), `k6.log` y `grafica_carga.png`;
- `notas.md`, con la versión, el volumen de datos, la mezcla, la hora, y las capturas de CPU y memoria.

**Errores comunes:**
- **k6 borra la cookie entre iteraciones:** sin `noCookiesReset: true`, desde la segunda vuelta todo da 401. Los scripts ya lo traen.
- **Iniciar sesión en cada iteración:** activa el bloqueo por intentos. Se inicia una vez por usuario virtual.
- **Una sola cuenta para todos los usuarios virtuales:** se puede, pero se declara.
- **Probar solo lecturas:** si la operación real escribe mucho, se declara. Las escrituras masivas solo se agregan con datos de prueba y autorización.
- **Dejar fuera las rutas pesadas** (catálogos, reportes): la carga debe parecerse al uso real. Si el cliente comprime las respuestas, k6 también debe pedirlas comprimidas.

---

## 4. Estrés y estabilidad (C4)

**Objetivo:** encontrar el punto de quiebre, comprobar que el sistema se recupera solo y demostrar que no se degrada con el uso sostenido.

**Herramientas:** k6 (`estres.js` y `soak.js`), `degradacion.js` y `graficas.py`.

**Pasos:**

**(a) Estrés:**
```
k6 run -e CFG=k6.config.json -e BASE_URL=<api> -e VUS_MAX=<4 × objetivo> -e PASS_<ROL>=... \
  --summary-export=../../evidencia/04_estres_estabilidad/estres_resumen.json \
  --out csv=../../evidencia/04_estres_estabilidad/estres_series.csv estres.js
node degradacion.js ../../evidencia/04_estres_estabilidad/estres_series.csv --por-minuto > ../../evidencia/04_estres_estabilidad/estres_por_minuto.csv
```
- La carga sube en 8 escalones hasta `VUS_MAX`.
- El **punto de quiebre** es el primer escalón con p95 ≥ 2 s o con errores ≥ 1 %. Se lee en `estres_por_minuto.csv` y en la gráfica.
- **Recuperación:** inmediatamente después se corre `carga.js` con `-e ESCALONES_CORTOS=1`. Debe volver a cumplir los umbrales **sin reiniciar nada**.

**(b) Soak:**
```
k6 run -e CFG=k6.config.json -e BASE_URL=<api> -e VUS_SOAK=<≈30 % del objetivo> -e DURACION=2h -e PASS_<ROL>=... \
  --summary-export=../../evidencia/04_estres_estabilidad/soak_resumen.json \
  --out csv=../../evidencia/04_estres_estabilidad/soak_series.csv soak.js
node degradacion.js ../../evidencia/04_estres_estabilidad/soak_series.csv > ../../evidencia/04_estres_estabilidad/degradacion.txt
```
- **La degradación se calcula siempre con este `degradacion.js` del kit**, no con uno propio.
- Capturar las métricas del servidor (salud, CPU y memoria) **antes, a la mitad y después**.
- Hacer las gráficas de las dos pruebas con `graficas.py k6`.

**Umbral:**
- **Estrés:** quiebre identificado y recuperación sin intervención.
- **Soak:** ≥ 2 h, p95 < 2 s, errores < 1 % y degradación ≤ 10 % entre la primera y la última hora.

**Evidencia** (en `evidencia/04_estres_estabilidad/`):
- los resúmenes, series, gráficas, `estres_por_minuto.csv` y `degradacion.txt`;
- `RESULTADO.md`, con el quiebre en usuarios, el tiempo de recuperación y la degradación;
- las capturas de CPU y memoria.

**Errores comunes:**
- **Correr el estrés en horario de uso real.**
- **No guardar el estado del servidor antes y después del soak:** no se puede demostrar que no hubo degradación.
- **Apagar la máquina de pruebas a mitad del soak:** usar una máquina que no se suspenda.

---

## 5. Seguridad (C5)

**Objetivo:** verificar los controles S1 a S14 (más S15 si hay IA) del marco.

**Herramientas:**
- Playwright: `matriz-acceso.spec.js`, `idor.spec.js`, `inyeccion.spec.js` y `bloqueo.spec.js`;
- `herramientas/seguridad/seguridad.md`: ZAP, TLS, dependencias, gitleaks, claves e integraciones;
- `herramientas/ia/` si aplica;
- `plantillas/resultados-seguridad.md`.

**Pasos** (con `EVIDENCIA` definida; los resultados quedan en `evidencia/05_seguridad/`):

| Control | Cómo |
|---|---|
| S2, S4, S5 | Llenar `matriz-acceso.json` (rol × método × ruta → estado esperado) y correr `npx playwright test matriz-acceso.spec.js` |
| S1 | Llenar la sección `idor` de `config.json` con **cada tipo de recurso sensible**. Hace falta una segunda cuenta del mismo rol, en `roles`. Correr `npx playwright test idor.spec.js` |
| S3, S4, S9 (cabeceras) | Los casos G-04 a G-07 de `e2e.spec.js` |
| S6 | Cuenta dedicada en la sección `bloqueo` (no en `roles`). Correr `BLOQUEO=1 PASS_BLOQUEO=... npx playwright test bloqueo.spec.js`. Después, intentar con la clave correcta **desde otra IP**: la cuenta debe seguir bloqueada (bloqueo por cuenta) |
| S7 | Llenar la sección `claves` de `config.json` y correr `npx playwright test claves.spec.js`. Si la API no permite crear cuentas así, hacerlo a mano (`seguridad.md`, sección 3) |
| S8 | Llenar la sección `inyeccion` de `config.json` y correr `npx playwright test inyeccion.spec.js`. Además, revisar en la pantalla que lo guardado se muestra como texto (captura) |
| S9 (ZAP), S10 (TLS), S11 (dependencias), S12 (secretos) | `bash herramientas/seguridad/correr-escaneos.sh` (en Windows, `correr-escaneos.ps1`): cabeceras, ZAP base y autenticado, TLS, dependencias y secretos. Detalle en `seguridad.md`, secciones 1 y 2 |
| S14 | Captura de la protección de la rama principal |
| S13 | Llenar la sección `webhooks` de `config.json` con **todos los webhooks entrantes en uso**, incluidos los de integraciones fuera del alcance de C6. El secreto correcto va en la variable indicada; el caso positivo es obligatorio. Para firmas HMAC (por ejemplo, `X-Hub-Signature-256` de Meta o la firma de Stripe), usar `"firma": { "algoritmo": "sha256", "prefijo": "sha256=" }`. Correr `npx playwright test webhooks.spec.js` |
| S15 | `herramientas/ia/prueba-adversarial-ia.md` y la aprobación firmada del flujo de datos |

**Umbral:**
- todos los controles verificados;
- 0 alertas altas en ZAP autenticado, **con los roles principales y rutas GET y POST**. Una alerta alta solo se descarta como falso positivo con una prueba que lo demuestre;
- TLS A o mayor;
- 0 dependencias críticas.

**Cada hallazgo se corrige y se verifica de nuevo**, con el estado antes y después.

**Evidencia** (en `evidencia/05_seguridad/`): `RESULTADOS_S1-S15.md` (de la plantilla), los `.json` de los scripts, los reportes de ZAP (`.html`), las salidas de TLS, dependencias y gitleaks, y las capturas.

**Errores comunes:**
- **Escanear con ZAP sin sesión:** solo ve la pantalla de ingreso.
- **Probar el bloqueo con una cuenta que se usa en otras pruebas:** se bloquea y daña el resto de la corrida.
- **Capturas con claves o tokens visibles:** se recortan o se repiten.
- **Dejar sesiones abiertas o claves de prueba sin rotar** después de los escaneos.

---

## 6. Interoperabilidad (C6)

**Objetivo:** demostrar un intercambio real con cada integración en uso.

**Herramientas:** `herramientas/e2e/interoperabilidad.spec.js` y `plantillas/integraciones.md`.

**Pasos:**
1. Llenar la sección `interoperabilidad` de `config.json`, con la llamada de la API que activa cada integración, y correr `npx playwright test interoperabilidad.spec.js`. Queda registrado en `INTEGRACIONES_<fecha>.json`. Las integraciones que no se activan por la API (una notificación que llega al celular, un correo) se prueban a mano: un mensaje a la IA, un envío de mensajería, un cobro de prueba, una consulta al mapa…
2. Registrar la fecha y hora, la versión, la petición resumida y la respuesta resumida, **sin claves ni datos personales**, y el estado.
3. Hacer una captura de la pantalla de la aplicación donde se ve el resultado y, si se puede, del panel o registro del proveedor.

**Umbral:** un intercambio registrado y exitoso por cada integración del alcance, **cada uno con su archivo**: el json de `interoperabilidad.spec.js` o un extracto del log del servidor con el id del intercambio (por ejemplo, el id de un correo enviado). Lo que solo aparece en un `.md` no cuenta.

**Evidencia** (en `evidencia/06_interoperabilidad/`): `INTEGRACIONES.md` (de la plantilla) y las capturas.

---

## 7. Resiliencia y recuperación (C7)

**Objetivo:** probar los escenarios R1 a R6 del marco.

**Herramientas:**
- `herramientas/resiliencia/caidas.md`;
- `herramientas/resiliencia/medir-disponibilidad.js`, que mide cuánto tiempo estuvo caído el sistema;
- `herramientas/e2e/perdida-red.spec.js`;
- `plantillas/runbook-respaldo-y-restauracion.md`.

**Pasos:**
1. **R1 (aplicación o API), R2 (base de datos) y R3 (proveedor externo):** seguir `caidas.md`. Durante cada caída, medir:
   ```
   node herramientas/resiliencia/medir-disponibilidad.js <url de salud> 2 > evidencia/07_resiliencia/R1_<nombre>/disponibilidad.csv
   ```
   Se detiene con Ctrl+C **al terminar el escenario**, y el resumen muestra cuánto duró cada caída. Verificar que no queda ningún monitor corriendo. Guardar los conteos de la base antes y después.
2. **R4, pérdida de red:**
   - llenar la sección `perdidaRed` de `config.json` (formulario, campos, botón y búsqueda);
   - correr `npx playwright test perdida-red.spec.js`;
   - el script corta la red al guardar y comprueba 5 condiciones:
     1. aviso visible;
     2. datos conservados en pantalla;
     3. reintento posible;
     4. se guarda al volver la red;
     5. **un solo registro** en el servidor.
3. **R5:** ver la prueba 4 (a).
4. **R6:** restaurar el último respaldo **en un entorno aparte**, **levantar una copia de la aplicación sobre la base restaurada** y medir desde el inicio del incidente hasta el primer ingreso exitoso. Comparar conteos por colección o tabla y llenar el runbook. Si el respaldo tiene datos reales, D5 debe autorizarlo y nada sale del servidor.

**Umbral:**
- los 6 escenarios con resultado documentado;
- R4 con 5 de 5 condiciones;
- la restauración en un tiempo ≤ RTO, con un respaldo de antigüedad ≤ RPO.

**Evidencia** (en `evidencia/07_resiliencia/`): una carpeta por escenario con su `RESULTADO.md`, `disponibilidad.csv`, la salida del script, las capturas y el runbook lleno.

**Errores comunes:**
- **Errores de red atrapados y descartados en silencio** (`catch(() => {})`): es la causa más frecuente de que falle R4.
- **Restaurar encima de producción.** Nunca.

---

## 8. Usabilidad (C8)

**Objetivo:** medir la facilidad de uso con los mismos participantes de C2.

**Herramientas:** la hoja de cada rol del Excel (el SUS va al final de la sesión de UAT) y `herramientas/graficas/graficas.py sus`.

**El SUS:** 10 afirmaciones, cada una de 1 (totalmente en desacuerdo) a 5 (totalmente de acuerdo):
1. Creo que me gustaría usar esta plataforma con frecuencia.
2. Encontré la plataforma innecesariamente compleja.
3. Pensé que la plataforma era fácil de usar.
4. Creo que necesitaría el apoyo de una persona técnica para poder usar la plataforma.
5. Encontré que las diferentes funciones de la plataforma estaban bien integradas.
6. Pensé que había demasiada inconsistencia en la plataforma.
7. Imagino que la mayoría de las personas aprenderían a usar esta plataforma muy rápido.
8. Encontré la plataforma muy incómoda de usar.
9. Me sentí muy seguro/a usando la plataforma.
10. Necesité aprender muchas cosas antes de poder empezar a usar la plataforma.

**Puntaje:**
- afirmaciones impares: (respuesta − 1);
- afirmaciones pares: (5 − respuesta);
- se suma y se multiplica por 2,5, para dar de 0 a 100.

El Excel lo calcula solo.

**Pasos:**
```
python3 herramientas/graficas/graficas.py sus evidencia/02-08_usuarios/pruebas-usuarios.xlsx evidencia/02-08_usuarios/grafica_sus.png
```

**Umbral:** promedio de SUS ≥ 68, éxito de tareas ≥ 85 % y al menos 1 participante por rol (`04-parametros.md`, sección 7).

**Evidencia** (en `evidencia/02-08_usuarios/`):
- el Excel, cuya hoja «Resumen» da por rol los participantes, el éxito, los errores promedio, el SUS promedio, el tiempo promedio por caso y si se cumplen las metas;
- la gráfica del SUS.

---

## 9. Documentación y cierre

No es una prueba aparte, pero sin ella no hay TRL 6. Lo exigido está en **`05-documentacion-requerida.md`** y el orden de trabajo en **`06-recorrido-paso-a-paso.md`**.

**Limpieza:** al terminar, `node herramientas/datos/limpiar.js limpiar.json --ejecutar`, con la salida guardada en `evidencia/01_integracion/limpieza_<fecha>.txt`.

**Antes de entregar:** correr `node herramientas/revisar-evidencia.js .` sobre **todo el paquete**, clasificar cada hallazgo (real o falso positivo), tapar los reales y revisar a mano las capturas, PDF y Excel. Borrar `test-results/` de Playwright: guarda lo escrito en los formularios, incluidas las claves.
