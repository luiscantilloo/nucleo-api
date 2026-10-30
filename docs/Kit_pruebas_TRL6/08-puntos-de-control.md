# Puntos de control: tres revisiones durante el trabajo

El kit se entrega completo desde el día 1, pero el trabajo se revisa en **tres puntos de control**. Los dos primeros son revisiones cortas (alrededor de una hora) que detectan a tiempo los errores que obligan a repetir días de pruebas: firmas, alcance, fechas de autorización y versión. **No se avanza al paso siguiente sin el visto bueno del punto de control anterior.**

## Resumen

| Punto | Cuándo | Qué se envía | Qué se revisa | Resultado |
|---|---|---|---|---|
| **1. Antes de correr cualquier prueba** | Días 1 y 2 | Parámetros, D5, D4 (si hay IA) y la lista de participantes | Alcance, webhooks, fechas de autorización y participantes | Firma del responsable del proyecto en E1, D5 y D4 |
| **2. Antes de congelar la versión** | Alrededor del día 6 | Resultados de la primera corrida, correcciones y borrador de E2 | Que no quede nada grande abierto y que la configuración de las pruebas sea la correcta | Visto bueno para congelar y firmas de E2 |
| **3. Entrega final** | Días 10 a 12 | El paquete completo | Auditoría completa | Veredicto |

## Día 1, en paralelo: agendar las sesiones con usuarios

Conseguir 1 persona por rol que no haya participado en el desarrollo ni en las pruebas es lo más lento y no depende del código. Se empieza el día 1: se confirman nombres, fechas y horas, y se asigna un código a cada participante. Las sesiones se hacen después de congelar la versión (paso 12 del recorrido).

## Punto de control 1 · Antes de correr cualquier prueba

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

## Punto de control 2 · Antes de congelar la versión

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

## Punto de control 3 · Entrega final

**Se envía:** el paquete completo de `00-LEEME.md`, «Qué se entrega al final», con el checklist marcado.

**Se revisa:** la auditoría completa:
- los valores recalculados desde los datos crudos;
- la versión y las fechas de cada corrida;
- los datos sensibles;
- la documentación;
- la coherencia entre el reporte, el checklist y la evidencia.

**Resultado:** el veredicto: Aprobado TRL 6, Aprobado con condiciones (con fecha) o No aprobado (con la lista de tareas).

## Cómo se envía cada punto de control

Una carpeta comprimida por enlace privado, con un `LEEME.md` corto que diga qué se envía y qué se pide (firmas, decisiones o visto bueno). Nunca claves ni datos reales.
