# Errores que rechazan una entrega

Estos son los hallazgos que hicieron rechazar entregas en una evaluación real de tres rondas. Ninguno fue por mala ingeniería: todos fueron de **alcance, versión, firmas o evidencia**. Evitarlos ahorra rondas completas.

## 1. Firmas y alcance

| Error | Cómo evitarlo |
|---|---|
| Los parámetros (E1) se aprobaron **después** de haber corrido las primeras pruebas | Firmar E1 antes de la primera corrida |
| El desarrollador firmó **como responsable del proyecto** | Cada uno firma en su fila. Sin la firma del responsable del proyecto, E1, D4 y E2 no valen |
| Se excluyeron integraciones, sesiones o riesgos «**por decisión del responsable**» sin su firma | Toda exclusión va en una adenda (`plantillas/adenda-parametros.md`) firmada por el responsable del proyecto |
| El editable de un documento firmado tenía cambios que no estaban en el PDF | El editable y el PDF firmado son idénticos. Si cambia algo, se emite una versión nueva |
| La autorización de pruebas destructivas (D5) era un mensaje de chat, con marcadores sin llenar | D5 es un documento con fechas, franjas, alcance y firmas |
| El **periodo de D5 empezaba un día después** de las pruebas | Revisar que el periodo cubra todas las fechas de prueba, en la zona horaria del documento |

## 2. Versión

| Error | Cómo evitarlo |
|---|---|
| Carga, estrés, soak, ZAP y R1 corridos sobre una versión anterior a la declarada | Las corridas finales van **después** de la firma de E2, sobre su commit |
| La carga «de confirmación» se corrió con `ESCALONES_CORTOS` | La corrida final de C3 usa el perfil completo (16 min) |
| El reporte decía que una prueba se hizo sobre la versión final y la salud mostraba otro commit | Cada resultado cita su archivo de salud |
| No había archivo de salud al firmar E2 | Guardar `salud_firma_E2_<fecha>.json` en el momento de la firma |
| Se reutilizaron corridas de la versión anterior sin respaldo | Adjuntar `git diff --stat <anterior> <nueva> -- backend frontend` y explicar por qué no afecta |
| No había evidencia del commit del frontend desplegado | Guardar el registro de despliegue (por ejemplo, de Vercel) y una prueba de que el bundle contiene el cambio |

## 3. Pruebas

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

## 4. Evidencia

| Error | Cómo evitarlo |
|---|---|
| El id de un correo enviado solo aparecía en el `.md` | Cada afirmación lleva su archivo: un json o un extracto del log |
| Seis capturas «del administrador» eran la pantalla de ingreso | `capturas.spec.js` ahora falla si queda en la pantalla de ingreso. Abrir cada imagen antes de entregar |
| Cookies de sesión y tokens sin tapar en los JSON de SSL Labs y en los logs de fallas de Playwright | Correr `revisar-evidencia.js` sobre **todo** el paquete y revisar cada hallazgo. Borrar `test-results/` |
| Identificadores reales de clientes (ids de números de WhatsApp), su teléfono y la cédula del firmante en documentos para evaluadores | Taparlos o quitarlos de las copias que se comparten |
| El checklist marcaba `[x]` en documentos que no se habían actualizado | Solo se marca lo que tiene un archivo que lo respalde |
| Las condiciones decían «con fecha», pero sin fecha | Cada condición lleva una fecha concreta |

## 5. Producción

| Error | Cómo evitarlo |
|---|---|
| Un token de un proveedor quedó escrito en el log de acceso de producción | Los logs tapan parámetros sensibles. Los tokens van en el cuerpo, nunca en la URL |
| Se desactivó una función a clientes reales sin avisar | Los cambios en producción se avisan antes al responsable del proyecto, y a los clientes afectados |
| Los respaldos vivían en el mismo servidor, sin copia externa | Declararlo como riesgo, o agregar una copia externa |
