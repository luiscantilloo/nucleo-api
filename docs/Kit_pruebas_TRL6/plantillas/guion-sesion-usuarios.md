# Guion para las sesiones con usuarios (UAT y usabilidad, C2 y C8)

**Duración:** 30 a 45 minutos por persona · **Personas:** un facilitador y, si se puede, un observador que anota.

## Antes de la sesión

- [ ] Si se graba: autorización firmada (`autorizacion-grabacion.md`). En TRL 6 grabar es opcional.
- [ ] Hoja de registro de la sesión lista (`hoja-de-registro-sesion.md`).
- [ ] Cuenta de prueba del rol, **activa**, probada el mismo día.
- [ ] Datos de prueba listos, con el prefijo, incluida la entidad del flujo completo si toca.
- [ ] Si se graba: pantalla completa y micrófono (OBS, Zoom, Meet o Teams), probados 1 minuto.
- [ ] El Excel abierto en la hoja del rol (lo llena el observador o el facilitador).
- [ ] Si un caso genera efectos reales (avisos, alertas, cobros), avisar antes al equipo.

## Durante la sesión

1. **Apertura** (grabando, si se graba): «Gracias por participar. Vamos a probar la plataforma, no a usted. No hay respuestas malas. Le voy a leer unas tareas; hágalas como lo haría normalmente y diga en voz alta lo que piensa. Yo no le voy a ayudar, salvo que se quede bloqueado».
2. **Identificación:** el participante dice su código, rol, fecha y hora, y la autorización en voz.
3. **Por cada caso:**
   - el facilitador dice el código («Caso R1-02») y **lee la tarea textual**, sin explicar cómo hacerla;
   - el observador anota (en la hoja de registro) el minuto del video si se graba, el tiempo, los errores (clics equivocados, retrocesos, mensajes de error) y lo que la persona dice;
   - **resultado:**
     - **Cumple:** lo hizo solo;
     - **Con ayuda:** necesitó cualquier pista;
     - **No cumple:** no lo logró o se rindió.
   - Si la persona se bloquea más de 3 minutos, se da una pista y queda «Con ayuda».
4. **SUS:** se leen las 10 afirmaciones; la persona responde de 1 a 5. Se anotan tal cual.
5. **Cierre:** «¿Qué fue lo más difícil? ¿Qué cambiaría?». Se anota textual.

## Después de la sesión

- Pasar los defectos a la lista con su gravedad:

| Gravedad | Significa | Ejemplo |
|---|---|---|
| **Crítico** | Impide completar una tarea esencial, pierde o expone datos, o falla un protocolo de seguridad | No se puede guardar; un usuario ve datos de otro |
| **Mayor** | La tarea se completa con mucha dificultad o con un rodeo | Hay que recargar la página para ver el cambio |
| **Menor** | Molestia, texto confuso o detalle visual | Un botón cortado en el celular |

- **Difuminar el video** antes de compartirlo si aparece cualquier dato real, clave, correo o teléfono:
  - con herramientas gráficas: DaVinci Resolve, Clipchamp o Shotcut (filtro de desenfoque por zona);
  - con ffmpeg, para un rectángulo fijo:
    ```
    ffmpeg -i entrada.mp4 -filter_complex "[0:v]crop=<ancho>:<alto>:<x>:<y>,boxblur=20[b];[0:v][b]overlay=<x>:<y>" -c:a copy salida_difuminado.mp4
    ```
- Guardar como `evidencia/02-08_usuarios/<rol>/<código>.mp4`, y conservar el original sin difuminar **solo** en un lugar privado, hasta la fecha de borrado de la autorización.
