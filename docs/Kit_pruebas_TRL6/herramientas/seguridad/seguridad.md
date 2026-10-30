# Seguridad: comandos y procedimientos (C5)

Todo se guarda en `evidencia/05_seguridad/`, sin claves, tokens ni cookies.

**Necesita autorización escrita** del dueño de la infraestructura.

**Automático:** `correr-escaneos.sh` (o `correr-escaneos.ps1` en Windows) hace las secciones 1 y 2 de una vez: cabeceras, ZAP base y autenticado, TLS, dependencias y secretos. Lo que sigue explica cada comando, por si hay que correrlo suelto.

**Con scripts de Playwright** (`herramientas/e2e/`): S1 `idor.spec.js`, S2/S4/S5 `matriz-acceso.spec.js`, S6 `bloqueo.spec.js`, S7 `claves.spec.js`, S8 `inyeccion.spec.js` y S13 `webhooks.spec.js`.

## 1. ZAP autenticado (S9 y alertas)

**Escaneo base**, pasivo, sin sesión, para ver la superficie pública:
```
docker run --rm -v "$PWD:/zap/wrk" ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py -t <BASE_URL> -r zap_base.html -J zap_base.json
```

**Escaneo autenticado**, uno por rol:
1. Iniciar sesión con la cuenta de prueba del rol y copiar el valor de la cookie de sesión o del token. **No se guarda en ningún archivo.**
2. Correr:
```
docker run --rm -v "$PWD:/zap/wrk" \
  -e ZAP_AUTH_HEADER="Cookie" -e ZAP_AUTH_HEADER_VALUE="<nombreCookie>=<valor>" \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-full-scan.py -t <BASE_URL> -r zap_<rol>.html -J zap_<rol>.json -m 10
```
   - Con token: `-e ZAP_AUTH_HEADER="Authorization" -e ZAP_AUTH_HEADER_VALUE="Bearer <token>"`.
   - Para la API, si tiene OpenAPI: `zap-api-scan.py -t <url del openapi.json> -f openapi`.
3. Al terminar, **cerrar la sesión** o rotar la clave de la cuenta de prueba.

**Umbral:** 0 alertas altas. Cada alerta media se revisa: se corrige o se justifica en `RESULTADOS_S1-S15.md`.

> **Ojo:** el escaneo completo hace peticiones que pueden crear o modificar datos. Debe correr con las cuentas de prueba y en el espacio de prueba. Si hay riesgo, use solo `zap-baseline.py` con sesión y documente por qué.

## 2. TLS, cabeceras, dependencias, secretos y rama (S9 a S12 y S14)

```
# S10 · TLS (o SSL Labs: https://www.ssllabs.com/ssltest/)
docker run --rm drwetter/testssl.sh --quiet --color 0 <dominio> > tls.txt

# S9 · Cabeceras
curl -sI <BASE_URL> > cabeceras_app.txt
curl -sI <API_URL>/<ruta de salud> > cabeceras_api.txt

# S11 · Dependencias (en cada repositorio; con otro lenguaje, use su equivalente: pip-audit, bundler-audit…)
npm audit --omit=dev --json > npm_audit_<repo>.json

# S12 · Secretos en el código y en el historial
docker run --rm -v "$PWD:/repo" zricethezav/gitleaks:latest detect -s /repo --report-format json --report-path /repo/gitleaks_<repo>.json
```

**S14 · rama protegida:** captura de la configuración de protección de la rama principal (revisión obligatoria antes de unir y sin escritura directa).

## 3. Sesión, intentos y claves (S3, S6 y S7)

| Control | Cómo |
|---|---|
| S3 | `e2e.spec.js`, casos G-05 y G-06. Además, una sesión vencida no entra. Si el vencimiento es largo, se revisa su valor en la configuración y se captura |
| S6 | Con una **cuenta creada solo para esta prueba**: N intentos fallidos seguidos y luego la clave correcta → debe estar bloqueada, con un mensaje genérico. Pasado el tiempo de bloqueo → entra. Se registran N, el tiempo y las respuestas. También con un correo inexistente: el mensaje debe ser el mismo |
| S7 | Crear cuentas (como el rol autorizado) con claves débiles: cortas, iguales al correo o al nombre, comunes. Todas deben rechazarse con un mensaje claro. Se registran el intento y la respuesta, **no la clave** |

## 4. Inyección y XSS (S8)

Probar en **cada campo de texto** de los formularios y en el cuerpo JSON de la API, con las cuentas de prueba y los datos con el prefijo.

| Tipo | Cargas de prueba |
|---|---|
| XSS | `<script>alert(1)</script>` · `"><img src=x onerror=alert(1)>` · `javascript:alert(1)` |
| NoSQL | `{"email": {"$ne": null}, "password": {"$ne": null}}` en el ingreso · `{"$gt": ""}` en filtros |
| SQL | `' OR '1'='1` · `'; DROP TABLE x; --` |
| Tipos inesperados | Un objeto donde va un texto, un número enorme, una cadena de 10.000 caracteres |

**Cumple si:**
- la API rechaza la carga (400 o 422) o la guarda como texto;
- al mostrarla, se ve escapada y no se ejecuta;
- el ingreso con operadores NoSQL no entra.

Se guardan capturas y un `.json` con la petición, el estado y la respuesta resumida.

## 5. IDOR y aislamiento (S1)

1. Con la cuenta A crear un recurso (prefijo) y anotar su id.
2. Con la cuenta B, del **mismo rol**, intentar `GET`, `PUT/PATCH` y `DELETE` sobre ese id. Debe dar 403 o 404.
3. Repetir con una cuenta de **otro rol** sin permiso, y con ids inventados o consecutivos.
4. Si hay espacios separados (organizaciones, territorios o tenants), intentar leer un recurso de otro espacio. Debe dar 403 o 404.

Se registra en `S1_idor.json`: método, ruta, cuenta (rol), estado esperado y estado real.

## 6. Integraciones autenticadas (S13)

Automático con `webhooks.spec.js`. A mano: para cada webhook o servicio interno: una llamada **sin** secreto o firma (debe dar 401 o 403), una **con un secreto incorrecto** (401 o 403) y una **con el correcto** (funciona). Se guardan los estados y las capturas antes y después de la corrección, si la hubo.

## 7. Tabla de resultados

`RESULTADOS_S1-S15.md`:

| Control | Resultado | Versión (commit) | Evidencia | Hallazgo y corrección |
|---|---|---|---|---|
| S1 IDOR | Cumple / No cumple | | `S1_idor.json` | |
| … | | | | |
