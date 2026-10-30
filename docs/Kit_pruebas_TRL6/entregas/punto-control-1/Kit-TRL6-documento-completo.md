# Kit de pruebas TRL 6 · Documento completo

Este documento reúne en un solo archivo las guías del kit. Los scripts y las plantillas están en el paquete `Kit_pruebas_TRL6.zip`.

**Cómo se trabaja:** el kit se entrega completo desde el día 1, y el trabajo se revisa en tres puntos de control (sección 2): antes de correr cualquier prueba, antes de congelar la versión y en la entrega final.

## Contenido

1. `00-LEEME.md`
2. `08-puntos-de-control.md`
3. `01-marco-TRL6.md`
4. `04-parametros.md`
5. `02-guia-de-pruebas.md`
6. `05-documentacion-requerida.md`
7. `06-recorrido-paso-a-paso.md`
8. `07-errores-que-rechazan-una-entrega.md`
9. `03-checklist-TRL6.md`
10. `herramientas/LEEME.md`
11. `evidencia/LEEME.md`



---

<!-- 00-LEEME.md -->

## Kit de pruebas para demostrar TRL 6

**Para:** el equipo de desarrollo · **Versión:** 1 (basada en el kit TRL 7 v4 y en una evaluación real de tres rondas) · octubre de 2026 · **Confidencial**

### Qué es

Este kit sirve para **probar y documentar que una plataforma de software está en TRL 6**: el **sistema completo**, con **todos sus roles**, probado en un **entorno relevante sobre la infraestructura real** (producción o un entorno equivalente), con **8 pruebas que cumplen umbrales fijos**.

Las 8 pruebas:
1. Integración de extremo a extremo.
2. Funcionales y de aceptación (UAT).
3. Rendimiento y carga.
4. Estrés y estabilidad.
5. Seguridad.
6. Interoperabilidad.
7. Resiliencia y recuperación.
8. Usabilidad.

**Los umbrales, las herramientas y la forma de entregar la evidencia no se cambian.** Si algo no se puede cumplir, se declara con su causa y se pide una decisión por escrito al responsable del proyecto. Nunca se ajusta la prueba para que pase.

### Orden de lectura

| # | Archivo | Para qué |
|---|---|---|
| 1 | `01-marco-TRL6.md` | Qué significa TRL 6, las reglas, los umbrales y quién firma qué |
| 2 | `04-parametros.md` | **Se llena y se firma antes de correr cualquier prueba:** entorno, roles, cuentas, concurrencia, RTO y RPO, integraciones y participantes |
| 3 | `02-guia-de-pruebas.md` | Cómo se hace cada prueba: herramienta, preparación, pasos, umbral, evidencia y errores comunes |
| 4 | `05-documentacion-requerida.md` | Qué documentos hay que entregar para TRL 6 |
| 5 | `06-recorrido-paso-a-paso.md` | El orden de trabajo completo, de cero a la entrega, y cómo saber que cada paso quedó bien |
| 6 | `07-errores-que-rechazan-una-entrega.md` | **Lo que hizo rechazar entregas reales.** Leerlo antes de empezar ahorra rondas |
| 7 | `08-puntos-de-control.md` | **Las tres revisiones durante el trabajo:** qué se envía en cada una y qué se revisa. No se avanza sin el visto bueno de la anterior |
| 8 | `03-checklist-TRL6.md` | Lista para marcar el avance. Se entrega llena |
| 9 | `herramientas/` | Los scripts. Inventario en `herramientas/LEEME.md` |
| 10 | `plantillas/` | Parámetros, adenda, declaración de versión, autorización de pruebas destructivas, hoja de registro de sesión, acta, reporte, runbook, matriz de requisitos y demás |
| 11 | `evidencia/` | La carpeta vacía, con la estructura de entrega |

### Cómo se trabaja

1. **Día 1:** llenar `04-parametros.md`, D5 (y D4 si hay IA) y **empezar a agendar las sesiones con usuarios**.
2. **Punto de control 1:** se envían los parámetros y las autorizaciones. El responsable del proyecto los revisa y los firma. **Ninguna prueba se corre antes.**
3. **Fase de corrección:** correr las pruebas automáticas y corregir lo que falle. Cada corrección es un commit.
4. **Punto de control 2:** se envían los resultados, los hallazgos y el borrador de E2. Con el visto bueno, se congela la versión: E2 con las dos firmas y la salud guardada al firmar. Desde ahí no hay despliegues.
5. **Corrida final:** repetir sobre la versión congelada todas las pruebas automáticas, con la salud al inicio y al final de cada corrida, y hacer las sesiones con usuarios.
6. **Punto de control 3, entrega final:** `evidencia/` llena, el checklist marcado y el reporte completo, por un enlace privado.

Qué se envía y qué se revisa en cada punto de control: `08-puntos-de-control.md`.

El recorrido completo, día por día, está en `06-recorrido-paso-a-paso.md`.

### Reglas que no se negocian

1. **Nunca datos reales de personas** en pruebas, capturas, videos, trazas ni reportes. Todo dato de prueba lleva el prefijo `TRL-QA-`.
2. **Nunca claves, tokens, cookies ni identificadores reales** de clientes, cuentas o números (por ejemplo, ids de WhatsApp o números de documento) en la evidencia. Las claves van solo en variables de entorno.
3. **Los umbrales se fijan antes de ver resultados** y no se mueven.
4. **Lo que no tiene archivo no está demostrado.** Cada afirmación del reporte apunta a un archivo de la evidencia: un log, un json, un csv o una captura.
5. **Las decisiones de alcance las firma el responsable del proyecto.** El desarrollador puede proponer, pero no decide solo sobre exclusiones, riesgos aceptados ni cambios de parámetros.
6. **Pruebas destructivas solo dentro del periodo y las franjas de D5 firmada:** carga, estrés, caídas, escaneos, bloqueo de cuentas y uso de respaldos.
7. **Los cambios en producción** (configuración, desactivar funciones de clientes, migraciones) no son pruebas: se avisan antes al responsable del proyecto.
8. **No se afirma un nivel mayor al demostrado.** El reporte dice «TRL 6» solo si los 8 bloques cumplen y la documentación exigida está completa.

### Qué se entrega al final

| Entregable | Formato |
|---|---|
| `evidencia/` completa, una carpeta por prueba | .json, .csv, .log, .png, .md |
| Reporte de pruebas | .md y .pdf |
| Checklist TRL 6 marcado | .md |
| Parámetros (E1) firmados, con sus adendas | .pdf, con las dos firmas |
| Declaración de la versión final (E2) firmada, con la salud al firmar | .pdf y .json |
| Autorización de pruebas destructivas (D5) firmada | .pdf |
| Aprobación del flujo de datos con la IA (D4), si el sistema usa IA | .pdf, con las dos firmas |
| Excel de las sesiones, hojas de registro firmadas y acta | .xlsx y .pdf |
| Documentación A1–A4 y B1–B8, con los diagramas V1–V4 | PDF y editable |

---

<!-- 08-puntos-de-control.md -->

## Puntos de control: tres revisiones durante el trabajo

El kit se entrega completo desde el día 1, pero el trabajo se revisa en **tres puntos de control**. Los dos primeros son revisiones cortas (alrededor de una hora) que detectan a tiempo los errores que obligan a repetir días de pruebas: firmas, alcance, fechas de autorización y versión. **No se avanza al paso siguiente sin el visto bueno del punto de control anterior.**

### Resumen

| Punto | Cuándo | Qué se envía | Qué se revisa | Resultado |
|---|---|---|---|---|
| **1. Antes de correr cualquier prueba** | Días 1 y 2 | Parámetros, D5, D4 (si hay IA) y la lista de participantes | Alcance, webhooks, fechas de autorización y participantes | Firma del responsable del proyecto en E1, D5 y D4 |
| **2. Antes de congelar la versión** | Alrededor del día 6 | Resultados de la primera corrida, correcciones y borrador de E2 | Que no quede nada grande abierto y que la configuración de las pruebas sea la correcta | Visto bueno para congelar y firmas de E2 |
| **3. Entrega final** | Días 10 a 12 | El paquete completo | Auditoría completa | Veredicto |

### Día 1, en paralelo: agendar las sesiones con usuarios

Conseguir 1 persona por rol que no haya participado en el desarrollo ni en las pruebas es lo más lento y no depende del código. Se empieza el día 1: se confirman nombres, fechas y horas, y se asigna un código a cada participante. Las sesiones se hacen después de congelar la versión (paso 12 del recorrido).

### Punto de control 1 · Antes de correr cualquier prueba

**Se envía:**
1. `04-parametros.md` lleno, con la firma del responsable técnico:
   - la tabla de equivalencia entre el entorno de pruebas y producción;
   - **todas** las integraciones, con la columna «¿En el alcance de C6?» y la columna «¿Webhook entrante?»;
   - las rutas de carga de cada rol, incluidas las pesadas;
   - la concurrencia objetivo con su cálculo, el RTO y el RPO.
2. D5 (`plantillas/autorizacion-pruebas-destructivas.md`), con un periodo que cubre **todas** las fechas previstas, incluida la fase de corrección.
3. D4 (`plantillas/aprobacion-flujo-datos-IA.md`), si el sistema usa IA, con lo que de verdad se envía al proveedor.
4. La lista de participantes de las sesiones: rol, código y fecha prevista. Los nombres van aparte, solo al responsable del proyecto.
5. La salida del endpoint de salud, que demuestre que devuelve el commit desplegado.

**Se revisa:**
- que ninguna exclusión de alcance esté decidida sin la firma del responsable del proyecto;
- que todos los webhooks entrantes en uso estén en la lista de S13, incluidos los de integraciones fuera de C6;
- que el periodo de D5 cubra las fechas, en la zona horaria del documento;
- que los participantes no sean del equipo de desarrollo ni de pruebas.

**Resultado:** el responsable del proyecto firma E1, D5 y D4. **Ninguna prueba se corre antes de estas firmas.**

### Punto de control 2 · Antes de congelar la versión

**Se envía:**
1. La salida de la primera corrida completa: la suite e2e, la carga con `ESCALONES_CORTOS`, los escaneos de seguridad, el bloqueo y los webhooks.
2. La lista de hallazgos y su estado: corregido (con el commit) o abierto (con la causa y la propuesta).
3. El borrador de E2 (`plantillas/declaracion-version-final.md`), con los commits que se van a congelar.
4. Las solicitudes de decisión, si las hay: exclusiones, riesgos que se propone aceptar o cambios de parámetros, cada una en el formato de `plantillas/adenda-parametros.md`.

**Se revisa:**
- que cada falla tenga su causa y que no quede ningún defecto grande abierto que obligue a descongelar después;
- que el F1 corra completo, con la cuenta de cada rol;
- que S13 tenga el caso positivo de cada webhook;
- que la configuración de la carga use las rutas reales y la compresión, si el cliente comprime;
- que las solicitudes de decisión estén claras para que el responsable del proyecto decida.

**Resultado:** las decisiones firmadas (adenda) y el visto bueno para congelar. Al congelar, se firma E2 (las dos firmas) y se guarda `salud_firma_E2_<fecha>.json`. **Después de E2 no hay despliegues.** Si hace falta uno, se avisa antes, porque obliga a una versión nueva.

### Punto de control 3 · Entrega final

**Se envía:** el paquete completo de `00-LEEME.md`, «Qué se entrega al final», con el checklist marcado.

**Se revisa:** la auditoría completa:
- los valores recalculados desde los datos crudos;
- la versión y las fechas de cada corrida;
- los datos sensibles;
- la documentación;
- la coherencia entre el reporte, el checklist y la evidencia.

**Resultado:** el veredicto: Aprobado TRL 6, Aprobado con condiciones (con fecha) o No aprobado (con la lista de tareas).

### Cómo se envía cada punto de control

Una carpeta comprimida por enlace privado, con un `LEEME.md` corto que diga qué se envía y qué se pide (firmas, decisiones o visto bueno). Nunca claves ni datos reales.

---

<!-- 01-marco-TRL6.md -->

## Marco TRL 6: criterios y umbrales

### 1. Qué hay que demostrar en cada nivel

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

### 2. Reglas del marco

1. **Evidencia por referencia.** Cada criterio apunta a un archivo dentro de `evidencia/`.
2. **Tres estados:**
   - **Cumple:** pasa el umbral, con evidencia.
   - **Parcial:** se ejecutó, pero falta una condición concreta y nombrada.
   - **Pendiente:** no se ha ejecutado.
3. **Un nivel se aprueba** cuando los 8 bloques cumplen. «Aprobado con condiciones» solo cabe si lo abierto no está en ningún umbral de C1 a C8 y tiene una fecha.
4. **Los umbrales no se mueven después de ver resultados.**
5. **Versión declarada:** las corridas finales se hacen sobre el commit declarado en E2, después de su firma, con la salud del sistema al inicio y al final de cada corrida. Si se despliega algo después, se declara una versión nueva y se repiten las pruebas afectadas. Las que no se repiten se justifican con la salida de `git diff --stat <versión anterior> <versión nueva>`.
6. **Entorno equivalente:** si no se prueba en producción, se documenta en qué se parece y en qué se diferencia el entorno de pruebas: proveedor, región, CPU, RAM, versiones de servicios y volumen de datos.

### 3. Los 8 bloques y sus umbrales

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

### 4. Controles de seguridad (C5)

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

### 5. Escenarios de resiliencia (C7)

| # | Escenario | Cumple si… |
|---|---|---|
| R1 | **Caída de la aplicación o de la API** | Vuelve sola y no se pierde lo guardado (conteos antes y después). Se mide el tiempo con `medir-disponibilidad.js`, **y el monitor se detiene al terminar** |
| R2 | **Caída de la base de datos** | Error claro (no un 500 genérico), la salud lo detecta y se recupera sola |
| R3 | **Caída de un proveedor externo** | El resto sigue funcionando, con un mensaje o respaldo. Los protocolos críticos no dependen del proveedor caído |
| R4 | **Pérdida de red del usuario mientras guarda** | 5 de 5 condiciones de `perdida-red.spec.js`, sin duplicados |
| R5 | **Recuperación después del estrés** | Ver C4 (a) |
| R6 | **Respaldo y restauración** | Se restaura **en un entorno aparte**, **se levanta la aplicación sobre la base restaurada** y se mide hasta el primer ingreso: **tiempo ≤ RTO** y **antigüedad del respaldo ≤ RPO**. Runbook lleno |

### 6. Quién firma qué

| Documento | Responsable técnico | Responsable del proyecto |
|---|---|---|
| E1 Parámetros y sus adendas | Firma | **Firma** (sin su firma, los parámetros no valen) |
| E2 Declaración de la versión | Firma | Firma |
| D4 Flujo de datos con la IA | Firma | **Firma** |
| D5 Autorización de pruebas destructivas | Firma (como dueño de la infraestructura, si lo es) | Firma |
| E5 Acta de las sesiones | — | Firma, con un representante de los usuarios |
| E6 Reporte y E7 checklist | Firma | Firma al aprobar |

---

<!-- 04-parametros.md -->

## Parámetros de las pruebas (E1)

**Se llena antes de correr cualquier prueba y lo firman el responsable técnico y el responsable del proyecto.** Desde la firma, estos valores no cambian. Todo cambio posterior va en la sección 9 o en una adenda (`plantillas/adenda-parametros.md`), y solo vale con la firma del responsable del proyecto.

**Sistema:** `[nombre]` · **Objetivo:** TRL 6 · **Versión del documento:** `[1]` · **Fecha:** `[fecha]`

### 1. Sistema y entorno

| Campo | Valor |
|---|---|
| Nombre del sistema | |
| Qué hace (una línea) | |
| URL de la aplicación (entorno de pruebas) | |
| URL de la API | |
| Endpoint de salud que devuelve el commit desplegado | Por ejemplo, `/api/health` → `{ status, db, commit, startedAt }` |
| ¿Producción o entorno equivalente? | |
| Si es equivalente, la tabla de equivalencia | Proveedor, región, vCPU, RAM, disco, sistema operativo, servidor web, base de datos, versión del runtime y volumen de datos, de **producción y de pruebas** lado a lado |
| Repositorios y rama | |
| Tecnología (frontend, API y base de datos) | |
| Hosting de cada parte | |

### 2. Roles y cuentas de prueba

**Las claves no van aquí.** Se entregan por un canal privado y se usan solo como variables de entorno.

| Rol | Qué hace | Cuenta de prueba | Cuenta de reserva | Activa |
|---|---|---|---|---|
| | | | | |

- Una **segunda cuenta del mismo rol** del dueño de los recursos, para IDOR (S1). Si hay recursos de varios tipos de rol (por ejemplo, comercio y bodega), una segunda cuenta de cada uno.
- Una **cuenta dedicada al bloqueo** (S6), que no se usa en nada más.
- **Cuentas de carga:** las suficientes para que ninguna supere el límite de ingresos del sistema durante la carga y el estrés.
- **Prefijo de los datos de prueba:** `TRL-QA-<fecha>-`
- **Espacio de prueba** (organización, tenant o país donde viven las cuentas de prueba):

### 3. Flujos principales

| ID | Flujo | Roles | ¿Es el de punta a punta? |
|---|---|---|---|
| F1 | | | Sí: se prueba **completo**, con la cuenta de cada rol |
| F2 | | | |

Si un paso del F1 produce efectos reales en terceros (una guía real, un cobro, un mensaje), se declara cómo se simula: por ejemplo, el webhook firmado del proveedor en el entorno de pruebas.

### 4. Carga y estabilidad

| Parámetro | Valor | Cómo se calculó |
|---|---|---|
| **Concurrencia objetivo** | | Con datos reales de uso (usuarios activos y pico), más un margen |
| Mezcla de roles | | Proporción de usuarios activos por rol |
| Volumen de datos | | ≥ al de producción; si hace falta, datos sintéticos `TRL-QA` |
| Rutas por rol | | Las que de verdad usa cada rol, **incluidas las pesadas** (catálogos, reportes) |
| Duración del soak | 2 h mínimo | |
| Estrés | Hasta 4 × la concurrencia objetivo | |
| Umbrales | p95 < 2 s · errores < 1 % · degradación ≤ 10 % | **Fijos** |

### 5. Recuperación

| Parámetro | Valor |
|---|---|
| **RTO** (tiempo máximo para volver a operar) | |
| **RPO** (pérdida máxima de datos aceptable) | |
| Frecuencia del respaldo automático | |
| Dónde se guardan los respaldos y cuántas copias | |
| Entorno donde se prueba la restauración (nunca encima de producción) | |

### 6. Integraciones

| Integración | Para qué | ¿Recibe datos personales? | Autenticación (entrante y saliente) | **¿En el alcance de C6?** | ¿Webhook entrante? (va en S13) |
|---|---|---|---|---|---|
| | | | | Sí / No (con la decisión firmada) | Sí / No |

**Regla:** todo webhook entrante **en uso** va en S13, aunque la integración esté fuera del alcance de C6.

**¿Usa IA?** Sí / No. Si es sí, se llena `plantillas/aprobacion-flujo-datos-IA.md` (D4) y se hace `herramientas/ia/`.

### 7. Participantes de las sesiones (C2 y C8)

| Rol | Participantes (mínimo 1 por rol) | Código | ¿Participó en el desarrollo o en las pruebas? (debe ser No) | Confirmado |
|---|---|---|---|---|
| | | `<ROL>-P01` | No | |

Los nombres no van en la evidencia: solo el código. La lista con los nombres queda en custodia del responsable del proyecto.

### 8. Aprobación

| | Nombre | Fecha | Firma |
|---|---|---|---|
| **Responsable técnico** | | | |
| **Responsable del proyecto** | | | |

### 9. Cambios después de la aprobación

| Fecha | Qué cambió | Por qué | Aprobó (el responsable del proyecto, si afecta el alcance) |
|---|---|---|---|

---

<!-- 02-guia-de-pruebas.md -->

## Guía de las 8 pruebas

Cada prueba tiene seis partes: objetivo, herramienta, preparación, pasos, umbral y evidencia. Al final de cada una van los errores comunes, que salen de una evaluación real. La documentación, los manuales y los visuales están en `05-documentacion-requerida.md`.

### Herramientas

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

### Variables de entorno

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

### 0. Antes de todo: versión, entorno y datos

1. **Versión:** confirmar que el endpoint de salud devuelve la versión desplegada (commit). **Si no existe, se crea:** sin él no se puede probar que las pruebas corrieron sobre la versión final.
2. Guardar la salida en `evidencia/00_version/salud_inicio_<prueba>_<fecha>.json` y `salud_fin_<prueba>_<fecha>.json` **al inicio y al final de cada corrida**, incluidas la carga, el estrés, el soak, ZAP y R1–R6. `e2e.spec.js` (G-01) la guarda sola en la suite. El `startedAt` no debe cambiar dentro de una corrida: si cambia, hubo un reinicio o un despliegue.
3. **Cuentas:** verificar que las de `04-parametros.md` entran y están **activas**.
4. **Volumen de datos:** si la base no tiene un volumen realista, cargar datos **sintéticos** con `herramientas/datos/sembrar.js` (todo con el prefijo `TRL-QA-`). Anotar los conteos.

---

### 1. Integración de extremo a extremo (C1)

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

### 2. Funcionales y de aceptación: UAT (C2)

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

### 3. Rendimiento y carga (C3)

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

### 4. Estrés y estabilidad (C4)

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

### 5. Seguridad (C5)

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

### 6. Interoperabilidad (C6)

**Objetivo:** demostrar un intercambio real con cada integración en uso.

**Herramientas:** `herramientas/e2e/interoperabilidad.spec.js` y `plantillas/integraciones.md`.

**Pasos:**
1. Llenar la sección `interoperabilidad` de `config.json`, con la llamada de la API que activa cada integración, y correr `npx playwright test interoperabilidad.spec.js`. Queda registrado en `INTEGRACIONES_<fecha>.json`. Las integraciones que no se activan por la API (una notificación que llega al celular, un correo) se prueban a mano: un mensaje a la IA, un envío de mensajería, un cobro de prueba, una consulta al mapa…
2. Registrar la fecha y hora, la versión, la petición resumida y la respuesta resumida, **sin claves ni datos personales**, y el estado.
3. Hacer una captura de la pantalla de la aplicación donde se ve el resultado y, si se puede, del panel o registro del proveedor.

**Umbral:** un intercambio registrado y exitoso por cada integración del alcance, **cada uno con su archivo**: el json de `interoperabilidad.spec.js` o un extracto del log del servidor con el id del intercambio (por ejemplo, el id de un correo enviado). Lo que solo aparece en un `.md` no cuenta.

**Evidencia** (en `evidencia/06_interoperabilidad/`): `INTEGRACIONES.md` (de la plantilla) y las capturas.

---

### 7. Resiliencia y recuperación (C7)

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

### 8. Usabilidad (C8)

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

### 9. Documentación y cierre

No es una prueba aparte, pero sin ella no hay TRL 6. Lo exigido está en **`05-documentacion-requerida.md`** y el orden de trabajo en **`06-recorrido-paso-a-paso.md`**.

**Limpieza:** al terminar, `node herramientas/datos/limpiar.js limpiar.json --ejecutar`, con la salida guardada en `evidencia/01_integracion/limpieza_<fecha>.txt`.

**Antes de entregar:** correr `node herramientas/revisar-evidencia.js .` sobre **todo el paquete**, clasificar cada hallazgo (real o falso positivo), tapar los reales y revisar a mano las capturas, PDF y Excel. Borrar `test-results/` de Playwright: guarda lo escrito en los formularios, incluidas las claves.

---

<!-- 05-documentacion-requerida.md -->

## Documentación requerida para TRL 6

Las pruebas demuestran que el sistema funciona. La documentación demuestra que **está definido, que lo desplegado coincide con lo descrito y que alguien más lo puede operar.**

### 1. Reglas para todo documento

1. **Datos de prueba siempre.** Ninguna captura, diagrama ni ejemplo muestra datos reales de personas, claves, tokens, identificadores de clientes ni números de documento.
2. **La versión y la fecha** van visibles en la portada o el pie: el nombre del sistema, el commit y la fecha.
3. **Se entrega en PDF tamaño carta**, y se conserva el editable (`.md`, `.docx`, `.drawio`, `.svg` o `.xlsx`). **El editable debe ser idéntico al PDF firmado.**
4. **Coinciden con lo desplegado.** Los documentos describen **la versión declarada en E2**. Si cambia la versión, se actualizan, en especial el flujo de datos (B3) y la seguridad (B7).
5. **Nada se publica en sitios abiertos.** Se comparte por un enlace privado.

### 2. Entregables exigidos para TRL 6

#### A. Expediente

| # | Documento | Contenido mínimo | Formato |
|---|---|---|---|
| A1 | Expediente del problema y del concepto | El problema y su evidencia; los usuarios y roles; los objetivos medibles; los flujos principales; los riesgos y cómo se mitigan; el alcance. **Sin la marca «borrador»** | PDF |
| A2 | Requisitos con identificador | Funcionales (`RF-01`…) y no funcionales (`RNF-01`…), verificables | PDF o `.xlsx` |
| A3 | Matriz requisito → prueba → resultado | Cada requisito con su prueba (C1 a C8), su resultado y su archivo de evidencia (`plantillas/matriz-requisitos.csv`) | `.xlsx` |
| A4 | Historial de versiones | Desde el primer prototipo hasta la versión declarada, con los hitos y las correcciones de cada ronda | PDF o `.md` |

#### B. Documentación técnica (con los visuales V1 a V4)

| # | Documento | Contenido mínimo |
|---|---|---|
| B1 | Arquitectura (con V1) | Componentes, cómo se comunican, tecnologías y versiones, e integraciones |
| B2 | Despliegue (con V3) | Dónde corre cada parte, dominios, TLS, entornos, respaldos y la **tabla de equivalencia** entre pruebas y producción |
| B3 | Flujo de datos y privacidad (con V2) | Qué datos personales se capturan, dónde se guardan, quién los ve y **a qué terceros se envían**: debe coincidir con D4 |
| B4 | Modelo de datos | Entidades, campos clave, relaciones y cuáles son datos personales |
| B5 | API | OpenAPI o una tabla de endpoints con método, propósito y roles |
| B6 | Roles y permisos | La matriz rol × recurso; la misma base de `matriz-acceso.json` |
| B7 | Seguridad | Los controles implementados, los resultados de C5 y **los riesgos aceptados**, con quién los aceptó |
| B8 | Manual de operación | Despliegue; variables de entorno (solo los nombres); monitoreo; incidentes; respaldo y restauración (runbook) con RTO y RPO |
| V4 | Flujos de usuario | Un diagrama por flujo principal, con los roles como carriles |

#### D. Aprobaciones

| # | Documento | Firma |
|---|---|---|
| D4 | Aprobación del flujo de datos con la IA, si hay IA (`plantillas/aprobacion-flujo-datos-IA.md`) | Responsable técnico y responsable del proyecto |
| D5 | Autorización de pruebas destructivas (`plantillas/autorizacion-pruebas-destructivas.md`), con un **periodo que cubra todas las fechas de prueba** | Dueño de la infraestructura y responsable del proyecto |

#### E. Evidencia y cierre

| # | Documento | Formato |
|---|---|---|
| E1 | Parámetros firmados, con sus adendas | PDF |
| E2 | Declaración de la versión, firmada, con el `salud_firma_E2_<fecha>.json` | PDF y .json |
| E3 | La carpeta `evidencia/` completa | Carpeta |
| E4 | El Excel de las sesiones lleno | `.xlsx` |
| E5 | Las hojas de registro de cada sesión y el acta, firmadas | PDF |
| E6 | El reporte de pruebas, con el veredicto | PDF y `.md` |
| E7 | El checklist TRL 6 marcado | `.md` |

### 3. No se exigen para TRL 6 (son de TRL 7)

Los manuales y guías por rol, el material de baja alfabetización, la política de privacidad revisada por un abogado, el consentimiento, los acuerdos con proveedores, las capturas por rol, los videos de las sesiones y del sistema, y la gráfica del SUS. **Si se entregan, deben ser válidos:** por ejemplo, una captura que muestra la pantalla de ingreso en lugar de la pantalla del rol es un hallazgo.

Si las sesiones se graban, cada participante firma la autorización de grabación (`plantillas/autorizacion-grabacion.md`).

---

<!-- 06-recorrido-paso-a-paso.md -->

## Recorrido paso a paso: de cero a la entrega TRL 6

Este es el orden de trabajo completo. Cada paso dice **qué hacer, con qué archivo o comando y cómo saber que quedó bien**. Los detalles de cada prueba están en `02-guia-de-pruebas.md`. Antes de empezar, conviene leer `07-errores-que-rechazan-una-entrega.md`.

### Fase 1 · Preparación (días 1 y 2)

#### Paso 1 · Parámetros firmados
- **Qué:** llenar `04-parametros.md` con el responsable del proyecto, incluida la tabla de equivalencia de entornos y el alcance de integraciones y webhooks.
- **Quedó bien si:** tiene **las dos firmas** y está fechado **antes** de la primera corrida.

#### Paso 2 · Autorizaciones y agenda de las sesiones
- **Qué:**
  - `plantillas/autorizacion-pruebas-destructivas.md` (D5), con un periodo que cubra todas las fechas de prueba y las franjas horarias;
  - D4, si hay IA;
  - revisar la política del hosting sobre pruebas de carga;
  - confirmar los participantes de las sesiones: 1 por rol, ninguno del equipo de desarrollo ni de pruebas.
- **Agendar ya** las sesiones con usuarios: nombres, fechas y códigos. Es lo más lento y no depende del código.
- **Quedó bien si:** las autorizaciones están listas para firma y las sesiones tienen fecha.

#### ▶ Punto de control 1
Enviar los parámetros, D5, D4 (si hay IA), la lista de participantes y la salida de la salud (`08-puntos-de-control.md`). **No se corre ninguna prueba hasta que el responsable del proyecto firme E1, D5 y D4.**

#### Paso 3 · Preparar el sistema
- **Qué:**
  - un endpoint de salud que devuelve el commit desplegado, el estado de la base y la hora de arranque (`startedAt`);
  - las cuentas de prueba: una por rol, de reserva, la segunda del mismo rol para IDOR, la de bloqueo y las de carga;
  - todas activas.
- **Quedó bien si:** `curl <API>/<salud>` devuelve el commit y cada cuenta entra.

#### Paso 4 · Instalar las herramientas
En una máquina **distinta** del servidor, que no se suspenda:
```
cd herramientas/e2e && npm install && npx playwright install chromium
k6 version
docker --version
python3 -c "import matplotlib, openpyxl"
```
- **Quedó bien si:** los cuatro comandos responden sin error.

#### Paso 5 · Llenar las configuraciones

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

#### Paso 6 · Documentación base
- **Qué:** A1, A2, B1 a B6 y V1 a V4.
- **Quedó bien si:** los diagramas coinciden con lo desplegado, y B3 coincide con lo que de verdad se envía a terceros.

### Fase 2 · Corrida de corrección (días 3 a 6)

#### Paso 7 · Primera corrida automática
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

#### Paso 8 · Flujos
- **Qué:** completar `flujos.spec.js` con los flujos de `04-parametros.md`. El F1 va **completo, con la cuenta de cada rol**.
- **Quedó bien si:** `npx playwright test flujos.spec.js` pasa y todo lo creado lleva `TRL-QA-`.

#### Paso 9 · Corregir y verificar
- **Qué:** cada hallazgo se corrige con un commit y se repite la prueba que lo encontró.
- **Quedó bien si:** el antes y el después quedan en `RESULTADOS_S1-S15.md` y en los resúmenes, con los commits.

#### ▶ Punto de control 2
Enviar la primera corrida, la lista de hallazgos con su estado, el borrador de E2 y las solicitudes de decisión (`08-puntos-de-control.md`). **No se congela hasta tener el visto bueno.**

### Fase 3 · Versión declarada y corrida final (días 7 a 10)

#### Paso 10 · Congelar la versión
```
curl -s <API>/<salud> > evidencia/00_version/salud_firma_E2_<fecha>.json
```
- **Qué:** firmar `plantillas/declaracion-version-final.md` (las dos firmas), guardar la salud al firmar y el registro de despliegue del frontend. Desde aquí **no hay despliegues**.
- **Quedó bien si:** la salud devuelve el commit declarado.

#### Paso 11 · Corrida final automática, todo sobre la versión declarada
Antes y después de **cada** corrida, guardar la salud (`salud_inicio_<prueba>_<fecha>.json` y `salud_fin_<prueba>_<fecha>.json`):
1. la suite completa: `npx playwright test`, que incluye C1, el F1 completo, S1–S4, S7–S9, S13, C6 y R4;
2. `BLOQUEO=1 npx playwright test bloqueo.spec.js`, más la comprobación del bloqueo por cuenta desde otra IP;
3. la carga con el **perfil completo** (sin `ESCALONES_CORTOS`);
4. el estrés, la recuperación (`ESCALONES_CORTOS=1`) y el soak de 2 h;
5. `correr-escaneos.sh`: ZAP autenticado con los roles principales, TLS, dependencias y gitleaks;
6. R1 a R3 con `medir-disponibilidad.js` (detenerlo al terminar), y R6 con la aplicación levantada sobre la base restaurada.
- **Quedó bien si:** se cumplen los umbrales, el `startedAt` de la salud no cambia dentro de cada corrida (salvo en R1), y todas las fechas caen dentro del periodo de D5.

#### Paso 12 · Sesiones con usuarios
1. Generar el Excel:
   ```
   python3 herramientas/excel/generar_excel.py evidencia/02-08_usuarios/pruebas-usuarios.xlsx herramientas/excel/roles.json
   ```
2. Hacer cada sesión con `plantillas/guion-sesion-usuarios.md` y llenar `plantillas/hoja-de-registro-sesion.md`.
3. Al final, el SUS.
- **Quedó bien si:** el resumen del Excel muestra ≥ 90 % sin ayuda, éxito ≥ 85 % y SUS ≥ 68; hay 0 defectos críticos abiertos y las hojas de registro y el acta están firmadas.

### Fase 4 · Cierre (días 11 y 12)

#### Paso 13 · Gráficas
```
python3 herramientas/graficas/graficas.py k6  evidencia/03_carga/series.csv evidencia/03_carga/grafica_carga.png "Carga"
python3 herramientas/graficas/graficas.py k6  evidencia/04_estres_estabilidad/estres_series.csv evidencia/04_estres_estabilidad/grafica_estres.png "Estrés"
python3 herramientas/graficas/graficas.py k6  evidencia/04_estres_estabilidad/soak_series.csv evidencia/04_estres_estabilidad/grafica_soak.png "Soak"
node herramientas/k6/degradacion.js evidencia/04_estres_estabilidad/soak_series.csv > evidencia/04_estres_estabilidad/degradacion.txt
```

#### Paso 14 · Documentación de cierre
- A3 completa, A4 con las versiones, y B1 a B8 en la versión declarada.
- B7 con los riesgos aceptados y quién los aceptó.
- El reporte (`plantillas/reporte-de-pruebas.md`) y el checklist.

#### Paso 15 · Limpieza y revisión de la evidencia
```
node herramientas/datos/limpiar.js limpiar.json --ejecutar | tee evidencia/01_integracion/limpieza_<fecha>.txt
node herramientas/revisar-evidencia.js .
```
- **Quedó bien si:**
  - cada hallazgo del script está clasificado (real o falso positivo) en `evidencia/otros/revision_evidencia_<fecha>.md`, y los reales están tapados;
  - se revisaron a mano todas las capturas, PDF y Excel;
  - `test-results/` está borrado.

#### Paso 16 · Entregar (▶ Punto de control 3)
- **Qué:** el paquete completo por un **enlace privado**.
- **Quedó bien si:** el checklist está completo y cada `[x]` apunta a un archivo.

---

<!-- 07-errores-que-rechazan-una-entrega.md -->

## Errores que rechazan una entrega

Estos son los hallazgos que hicieron rechazar entregas en una evaluación real de tres rondas. Ninguno fue por mala ingeniería: todos fueron de **alcance, versión, firmas o evidencia**. Evitarlos ahorra rondas completas.

### 1. Firmas y alcance

| Error | Cómo evitarlo |
|---|---|
| Los parámetros (E1) se aprobaron **después** de haber corrido las primeras pruebas | Firmar E1 antes de la primera corrida |
| El desarrollador firmó **como responsable del proyecto** | Cada uno firma en su fila. Sin la firma del responsable del proyecto, E1, D4 y E2 no valen |
| Se excluyeron integraciones, sesiones o riesgos «**por decisión del responsable**» sin su firma | Toda exclusión va en una adenda (`plantillas/adenda-parametros.md`) firmada por el responsable del proyecto |
| El editable de un documento firmado tenía cambios que no estaban en el PDF | El editable y el PDF firmado son idénticos. Si cambia algo, se emite una versión nueva |
| La autorización de pruebas destructivas (D5) era un mensaje de chat, con marcadores sin llenar | D5 es un documento con fechas, franjas, alcance y firmas |
| El **periodo de D5 empezaba un día después** de las pruebas | Revisar que el periodo cubra todas las fechas de prueba, en la zona horaria del documento |

### 2. Versión

| Error | Cómo evitarlo |
|---|---|
| Carga, estrés, soak, ZAP y R1 corridos sobre una versión anterior a la declarada | Las corridas finales van **después** de la firma de E2, sobre su commit |
| La carga «de confirmación» se corrió con `ESCALONES_CORTOS` | La corrida final de C3 usa el perfil completo (16 min) |
| El reporte decía que una prueba se hizo sobre la versión final y la salud mostraba otro commit | Cada resultado cita su archivo de salud |
| No había archivo de salud al firmar E2 | Guardar `salud_firma_E2_<fecha>.json` en el momento de la firma |
| Se reutilizaron corridas de la versión anterior sin respaldo | Adjuntar `git diff --stat <anterior> <nueva> -- backend frontend` y explicar por qué no afecta |
| No había evidencia del commit del frontend desplegado | Guardar el registro de despliegue (por ejemplo, de Vercel) y una prueba de que el bundle contiene el cambio |

### 3. Pruebas

| Error | Cómo evitarlo |
|---|---|
| El flujo de punta a punta saltaba pasos (imprimir guía, despachar, liquidar) o usaba la cuenta ADMIN en el paso de otro rol | F1 completo, cada paso con la cuenta de su rol. Lo que genera efectos reales se simula con el webhook firmado del proveedor |
| La prueba de IDOR cubría un solo tipo de recurso | Cubrir cada recurso sensible. En una evaluación real, ampliar el IDOR encontró una falla real |
| **Un webhook en uso no verificaba la firma** (estaba fuera del alcance de C6 y se olvidó en S13) | S13 cubre **todos** los webhooks entrantes en uso, con caso negativo y **positivo** |
| S13 sin el caso positivo | `webhooks.spec.js` falla si no se entrega el secreto del caso positivo |
| El bloqueo de ingreso era solo por IP | Bloqueo temporal también por cuenta, verificado desde otra IP |
| ZAP sobre pocas rutas GET de un solo rol | ZAP autenticado con los roles principales, incluidas las rutas POST |
| La IA recibía nombre, teléfono y dirección del cliente final | Enviar solo lo necesario, tapar identificadores y registrar un envío real como evidencia |
| La IA podía ejecutar una acción irreversible (anular una orden) por sí sola | La IA propone; el usuario confirma con un botón |
| R6 medía solo la carga del SQL | Levantar la aplicación sobre la base restaurada y medir hasta el primer ingreso |
| El monitor de disponibilidad de R1 quedó encendido 18 horas | Detener cada monitor al terminar y verificar que no queda ningún proceso |
| La degradación se calculó con un script propio | Usar `degradacion.js` del kit |
| El ingreso tardaba más de 20 s con varios usuarios a la vez y nadie lo investigó | Si aparece en carga o en e2e, se declara con su causa o se corrige antes de las sesiones |

### 4. Evidencia

| Error | Cómo evitarlo |
|---|---|
| El id de un correo enviado solo aparecía en el `.md` | Cada afirmación lleva su archivo: un json o un extracto del log |
| Seis capturas «del administrador» eran la pantalla de ingreso | `capturas.spec.js` ahora falla si queda en la pantalla de ingreso. Abrir cada imagen antes de entregar |
| Cookies de sesión y tokens sin tapar en los JSON de SSL Labs y en los logs de fallas de Playwright | Correr `revisar-evidencia.js` sobre **todo** el paquete y revisar cada hallazgo. Borrar `test-results/` |
| Identificadores reales de clientes (ids de números de WhatsApp), su teléfono y la cédula del firmante en documentos para evaluadores | Taparlos o quitarlos de las copias que se comparten |
| El checklist marcaba `[x]` en documentos que no se habían actualizado | Solo se marca lo que tiene un archivo que lo respalde |
| Las condiciones decían «con fecha», pero sin fecha | Cada condición lleva una fecha concreta |

### 5. Producción

| Error | Cómo evitarlo |
|---|---|
| Un token de un proveedor quedó escrito en el log de acceso de producción | Los logs tapan parámetros sensibles. Los tokens van en el cuerpo, nunca en la URL |
| Se desactivó una función a clientes reales sin avisar | Los cambios en producción se avisan antes al responsable del proyecto, y a los clientes afectados |
| Los respaldos vivían en el mismo servidor, sin copia externa | Declararlo como riesgo, o agregar una copia externa |

---

<!-- 03-checklist-TRL6.md -->

## Checklist TRL 6

Marca cada línea con `[x]` **solo si hay un archivo que lo respalda**, y anota la ruta. Estado de cada bloque: **Cumple**, **Parcial** (con la acción que lo cierra) o **Pendiente**.

### Puntos de control

- [ ] Punto de control 1 aprobado: E1, D5 y D4 firmados por el responsable del proyecto (fecha: ____)
- [ ] Sesiones con usuarios agendadas desde el día 1
- [ ] Punto de control 2 aprobado: visto bueno para congelar y decisiones firmadas (fecha: ____)

### Preparación

- [ ] `04-parametros.md` lleno y firmado por el **responsable técnico y el responsable del proyecto** (fecha: ____) · `evidencia/documentacion/`
- [ ] Tabla de equivalencia entre el entorno de pruebas y producción (si no se prueba en producción)
- [ ] Endpoint de salud que devuelve el commit desplegado · `evidencia/00_version/`
- [ ] Cuentas de prueba activas: una por rol, de reserva, la segunda del mismo rol (IDOR), la de bloqueo y las de carga
- [ ] D5 firmada, con un periodo que cubre **todas** las fechas de prueba
- [ ] D4 firmada por los dos, si hay IA

### Versión

- [ ] E2 firmada, con los commits del frontend y del backend
- [ ] `salud_firma_E2_<fecha>.json` guardado al firmar
- [ ] Commit del frontend respaldado (registro de despliegue)
- [ ] Todas las corridas finales son **posteriores a la firma de E2**, con la salud al inicio y al final, el mismo commit y el mismo `startedAt`
- [ ] Si se reutilizan corridas de una versión anterior: la salida de `git diff --stat` que lo justifica

### C1 · Integración · Estado: ______

- [ ] La suite cubre todos los roles
- [ ] F1 completo, con la cuenta de cada rol, de punta a punta
- [ ] ≥ 90 % de los casos pasan en la primera pasada; fallas y omisiones con su causa · `evidencia/01_integracion/RESUMEN.md`

### C2 · UAT · Estado: ______

- [ ] ≥ 1 participante por rol, que no participó en el desarrollo ni en las pruebas, con su código
- [ ] Los roles del F1 lo recorren en orden
- [ ] ≥ 90 % sin ayuda; 0 defectos críticos abiertos
- [ ] Hojas de registro y acta firmadas · `evidencia/02-08_usuarios/`

### C3 · Carga · Estado: ______

- [ ] Concurrencia objetivo, mezcla de roles y rutas reales (incluidas las pesadas)
- [ ] Volumen de datos anotado
- [ ] **Perfil completo** (sin `ESCALONES_CORTOS`) sobre la versión final
- [ ] p95 < 2 s y errores < 1 %, leídos del `resumen.json` · `evidencia/03_carga/`

### C4 · Estrés y estabilidad · Estado: ______

- [ ] Punto de quiebre identificado (usuarios: ____)
- [ ] Recuperación sin intervención (`ESCALONES_CORTOS=1`, en verde)
- [ ] Soak ≥ 2 h: p95 < 2 s, errores < 1 % y degradación ≤ 10 % con `degradacion.js` del kit
- [ ] CPU y memoria antes, durante y después · `evidencia/04_estres_estabilidad/`

### C5 · Seguridad · Estado: ______

- [ ] S1 IDOR sobre cada tipo de recurso sensible · [ ] S2 Matriz · [ ] S3 Sesión · [ ] S4 Rutas protegidas · [ ] S5 Creación de cuentas
- [ ] S6 Límite por IP **y bloqueo por cuenta** · [ ] S7 Claves · [ ] S8 Inyección y XSS · [ ] S9 Cabeceras · [ ] S10 TLS
- [ ] S11 Dependencias (0 críticas) · [ ] S12 Secretos · [ ] S13 **Todos** los webhooks en uso, con el caso positivo · [ ] S14 Rama protegida
- [ ] S15 IA (si aplica)
- [ ] ZAP autenticado con los roles principales, incluidas las rutas POST: 0 altas · `evidencia/05_seguridad/RESULTADOS_S1-S15.md`

### C6 · Interoperabilidad · Estado: ______

- [ ] Un intercambio real por cada integración del alcance, **cada uno con su archivo** (json o extracto del log) · `evidencia/06_interoperabilidad/`

### C7 · Resiliencia · Estado: ______

- [ ] R1 Caída de la API (conteos antes y después; monitor detenido al terminar) · [ ] R2 Caída de la base · [ ] R3 Caída de un proveedor
- [ ] R4 Pérdida de red: 5 de 5 · [ ] R5 Recuperación después del estrés
- [ ] R6 Restauración en un entorno aparte, **con la aplicación levantada encima**: ≤ RTO y ≤ RPO; runbook lleno · `evidencia/07_resiliencia/`

### C8 · Usabilidad · Estado: ______

- [ ] Los mismos participantes de C2
- [ ] SUS promedio ≥ 68 (resultado: ____)
- [ ] Éxito de tareas ≥ 85 % (resultado: ____)

### Documentación (`05-documentacion-requerida.md`)

- [ ] A1 (sin la marca de borrador) · [ ] A2 · [ ] A3 · [ ] A4
- [ ] B1 · [ ] B2 · [ ] B3 (coincide con D4) · [ ] B4 · [ ] B5 · [ ] B6 · [ ] B7 (con los riesgos aceptados) · [ ] B8 (con el runbook)
- [ ] V1 · [ ] V2 · [ ] V3 · [ ] V4
- [ ] Todo describe la versión declarada en E2

### Cierre

- [ ] El reporte dice «TRL 6», con cada número tomado de su archivo
- [ ] Datos de prueba limpiados con `limpiar.js --ejecutar` (salida guardada)
- [ ] `revisar-evidencia.js` corrido sobre todo el paquete, con los hallazgos clasificados; binarios revisados a mano
- [ ] Sin claves, tokens, cédulas ni identificadores reales de clientes en la evidencia
- [ ] Las condiciones abiertas tienen una fecha concreta

---

<!-- herramientas/LEEME.md -->

## Herramientas: inventario completo

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

---

<!-- evidencia/LEEME.md -->

## Evidencia

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

---

## Plantillas incluidas en el paquete

- `plantillas/acta-UAT.md`
- `plantillas/adenda-parametros.md`
- `plantillas/aprobacion-flujo-datos-IA.md`
- `plantillas/autorizacion-grabacion.md`
- `plantillas/autorizacion-pruebas-destructivas.md`
- `plantillas/declaracion-version-final.md`
- `plantillas/ficha-de-evidencia.md`
- `plantillas/guion-sesion-usuarios.md`
- `plantillas/hoja-de-registro-sesion.md`
- `plantillas/integraciones.md`
- `plantillas/manual-por-rol.md`
- `plantillas/matriz-requisitos.csv`
- `plantillas/pruebas-usuarios.xlsx`
- `plantillas/reporte-de-pruebas.md`
- `plantillas/resultados-seguridad.md`
- `plantillas/runbook-respaldo-y-restauracion.md`
