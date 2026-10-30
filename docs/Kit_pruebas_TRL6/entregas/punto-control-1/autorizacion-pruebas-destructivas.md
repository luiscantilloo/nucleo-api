# D5 · Autorización de pruebas destructivas y de uso de datos de producción

**Sistema:** NucleoCare (nucleo-api dual · Parienta + NARA) · **Versión del documento:** `1` · **Estado:** PARA FIRMA del dueño de la infraestructura y del responsable del proyecto

## 1. Infraestructura

| Entorno | Servidor (proveedor, IP, tamaño) | Dominios | Dueño |
|---|---|---|---|
| Pruebas (= prod actual) | Render `nucleo-api` plan **1c-2g** (Ohio) · Vercel fronts | `nucleo-api-k3fo.onrender.com`, `parienta-web.vercel.app`, `www.proyectonara.com`, `nara-web-phi.vercel.app` | Polaria / Luis Cantillo |
| Producción | Mismo (no hay staging separado aún) | Igual | Igual |

> **Nota de alcance:** no existe hoy un entorno staging aislado. Las pruebas C3/C4/C5/C7 se harán en franjas acordadas sobre esta infraestructura, con datos solo `TRL-QA-`, o se creará un servicio Render de pruebas (adenda) antes de la corrida destructiva.

## 2. Periodo y franjas autorizadas

- **Periodo:** del **`2026-10-30`** al **`2026-11-20`** (incluye fase de corrección y corrida final). Zona: **America/Bogota (UTC−5)**.
- **Franjas** (`America/Bogota`):
  - pruebas no destructivas (e2e, matriz, IDOR, capturas): lunes a viernes **09:00–21:00**;
  - C3/C4/ZAP/R1–R5 (carga, estrés, soak, caídas): **sábados 08:00–14:00** o **domingos 08:00–12:00**, o noche **22:00–06:00** entre semana, con aviso 24 h al responsable;
  - R6 (restauración de respaldo): solo en cluster/DB temporal Atlas, franja con aviso.

## 3. Pruebas autorizadas en el entorno de pruebas

| Prueba | Qué hace | Límite |
|---|---|---|
| C3 Carga | k6 con **40** VU, perfil completo (16 min), mezcla NARA/Parienta | Solo datos TRL-QA; franja acordada |
| C4 Estrés y recuperación | Hasta **160** VU | Igual |
| C4 Soak | 2 h con ≈12 VU | Igual |
| C5 ZAP autenticado | Escaneo con roles principales NARA y Parienta | Escrituras solo `TRL-QA` |
| C5 S6 Bloqueo | Bloqueo de cuentas dedicadas TRL-QA | Solo esas cuentas |
| C5 S13 Webhooks | n8n TEO con secreto correcto/incorrecto | Solo entorno autorizado |
| C7 R1 a R5 | Caídas / pérdida de red | Servidor/API de prueba; detener monitores al terminar |
| Datos sintéticos | Siembra y limpieza `TRL-QA` | Solo bases de prueba o colecciones prefijadas |

## 4. Operaciones que tocan producción

| Operación | Qué se hace exactamente | Garantías |
|---|---|---|
| **R6 · Uso del respaldo** | Copiar snapshot Atlas a DB temporal `*_restore_trl`, levantar app apuntando a ella, medir hasta primer login | Nunca escribir en DB de producción. Borrar restore al terminar |
| **Lecturas** | Conteos `/api/health`, métricas Render | Solo lectura |

## 5. Lo que NO se autoriza

- Carga/estrés/ZAP/caídas sobre usuarios reales o datos no `TRL-QA`.
- Escrituras en producción con datos reales.
- Cambiar claves de usuarios reales.
- Cambios operativos en producción sin aviso previo al responsable del proyecto.

## 6. Contacto durante las pruebas

Canal: WhatsApp / Slack del equipo Polaria. Si algo afecta a usuarios reales, se detiene y se avisa de inmediato.

## 7. Aprobación

| | Nombre | Fecha | Firma |
|---|---|---|---|
| **Dueño de la infraestructura** (o responsable técnico) | Luis Cantillo (Daniiel) | 2026-10-30 | Aprobado |
| **Responsable del proyecto** | Luis Cantillo (Daniiel) — dueño | 2026-10-30 | Aprobado («yo soy el dueño», 2026-10-29) |
