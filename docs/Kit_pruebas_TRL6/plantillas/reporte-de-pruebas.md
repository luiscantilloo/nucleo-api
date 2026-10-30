# Reporte de pruebas · `[Sistema]`

`[Descripción en una línea]` · `[fecha]` · Uso interno

**Plataforma evaluada:** `[URL]` (`[hosting de cada parte e integraciones]`)
**Versión declarada:** `[commits]`, firmada el `[fecha]` (E2, con `evidencia/00_version/salud_firma_E2_<fecha>.json`).
**Cada número de este reporte cita su archivo de evidencia.**
**Entorno:** `[producción o equivalente]`, con cuentas y datos de prueba (`[espacio de prueba]`). Ninguna evidencia contiene datos reales de personas ni claves.

**Versión sobre la que se verificó cada prueba:**

| Versión | Pruebas |
|---|---|
| Final: `[commits]` | `[C1, C2, C8…]` |
| `[commit anterior]` | `[C3…, y por qué sigue siendo válida]` |

---

## Veredicto

**`[Sistema]` demuestra TRL 6:** el sistema completo, con sus `[N]` roles, se probó en un entorno relevante sobre la infraestructura real (`[producción o entorno equivalente]`), sobre la versión declarada `[commit]`, y cumple los 8 bloques de prueba. `[Opcional, si es cierto: «con avances hacia TRL 7: …»]`

`[Si algo es parcial: «Cumple, con N pendientes declarados», y la lista de pendientes con la acción y la fecha de cierre.]`

## Resumen

| # | Prueba exigida | Resultado principal | Estado |
|---|---|---|---|
| 1 | Integración de extremo a extremo | `[De N casos ejecutados sobre la versión final: X pasan…]` | Cumple / Parcial |
| 2 | Funcionales y de aceptación (UAT) | `[1 participante por rol (N en total): X de Y casos sin ayuda (Z %); flujo completo de punta a punta]` | |
| 3 | Rendimiento y carga | `[N usuarios simultáneos: p95 de X s y Y % de errores]` | |
| 4 | Estrés y estabilidad | `[Quiebre entre X e Y usuarios, con recuperación sola. Soak de N h: p95, errores y degradación]` | |
| 5 | Seguridad | `[N de N controles verificados; ZAP: 0 altas; TLS; dependencias]` | |
| 6 | Interoperabilidad | `[Intercambio real con …]` | |
| 7 | Resiliencia y recuperación | `[R1 a R6; RTO y RPO]` | |
| 8 | Usabilidad | `[SUS promedio X (de A a B), éxito Y %, mediana Z s por tarea]` | |

---

## 1. Integración de extremo a extremo

**Qué se probó:** `[todos los módulos funcionando juntos en el entorno operacional, con los N roles]`

**Resultado sobre la versión final (`[fecha]`):**
- `[corridas, casos, cuántos pasan]`;
- `[fallas, con su causa y su cierre]`;
- `[el flujo de punta a punta: qué recorrió]`.

**Omitidas por diseño:**

| Prueba | Motivo |
|---|---|

**Evidencia:** `evidencia/01_integracion/`

## 2. Funcionales y de aceptación (UAT)

**Qué se probó:** `[casos de uso por rol, ejecutados por personas representativas en sesiones grabadas]`

| Rol | Participantes | Casos | Cumplidos sin ayuda |
|---|---|---|---|

**Defectos:** `[críticos: 0; otros, con su estado]` · **Acta:** firmada el `[fecha]`
**Evidencia:** `evidencia/02-08_usuarios/`

## 3. Rendimiento y carga

**Qué se probó:** `[k6, N usuarios simultáneos con la mezcla de roles, volumen de datos]`

| Métrica | Resultado | Umbral |
|---|---|---|
| p95 | | < 2 s |
| Errores | | < 1 % |
| Peticiones por segundo | | — |

**Evidencia:** `evidencia/03_carga/`

## 4. Estrés y estabilidad

**Estrés:** quiebre entre `[X]` y `[Y]` usuarios; recuperación en `[tiempo]`, sin intervención.
**Soak:** `[duración]`, `[usuarios]`; p95 `[x]`, errores `[y]`, degradación `[z]` %; CPU y memoria `[estables]`.
**Evidencia:** `evidencia/04_estres_estabilidad/`

## 5. Seguridad

| Control | Resultado | Evidencia |
|---|---|---|
| S1 a S15 | | |

**Escaneos:** ZAP `[altas/medias]` · TLS `[calificación]` · Dependencias `[críticas]` · Secretos `[hallazgos]`
**Evidencia:** `evidencia/05_seguridad/`

## 6. Interoperabilidad

| Integración | Intercambio | Fecha | Resultado |
|---|---|---|---|

**Evidencia:** `evidencia/06_interoperabilidad/`

## 7. Resiliencia y recuperación

| Escenario | Resultado |
|---|---|
| R1 Caída de la aplicación o API | |
| R2 Caída de la base | |
| R3 Caída de un proveedor externo | |
| R4 Pérdida de red (5 condiciones) | |
| R5 Recuperación después del estrés | |
| R6 Restauración: RTO `[x]` y RPO `[y]` | |

**Pendientes declarados:** `[si los hay]`
**Evidencia:** `evidencia/07_resiliencia/`

## 8. Usabilidad

**SUS:** promedio `[x]` (de `[a]` a `[b]`) · **Éxito de tareas:** `[y]` % · **Errores:** `[n]` · **Mediana por tarea:** `[t]`

| Rol | Participantes | SUS promedio | Éxito |
|---|---|---|---|

**Evidencia:** `evidencia/02-08_usuarios/`

---

## Anexos

- Declaración de la versión final
- Acta UAT
- Aprobación del flujo de datos con la IA (si aplica)
- Parámetros aprobados (`04-parametros.md`)
- Checklist TRL 6 marcado
