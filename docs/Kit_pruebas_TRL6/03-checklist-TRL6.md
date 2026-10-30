# Checklist TRL 6

Marca cada línea con `[x]` **solo si hay un archivo que lo respalda**, y anota la ruta. Estado de cada bloque: **Cumple**, **Parcial** (con la acción que lo cierra) o **Pendiente**.

## Puntos de control

- [ ] Punto de control 1 aprobado: E1, D5 y D4 firmados por el responsable del proyecto (fecha: ____)
- [ ] Sesiones con usuarios agendadas desde el día 1
- [ ] Punto de control 2 aprobado: visto bueno para congelar y decisiones firmadas (fecha: ____)

## Preparación

- [ ] `04-parametros.md` lleno y firmado por el **responsable técnico y el responsable del proyecto** (fecha: ____) · `evidencia/documentacion/`
- [ ] Tabla de equivalencia entre el entorno de pruebas y producción (si no se prueba en producción)
- [ ] Endpoint de salud que devuelve el commit desplegado · `evidencia/00_version/`
- [ ] Cuentas de prueba activas: una por rol, de reserva, la segunda del mismo rol (IDOR), la de bloqueo y las de carga
- [ ] D5 firmada, con un periodo que cubre **todas** las fechas de prueba
- [ ] D4 firmada por los dos, si hay IA

## Versión

- [ ] E2 firmada, con los commits del frontend y del backend
- [ ] `salud_firma_E2_<fecha>.json` guardado al firmar
- [ ] Commit del frontend respaldado (registro de despliegue)
- [ ] Todas las corridas finales son **posteriores a la firma de E2**, con la salud al inicio y al final, el mismo commit y el mismo `startedAt`
- [ ] Si se reutilizan corridas de una versión anterior: la salida de `git diff --stat` que lo justifica

## C1 · Integración · Estado: ______

- [ ] La suite cubre todos los roles
- [ ] F1 completo, con la cuenta de cada rol, de punta a punta
- [ ] ≥ 90 % de los casos pasan en la primera pasada; fallas y omisiones con su causa · `evidencia/01_integracion/RESUMEN.md`

## C2 · UAT · Estado: ______

- [ ] ≥ 1 participante por rol, que no participó en el desarrollo ni en las pruebas, con su código
- [ ] Los roles del F1 lo recorren en orden
- [ ] ≥ 90 % sin ayuda; 0 defectos críticos abiertos
- [ ] Hojas de registro y acta firmadas · `evidencia/02-08_usuarios/`

## C3 · Carga · Estado: ______

- [ ] Concurrencia objetivo, mezcla de roles y rutas reales (incluidas las pesadas)
- [ ] Volumen de datos anotado
- [ ] **Perfil completo** (sin `ESCALONES_CORTOS`) sobre la versión final
- [ ] p95 < 2 s y errores < 1 %, leídos del `resumen.json` · `evidencia/03_carga/`

## C4 · Estrés y estabilidad · Estado: ______

- [ ] Punto de quiebre identificado (usuarios: ____)
- [ ] Recuperación sin intervención (`ESCALONES_CORTOS=1`, en verde)
- [ ] Soak ≥ 2 h: p95 < 2 s, errores < 1 % y degradación ≤ 10 % con `degradacion.js` del kit
- [ ] CPU y memoria antes, durante y después · `evidencia/04_estres_estabilidad/`

## C5 · Seguridad · Estado: ______

- [ ] S1 IDOR sobre cada tipo de recurso sensible · [ ] S2 Matriz · [ ] S3 Sesión · [ ] S4 Rutas protegidas · [ ] S5 Creación de cuentas
- [ ] S6 Límite por IP **y bloqueo por cuenta** · [ ] S7 Claves · [ ] S8 Inyección y XSS · [ ] S9 Cabeceras · [ ] S10 TLS
- [ ] S11 Dependencias (0 críticas) · [ ] S12 Secretos · [ ] S13 **Todos** los webhooks en uso, con el caso positivo · [ ] S14 Rama protegida
- [ ] S15 IA (si aplica)
- [ ] ZAP autenticado con los roles principales, incluidas las rutas POST: 0 altas · `evidencia/05_seguridad/RESULTADOS_S1-S15.md`

## C6 · Interoperabilidad · Estado: ______

- [ ] Un intercambio real por cada integración del alcance, **cada uno con su archivo** (json o extracto del log) · `evidencia/06_interoperabilidad/`

## C7 · Resiliencia · Estado: ______

- [ ] R1 Caída de la API (conteos antes y después; monitor detenido al terminar) · [ ] R2 Caída de la base · [ ] R3 Caída de un proveedor
- [ ] R4 Pérdida de red: 5 de 5 · [ ] R5 Recuperación después del estrés
- [ ] R6 Restauración en un entorno aparte, **con la aplicación levantada encima**: ≤ RTO y ≤ RPO; runbook lleno · `evidencia/07_resiliencia/`

## C8 · Usabilidad · Estado: ______

- [ ] Los mismos participantes de C2
- [ ] SUS promedio ≥ 68 (resultado: ____)
- [ ] Éxito de tareas ≥ 85 % (resultado: ____)

## Documentación (`05-documentacion-requerida.md`)

- [ ] A1 (sin la marca de borrador) · [ ] A2 · [ ] A3 · [ ] A4
- [ ] B1 · [ ] B2 · [ ] B3 (coincide con D4) · [ ] B4 · [ ] B5 · [ ] B6 · [ ] B7 (con los riesgos aceptados) · [ ] B8 (con el runbook)
- [ ] V1 · [ ] V2 · [ ] V3 · [ ] V4
- [ ] Todo describe la versión declarada en E2

## Cierre

- [ ] El reporte dice «TRL 6», con cada número tomado de su archivo
- [ ] Datos de prueba limpiados con `limpiar.js --ejecutar` (salida guardada)
- [ ] `revisar-evidencia.js` corrido sobre todo el paquete, con los hallazgos clasificados; binarios revisados a mano
- [ ] Sin claves, tokens, cédulas ni identificadores reales de clientes en la evidencia
- [ ] Las condiciones abiertas tienen una fecha concreta
