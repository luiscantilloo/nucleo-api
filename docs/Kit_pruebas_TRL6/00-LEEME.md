# Kit de pruebas para demostrar TRL 6

**Para:** el equipo de desarrollo · **Versión:** 1 (basada en el kit TRL 7 v4 y en una evaluación real de tres rondas) · octubre de 2026 · **Confidencial**

## Qué es

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

## Orden de lectura

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

## Cómo se trabaja

1. **Día 1:** llenar `04-parametros.md`, D5 (y D4 si hay IA) y **empezar a agendar las sesiones con usuarios**.
2. **Punto de control 1:** se envían los parámetros y las autorizaciones. El responsable del proyecto los revisa y los firma. **Ninguna prueba se corre antes.**
3. **Fase de corrección:** correr las pruebas automáticas y corregir lo que falle. Cada corrección es un commit.
4. **Punto de control 2:** se envían los resultados, los hallazgos y el borrador de E2. Con el visto bueno, se congela la versión: E2 con las dos firmas y la salud guardada al firmar. Desde ahí no hay despliegues.
5. **Corrida final:** repetir sobre la versión congelada todas las pruebas automáticas, con la salud al inicio y al final de cada corrida, y hacer las sesiones con usuarios.
6. **Punto de control 3, entrega final:** `evidencia/` llena, el checklist marcado y el reporte completo, por un enlace privado.

Qué se envía y qué se revisa en cada punto de control: `08-puntos-de-control.md`.

El recorrido completo, día por día, está en `06-recorrido-paso-a-paso.md`.

## Reglas que no se negocian

1. **Nunca datos reales de personas** en pruebas, capturas, videos, trazas ni reportes. Todo dato de prueba lleva el prefijo `TRL-QA-`.
2. **Nunca claves, tokens, cookies ni identificadores reales** de clientes, cuentas o números (por ejemplo, ids de WhatsApp o números de documento) en la evidencia. Las claves van solo en variables de entorno.
3. **Los umbrales se fijan antes de ver resultados** y no se mueven.
4. **Lo que no tiene archivo no está demostrado.** Cada afirmación del reporte apunta a un archivo de la evidencia: un log, un json, un csv o una captura.
5. **Las decisiones de alcance las firma el responsable del proyecto.** El desarrollador puede proponer, pero no decide solo sobre exclusiones, riesgos aceptados ni cambios de parámetros.
6. **Pruebas destructivas solo dentro del periodo y las franjas de D5 firmada:** carga, estrés, caídas, escaneos, bloqueo de cuentas y uso de respaldos.
7. **Los cambios en producción** (configuración, desactivar funciones de clientes, migraciones) no son pruebas: se avisan antes al responsable del proyecto.
8. **No se afirma un nivel mayor al demostrado.** El reporte dice «TRL 6» solo si los 8 bloques cumplen y la documentación exigida está completa.

## Qué se entrega al final

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
