# Interoperabilidad (C6) · Intercambios registrados

**Versión:** `[commits]` · **Entorno:** `[…]`

Las integraciones que se activan por la API se registran solas con `herramientas/e2e/interoperabilidad.spec.js` (archivo `INTEGRACIONES_<fecha>.json`). Las que no, como una notificación que llega al celular o un correo, se registran a mano con una captura.

| Integración | Para qué | Operación de prueba | Fecha y hora | Petición (resumida, sin claves) | Respuesta (resumida) | Estado | Captura |
|---|---|---|---|---|---|---|---|
| `[Proveedor de IA]` | | Un mensaje con la cuenta de prueba | | | | ✓ / ✗ | |
| `[Mensajería]` | | Un envío a un número o correo de prueba | | | | | |
| `[Pagos]` | | Un cobro en modo de prueba (sandbox) | | | | | |
| `[Mapas]` | | Una consulta | | | | | |
| `[Base de datos gestionada]` | | Salud de la base desde el endpoint de salud | | | | | |
| `[Otra]` | | | | | | | |

**Notas:** `[integraciones que existen en el código pero no están activas, y por qué no se prueban]`
