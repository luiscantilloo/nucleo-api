# Documentación requerida para TRL 6

Las pruebas demuestran que el sistema funciona. La documentación demuestra que **está definido, que lo desplegado coincide con lo descrito y que alguien más lo puede operar.**

## 1. Reglas para todo documento

1. **Datos de prueba siempre.** Ninguna captura, diagrama ni ejemplo muestra datos reales de personas, claves, tokens, identificadores de clientes ni números de documento.
2. **La versión y la fecha** van visibles en la portada o el pie: el nombre del sistema, el commit y la fecha.
3. **Se entrega en PDF tamaño carta**, y se conserva el editable (`.md`, `.docx`, `.drawio`, `.svg` o `.xlsx`). **El editable debe ser idéntico al PDF firmado.**
4. **Coinciden con lo desplegado.** Los documentos describen **la versión declarada en E2**. Si cambia la versión, se actualizan, en especial el flujo de datos (B3) y la seguridad (B7).
5. **Nada se publica en sitios abiertos.** Se comparte por un enlace privado.

## 2. Entregables exigidos para TRL 6

### A. Expediente

| # | Documento | Contenido mínimo | Formato |
|---|---|---|---|
| A1 | Expediente del problema y del concepto | El problema y su evidencia; los usuarios y roles; los objetivos medibles; los flujos principales; los riesgos y cómo se mitigan; el alcance. **Sin la marca «borrador»** | PDF |
| A2 | Requisitos con identificador | Funcionales (`RF-01`…) y no funcionales (`RNF-01`…), verificables | PDF o `.xlsx` |
| A3 | Matriz requisito → prueba → resultado | Cada requisito con su prueba (C1 a C8), su resultado y su archivo de evidencia (`plantillas/matriz-requisitos.csv`) | `.xlsx` |
| A4 | Historial de versiones | Desde el primer prototipo hasta la versión declarada, con los hitos y las correcciones de cada ronda | PDF o `.md` |

### B. Documentación técnica (con los visuales V1 a V4)

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

### D. Aprobaciones

| # | Documento | Firma |
|---|---|---|
| D4 | Aprobación del flujo de datos con la IA, si hay IA (`plantillas/aprobacion-flujo-datos-IA.md`) | Responsable técnico y responsable del proyecto |
| D5 | Autorización de pruebas destructivas (`plantillas/autorizacion-pruebas-destructivas.md`), con un **periodo que cubra todas las fechas de prueba** | Dueño de la infraestructura y responsable del proyecto |

### E. Evidencia y cierre

| # | Documento | Formato |
|---|---|---|
| E1 | Parámetros firmados, con sus adendas | PDF |
| E2 | Declaración de la versión, firmada, con el `salud_firma_E2_<fecha>.json` | PDF y .json |
| E3 | La carpeta `evidencia/` completa | Carpeta |
| E4 | El Excel de las sesiones lleno | `.xlsx` |
| E5 | Las hojas de registro de cada sesión y el acta, firmadas | PDF |
| E6 | El reporte de pruebas, con el veredicto | PDF y `.md` |
| E7 | El checklist TRL 6 marcado | `.md` |

## 3. No se exigen para TRL 6 (son de TRL 7)

Los manuales y guías por rol, el material de baja alfabetización, la política de privacidad revisada por un abogado, el consentimiento, los acuerdos con proveedores, las capturas por rol, los videos de las sesiones y del sistema, y la gráfica del SUS. **Si se entregan, deben ser válidos:** por ejemplo, una captura que muestra la pantalla de ingreso en lugar de la pantalla del rol es un hallazgo.

Si las sesiones se graban, cada participante firma la autorización de grabación (`plantillas/autorizacion-grabacion.md`).
