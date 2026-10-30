# Marco TRL 6: criterios y umbrales

## 1. Qué hay que demostrar en cada nivel

| Nivel | Qué significa en software | Evidencia mínima |
|---|---|---|
| TRL 1 a 3 | Concepto y prueba de concepto | Expediente del problema y del concepto, requisitos con identificador, arquitectura y un prototipo con un flujo de punta a punta |
| TRL 4 | Módulos integrados en laboratorio | Suite e2e con datos sintéticos, que corre completa con un comando |
| TRL 5 | Integración en un entorno relevante | La suite corre contra el entorno desplegado en la nube, desde otra máquina; carga básica; seguridad base; respaldo restaurable |
| **TRL 6** | **Sistema completo demostrado en un entorno relevante** | **Los 8 bloques de la sección 3 cumplen, corridos sobre la infraestructura real** (producción o un entorno equivalente), sobre una **versión declarada**, con **todos los roles**, más la **documentación técnica** de `05-documentacion-requerida.md` |
| TRL 7 | Prototipo del sistema completo en el entorno operacional | Lo de TRL 6, más usuarios reales externos de cada rol (≥ 5 del principal, ≥ 5 del segundo y ≥ 2 de los demás), manuales por rol, documentos legales revisados y visuales completos. **Este kit no lo cubre** |

**Cómo se redacta el veredicto:**
- Si los 8 bloques cumplen y la documentación exigida está completa: «TRL 6».
- Se puede agregar, si es cierto: «con avances hacia TRL 7» y en qué consisten.
- **Nunca se afirma un nivel mayor** al demostrado.

## 2. Reglas del marco

1. **Evidencia por referencia.** Cada criterio apunta a un archivo dentro de `evidencia/`.
2. **Tres estados:**
   - **Cumple:** pasa el umbral, con evidencia.
   - **Parcial:** se ejecutó, pero falta una condición concreta y nombrada.
   - **Pendiente:** no se ha ejecutado.
3. **Un nivel se aprueba** cuando los 8 bloques cumplen. «Aprobado con condiciones» solo cabe si lo abierto no está en ningún umbral de C1 a C8 y tiene una fecha.
4. **Los umbrales no se mueven después de ver resultados.**
5. **Versión declarada:** las corridas finales se hacen sobre el commit declarado en E2, después de su firma, con la salud del sistema al inicio y al final de cada corrida. Si se despliega algo después, se declara una versión nueva y se repiten las pruebas afectadas. Las que no se repiten se justifican con la salida de `git diff --stat <versión anterior> <versión nueva>`.
6. **Entorno equivalente:** si no se prueba en producción, se documenta en qué se parece y en qué se diferencia el entorno de pruebas: proveedor, región, CPU, RAM, versiones de servicios y volumen de datos.

## 3. Los 8 bloques y sus umbrales

| # | Bloque | Cumple si… |
|---|---|---|
| **C1** | Integración de extremo a extremo | La suite e2e cubre **todos los roles** y **al menos un flujo de punta a punta**, ejecutado completo con la cuenta de cada rol. Corre sobre la versión declarada. **≥ 90 % de los casos ejecutados pasan**, y cada falla u omisión tiene una causa documentada |
| **C2** | Funcionales y de aceptación (UAT) | Al menos **1 persona por cada rol**, que **no haya participado en el desarrollo ni en las pruebas** (puede ser interna), ejecuta los casos de su rol. **≥ 90 % de los casos se cumplen sin ayuda, 0 defectos críticos abiertos** y acta firmada. Las personas de los roles del flujo de punta a punta lo recorren en orden |
| **C3** | Rendimiento y carga | Con k6, a la **concurrencia objetivo** de `04-parametros.md`, con un **volumen de datos realista**, la mezcla de roles y el **perfil completo** (16 min): **p95 < 2 s y errores < 1 %** |
| **C4** | Estrés y estabilidad | (a) **Estrés:** se identifica el punto de quiebre (usuarios con p95 ≥ 2 s o errores ≥ 1 %), y el sistema **se recupera solo, sin intervención**, después de bajar la carga. (b) **Soak:** **mínimo 2 h** con **p95 < 2 s, errores < 1 % y degradación ≤ 10 %** entre la primera y la última hora, calculada con `degradacion.js` del kit. Se registran la CPU y la memoria del servidor |
| **C5** | Seguridad | Los **controles S1 a S14** de la sección 4 verificados (y S15 si hay IA), **0 alertas altas en ZAP autenticado**, TLS correcto y **0 dependencias con vulnerabilidad crítica** |
| **C6** | Interoperabilidad | **Un intercambio real registrado por cada integración del alcance** de `04-parametros.md`, con fecha, versión, resultado y **su archivo** (log o json). Sin claves en la evidencia |
| **C7** | Resiliencia y recuperación | Los **6 escenarios** de la sección 5 probados, y la **restauración de un respaldo medida contra el RTO y el RPO** |
| **C8** | Usabilidad | Cuestionario **SUS ≥ 68** de promedio y **éxito de tareas ≥ 85 %**, con los mismos participantes de C2. Se registran los errores y el tiempo por tarea |

> C2 y C8 se hacen en las mismas sesiones: primero los casos y al final el SUS.

## 4. Controles de seguridad (C5)

| # | Control | Cómo se verifica |
|---|---|---|
| S1 | **Aislamiento entre usuarios (IDOR):** nadie lee ni modifica datos de otro cambiando un id | `idor.spec.js` sobre **cada tipo de recurso sensible** (por ejemplo, órdenes, pagos, perfiles y documentos), con dos cuentas del mismo rol y una de otro rol: 403 o 404 |
| S2 | **Matriz rol × recurso** | `matriz-acceso.spec.js`: 0 diferencias con la matriz esperada |
| S3 | **Sesión segura:** con vencimiento; cookie `HttpOnly`, `Secure` y `SameSite` (si es cookie); una sesión alterada no entra | `e2e.spec.js` G-05 y G-06 |
| S4 | **Rutas protegidas:** sin sesión, 401 | `e2e.spec.js` G-04 y la matriz, rol «anónimo» |
| S5 | **Creación de cuentas solo por el rol autorizado** | Matriz de acceso |
| S6 | **Límite de intentos y bloqueo temporal**, por IP **y por cuenta** | `bloqueo.spec.js` con una cuenta dedicada; verificar que la cuenta queda bloqueada también desde otra IP |
| S7 | **Política de claves** | `claves.spec.js` |
| S8 | **Inyección y XSS** | `inyeccion.spec.js` |
| S9 | **Cabeceras de seguridad** | `e2e.spec.js` G-07 y `correr-escaneos.sh` |
| S10 | **TLS** sin protocolos obsoletos (A o mayor) | `correr-escaneos.sh` o SSL Labs |
| S11 | **Dependencias** sin vulnerabilidades críticas | `npm audit`, `pip-audit` o su equivalente |
| S12 | **Sin secretos** en el código ni en el historial | gitleaks |
| S13 | **Toda integración entrante autenticada:** cada webhook en uso (pagos, mensajería, tiendas, transportadoras…) rechaza llamadas sin secreto o sin firma **y acepta la correcta** | `webhooks.spec.js`, con el caso positivo **obligatorio**; admite firma HMAC (por ejemplo, `X-Hub-Signature-256`) |
| S14 | **Rama principal protegida** | Reglas efectivas de la rama exportadas o en captura. Si hay un solo desarrollador, se declara el riesgo |
| S15 | **Solo si hay IA:** no se envían identificadores ni datos sensibles que no hagan falta; el contexto se limita a lo que el usuario puede ver; hay resistencia a la inyección de instrucciones; la IA no ejecuta acciones irreversibles sin confirmación humana | `herramientas/ia/` y la aprobación del flujo de datos con la IA (D4) |

## 5. Escenarios de resiliencia (C7)

| # | Escenario | Cumple si… |
|---|---|---|
| R1 | **Caída de la aplicación o de la API** | Vuelve sola y no se pierde lo guardado (conteos antes y después). Se mide el tiempo con `medir-disponibilidad.js`, **y el monitor se detiene al terminar** |
| R2 | **Caída de la base de datos** | Error claro (no un 500 genérico), la salud lo detecta y se recupera sola |
| R3 | **Caída de un proveedor externo** | El resto sigue funcionando, con un mensaje o respaldo. Los protocolos críticos no dependen del proveedor caído |
| R4 | **Pérdida de red del usuario mientras guarda** | 5 de 5 condiciones de `perdida-red.spec.js`, sin duplicados |
| R5 | **Recuperación después del estrés** | Ver C4 (a) |
| R6 | **Respaldo y restauración** | Se restaura **en un entorno aparte**, **se levanta la aplicación sobre la base restaurada** y se mide hasta el primer ingreso: **tiempo ≤ RTO** y **antigüedad del respaldo ≤ RPO**. Runbook lleno |

## 6. Quién firma qué

| Documento | Responsable técnico | Responsable del proyecto |
|---|---|---|
| E1 Parámetros y sus adendas | Firma | **Firma** (sin su firma, los parámetros no valen) |
| E2 Declaración de la versión | Firma | Firma |
| D4 Flujo de datos con la IA | Firma | **Firma** |
| D5 Autorización de pruebas destructivas | Firma (como dueño de la infraestructura, si lo es) | Firma |
| E5 Acta de las sesiones | — | Firma, con un representante de los usuarios |
| E6 Reporte y E7 checklist | Firma | Firma al aprobar |
