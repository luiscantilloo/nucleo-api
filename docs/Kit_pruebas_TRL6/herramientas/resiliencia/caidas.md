# Resiliencia: escenarios de caída (C7, R1 a R3)

**Necesita autorización escrita y un horario acordado.** Si se hace en producción, se avisa antes al equipo y se elige el horario de menor uso. Si existe un entorno equivalente, se prefiere ese.

Para cada escenario se crea `evidencia/07_resiliencia/<R#>_<nombre>/RESULTADO.md` con:
- la fecha y hora de inicio y de fin;
- la versión (salud antes y después);
- cómo se provocó la caída;
- qué vio el usuario (captura);
- cuánto tardó en volver;
- si se perdió algo (conteos antes y después);
- el veredicto.

## R1 · Caída de la aplicación o de la API

1. Con un usuario de prueba conectado, reiniciar el servicio desde el panel del hosting (Restart o Redeploy del mismo commit).
2. Mientras tanto, cada 5 segundos:
   ```
   curl -s -o /dev/null -w "%{http_code} %{time_total}\n" <API_URL>/<salud>
   ```
3. Medir el tiempo hasta que la salud vuelve a 200.
4. Verificar que la sesión del usuario sigue o que puede volver a entrar sin perder datos.

**Cumple si** vuelve sola y no se pierde nada de lo guardado.

## R2 · Caída de la base de datos

Opciones, de la más segura a la más real:
- en el entorno equivalente, detener la base;
- en producción, bloquear temporalmente la IP del servidor en la lista de acceso de la base o pausar el clúster, si el proveedor lo permite.

1. Usar la aplicación: listar, abrir y guardar.
2. Registrar qué ve el usuario.
3. Restablecer la base y medir cuánto tarda la aplicación en volver **sin reiniciarla**.

**Cumple si:**
- el usuario ve un error claro (no una pantalla en blanco ni un error técnico);
- no se pierde lo guardado antes;
- la aplicación se recupera sola.

## R3 · Caída de un proveedor externo

Para cada integración crítica (IA, mensajería, pagos):
1. En el entorno de pruebas, apuntar la URL del proveedor a una dirección inválida o quitar su clave, y reiniciar.
2. Usar la función que depende del proveedor.
3. Registrar la respuesta al usuario y el tiempo.

**Cumple si:**
- el resto de la plataforma funciona;
- la función muestra un mensaje o una respuesta de respaldo.

**Si el sistema tiene un protocolo crítico** (seguridad, riesgo o emergencias), se prueba aparte: con el proveedor caído, **el protocolo responde igual** y se mide su tiempo.

Al terminar, se restablece la configuración y se verifica.

## R5 · Recuperación después del estrés

Ver la guía, prueba 4 (a).

## R4 y R6

- **R4 (pérdida de red):** `herramientas/e2e/perdida-red.spec.js`.
- **R6 (respaldo y restauración):** `plantillas/runbook-respaldo-y-restauracion.md`.
