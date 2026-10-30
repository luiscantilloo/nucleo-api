# Declaración de la versión final evaluada

**Sistema:** `[nombre]` · **Fecha:** `[fecha]`

Se declara como **versión final evaluada** la desplegada en el entorno operacional (`[URL]`) en la fecha indicada:

| Componente | Repositorio | Commit |
|---|---|---|
| `[Aplicación web]` | `[repositorio]` | `[commit]` |
| `[API]` | `[repositorio]` | `[commit]` |
| `[Otro]` | | |

**Verificación al firmar:** el endpoint de salud (`[ruta]`) devuelve el commit del backend; la salida se guarda en `evidencia/00_version/salud_firma_E2_<fecha>.json`. El commit del frontend se respalda con el registro de despliegue (por ejemplo, Vercel) y se guarda en `evidencia/00_version/`.

**Desde esta fecha se congelan los despliegues** hasta terminar las pruebas finales. Si hay que desplegar algo, se declara una versión nueva y se repiten las pruebas afectadas.

**Esta versión incluye las correcciones de:** `[lista de hallazgos corregidos, con su commit]`.

**Sobre esta versión se corren:**
- la suite de integración de extremo a extremo (C1);
- la carga y la estabilidad (C3 y C4), o se declara sobre qué versión se hicieron y por qué siguen siendo válidas, con la salida de `git diff --stat <anterior> <esta> -- backend frontend`;
- la verificación de los controles de seguridad corregidos (C5);
- las sesiones con usuarios (C2 y C8).

**Cambios de configuración que no son de código** (por ejemplo, activar una autenticación en un servicio externo): `[lista o «ninguno»]`.

| | Responsable técnico | Responsable del proyecto |
|---|---|---|
| Nombre | | |
| Fecha | | |
| Firma | | |
