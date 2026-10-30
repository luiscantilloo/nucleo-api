# Seguridad (C5) · Resultados S1 a S15

**Versión:** `[commits]` · **Fecha:** `[…]` · **Autorización de las pruebas:** `[quién y cuándo]`

| Control | Herramienta | Resultado | Versión | Evidencia | Hallazgo y corrección (commit) |
|---|---|---|---|---|---|
| S1 IDOR | `idor.spec.js` | | | `S1_idor_*.json` | |
| S2 Matriz rol × recurso | `matriz-acceso.spec.js` | | | `matriz_*.json` | |
| S3 Sesión | `e2e.spec.js` G-05 y G-06 | | | | |
| S4 Rutas protegidas | `e2e.spec.js` G-04 y la matriz (anónimo) | | | | |
| S5 Creación de cuentas | Matriz de acceso | | | | |
| S6 Límite de intentos | `bloqueo.spec.js` | | | `S6_bloqueo_*.json` | |
| S7 Política de claves | `claves.spec.js` (o manual, `seguridad.md` 3) | | | `S7_claves_*.json` | |
| S8 Inyección y XSS | `inyeccion.spec.js` + revisión en pantalla | | | `S8_*.json` y capturas | |
| S9 Cabeceras | `e2e.spec.js` G-07 y `correr-escaneos` (curl y ZAP) | | | `cabeceras_*.txt` | |
| S10 TLS | `correr-escaneos` (testssl.sh) o SSL Labs | | | `tls.txt` | |
| S11 Dependencias | `correr-escaneos` (`npm audit` o `pip-audit`) | | | `npm_audit_*.json` | |
| S12 Secretos | `correr-escaneos` (gitleaks) | | | `gitleaks_*.json` | |
| S13 Integraciones autenticadas | `webhooks.spec.js` | | | `S13_*.json` | |
| S14 Rama protegida | Captura | | | | |
| S15 IA (si aplica) | `ia/prueba-adversarial-ia.md` | | | | |
| ZAP autenticado | ZAP | Altas: _ · Medias: _ | | `zap_*.html` | |

**Hallazgos abiertos y aceptados (con su justificación):**
