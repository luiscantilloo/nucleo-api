# Recorrido paso a paso: de cero a la entrega TRL 6

Este es el orden de trabajo completo. Cada paso dice **qué hacer, con qué archivo o comando y cómo saber que quedó bien**. Los detalles de cada prueba están en `02-guia-de-pruebas.md`. Antes de empezar, conviene leer `07-errores-que-rechazan-una-entrega.md`.

## Fase 1 · Preparación (días 1 y 2)

### Paso 1 · Parámetros firmados
- **Qué:** llenar `04-parametros.md` con el responsable del proyecto, incluida la tabla de equivalencia de entornos y el alcance de integraciones y webhooks.
- **Quedó bien si:** tiene **las dos firmas** y está fechado **antes** de la primera corrida.

### Paso 2 · Autorizaciones y agenda de las sesiones
- **Qué:**
  - `plantillas/autorizacion-pruebas-destructivas.md` (D5), con un periodo que cubra todas las fechas de prueba y las franjas horarias;
  - D4, si hay IA;
  - revisar la política del hosting sobre pruebas de carga;
  - confirmar los participantes de las sesiones: 1 por rol, ninguno del equipo de desarrollo ni de pruebas.
- **Agendar ya** las sesiones con usuarios: nombres, fechas y códigos. Es lo más lento y no depende del código.
- **Quedó bien si:** las autorizaciones están listas para firma y las sesiones tienen fecha.

### ▶ Punto de control 1
Enviar los parámetros, D5, D4 (si hay IA), la lista de participantes y la salida de la salud (`08-puntos-de-control.md`). **No se corre ninguna prueba hasta que el responsable del proyecto firme E1, D5 y D4.**

### Paso 3 · Preparar el sistema
- **Qué:**
  - un endpoint de salud que devuelve el commit desplegado, el estado de la base y la hora de arranque (`startedAt`);
  - las cuentas de prueba: una por rol, de reserva, la segunda del mismo rol para IDOR, la de bloqueo y las de carga;
  - todas activas.
- **Quedó bien si:** `curl <API>/<salud>` devuelve el commit y cada cuenta entra.

### Paso 4 · Instalar las herramientas
En una máquina **distinta** del servidor, que no se suspenda:
```
cd herramientas/e2e && npm install && npx playwright install chromium
k6 version
docker --version
python3 -c "import matplotlib, openpyxl"
```
- **Quedó bien si:** los cuatro comandos responden sin error.

### Paso 5 · Llenar las configuraciones

| Dato | Cómo encontrarlo |
|---|---|
| Ruta y cuerpo del ingreso por API | Chrome → F12 → **Network** → iniciar sesión → la petición de ingreso (URL, método y **Payload**) |
| Cookie o token, y su nombre | En la misma petición: `set-cookie` (cookie) o un `token` en la respuesta (bearer) |
| Rutas de lectura de cada rol | Recorrer las pantallas de cada rol con Network abierto. **Incluir las pesadas**: catálogos, reportes y búsquedas |
| Rutas de escritura | Guardar un formulario y anotar el `POST`, `PUT` o `PATCH` |
| Etiquetas y botones | El texto visible. Para los flujos: `npx playwright codegen <URL>` |
| Webhooks en uso y su forma de autenticación | El código del backend: cabecera de secreto o firma HMAC |

**Archivos que se llenan:**
- `herramientas/e2e/config.json`, desde `config.ejemplo.json`;
- `herramientas/e2e/matriz-acceso.json`;
- `herramientas/k6/k6.config.json`, desde `k6.config.ejemplo.json`;
- `herramientas/excel/roles.json`, desde `roles.ejemplo.json`, con 1 participante previsto por rol;
- `herramientas/datos/sembrar.json` y `limpiar.json`.

### Paso 6 · Documentación base
- **Qué:** A1, A2, B1 a B6 y V1 a V4.
- **Quedó bien si:** los diagramas coinciden con lo desplegado, y B3 coincide con lo que de verdad se envía a terceros.

## Fase 2 · Corrida de corrección (días 3 a 6)

### Paso 7 · Primera corrida automática
Con las variables definidas, **incluida `EVIDENCIA`**:
```
cd herramientas/e2e
npx playwright test | tee "$EVIDENCIA/01_integracion/corrida_<fecha>.log"
BLOQUEO=1 npx playwright test bloqueo.spec.js | tee "$EVIDENCIA/05_seguridad/S6_bloqueo_<fecha>.log"
cd ../k6 && k6 run -e CFG=k6.config.json -e BASE_URL=<api> -e VUS_OBJETIVO=<n> -e ESCALONES_CORTOS=1 -e PASS_<ROL>=... carga.js
cd ../seguridad && bash correr-escaneos.sh
cd ../datos && node limpiar.js limpiar.json
```
- **Quedó bien si:** cada falla tiene una causa entendida. **Nunca** se cambia un umbral.

### Paso 8 · Flujos
- **Qué:** completar `flujos.spec.js` con los flujos de `04-parametros.md`. El F1 va **completo, con la cuenta de cada rol**.
- **Quedó bien si:** `npx playwright test flujos.spec.js` pasa y todo lo creado lleva `TRL-QA-`.

### Paso 9 · Corregir y verificar
- **Qué:** cada hallazgo se corrige con un commit y se repite la prueba que lo encontró.
- **Quedó bien si:** el antes y el después quedan en `RESULTADOS_S1-S15.md` y en los resúmenes, con los commits.

### ▶ Punto de control 2
Enviar la primera corrida, la lista de hallazgos con su estado, el borrador de E2 y las solicitudes de decisión (`08-puntos-de-control.md`). **No se congela hasta tener el visto bueno.**

## Fase 3 · Versión declarada y corrida final (días 7 a 10)

### Paso 10 · Congelar la versión
```
curl -s <API>/<salud> > evidencia/00_version/salud_firma_E2_<fecha>.json
```
- **Qué:** firmar `plantillas/declaracion-version-final.md` (las dos firmas), guardar la salud al firmar y el registro de despliegue del frontend. Desde aquí **no hay despliegues**.
- **Quedó bien si:** la salud devuelve el commit declarado.

### Paso 11 · Corrida final automática, todo sobre la versión declarada
Antes y después de **cada** corrida, guardar la salud (`salud_inicio_<prueba>_<fecha>.json` y `salud_fin_<prueba>_<fecha>.json`):
1. la suite completa: `npx playwright test`, que incluye C1, el F1 completo, S1–S4, S7–S9, S13, C6 y R4;
2. `BLOQUEO=1 npx playwright test bloqueo.spec.js`, más la comprobación del bloqueo por cuenta desde otra IP;
3. la carga con el **perfil completo** (sin `ESCALONES_CORTOS`);
4. el estrés, la recuperación (`ESCALONES_CORTOS=1`) y el soak de 2 h;
5. `correr-escaneos.sh`: ZAP autenticado con los roles principales, TLS, dependencias y gitleaks;
6. R1 a R3 con `medir-disponibilidad.js` (detenerlo al terminar), y R6 con la aplicación levantada sobre la base restaurada.
- **Quedó bien si:** se cumplen los umbrales, el `startedAt` de la salud no cambia dentro de cada corrida (salvo en R1), y todas las fechas caen dentro del periodo de D5.

### Paso 12 · Sesiones con usuarios
1. Generar el Excel:
   ```
   python3 herramientas/excel/generar_excel.py evidencia/02-08_usuarios/pruebas-usuarios.xlsx herramientas/excel/roles.json
   ```
2. Hacer cada sesión con `plantillas/guion-sesion-usuarios.md` y llenar `plantillas/hoja-de-registro-sesion.md`.
3. Al final, el SUS.
- **Quedó bien si:** el resumen del Excel muestra ≥ 90 % sin ayuda, éxito ≥ 85 % y SUS ≥ 68; hay 0 defectos críticos abiertos y las hojas de registro y el acta están firmadas.

## Fase 4 · Cierre (días 11 y 12)

### Paso 13 · Gráficas
```
python3 herramientas/graficas/graficas.py k6  evidencia/03_carga/series.csv evidencia/03_carga/grafica_carga.png "Carga"
python3 herramientas/graficas/graficas.py k6  evidencia/04_estres_estabilidad/estres_series.csv evidencia/04_estres_estabilidad/grafica_estres.png "Estrés"
python3 herramientas/graficas/graficas.py k6  evidencia/04_estres_estabilidad/soak_series.csv evidencia/04_estres_estabilidad/grafica_soak.png "Soak"
node herramientas/k6/degradacion.js evidencia/04_estres_estabilidad/soak_series.csv > evidencia/04_estres_estabilidad/degradacion.txt
```

### Paso 14 · Documentación de cierre
- A3 completa, A4 con las versiones, y B1 a B8 en la versión declarada.
- B7 con los riesgos aceptados y quién los aceptó.
- El reporte (`plantillas/reporte-de-pruebas.md`) y el checklist.

### Paso 15 · Limpieza y revisión de la evidencia
```
node herramientas/datos/limpiar.js limpiar.json --ejecutar | tee evidencia/01_integracion/limpieza_<fecha>.txt
node herramientas/revisar-evidencia.js .
```
- **Quedó bien si:**
  - cada hallazgo del script está clasificado (real o falso positivo) en `evidencia/otros/revision_evidencia_<fecha>.md`, y los reales están tapados;
  - se revisaron a mano todas las capturas, PDF y Excel;
  - `test-results/` está borrado.

### Paso 16 · Entregar (▶ Punto de control 3)
- **Qué:** el paquete completo por un **enlace privado**.
- **Quedó bien si:** el checklist está completo y cada `[x]` apunta a un archivo.
