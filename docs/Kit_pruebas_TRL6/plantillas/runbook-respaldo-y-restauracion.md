# Runbook de respaldo y restauración

**Sistema:** `[nombre]` · **RTO:** `[valor]` · **RPO:** `[valor]` · **Última prueba:** `[fecha]`

## 1. Respaldos

| Qué | Cómo | Frecuencia | Dónde | Cuántas copias | Quién tiene acceso |
|---|---|---|---|---|---|
| Base de datos | `[automático del proveedor, script…]` | | | | |
| Archivos subidos | | | | | |
| Configuración y secretos | `[gestor de secretos; nunca en el repositorio]` | | | | |
| Código | Repositorios | Cada commit | | | |

Regla recomendada: **3 copias, en 2 medios distintos, 1 fuera del proveedor principal**, más 1 copia probada.

## 2. Restauración (paso a paso)

1. Declarar el incidente y anotar la hora (inicio del RTO).
2. Elegir el respaldo y anotar su fecha y hora: su antigüedad es la pérdida de datos real, que debe ser ≤ RPO.
3. Restaurar en `[entorno]`, **nunca encima de producción** en la prueba.
4. Comandos o pasos del proveedor: `[…]`
5. Apuntar la aplicación a la base restaurada (en la prueba, una copia de la aplicación).
6. Verificar: la salud, el ingreso de una cuenta de prueba y los conteos por colección o tabla frente a los del respaldo. Comandos para contar (la cadena de conexión va en una variable de entorno, **nunca en el archivo de evidencia**):
   - **MongoDB:**
     ```
     mongosh "$MONGO_URI" --quiet --eval 'db.getCollectionNames().sort().forEach(c => print(c + "," + db.getCollection(c).countDocuments()))' > conteos_<origen|restaurada>.csv
     ```
   - **PostgreSQL:**
     ```
     psql "$PG_URI" -At -F, -c "SELECT relname, n_live_tup FROM pg_stat_user_tables ORDER BY relname" > conteos_<origen|restaurada>.csv
     ```
     Para cifras exactas, use `SELECT count(*)` por tabla.
   - **MySQL:**
     ```
     mysql --defaults-extra-file=cred.cnf -N -e "SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema='<base>'" > conteos.csv
     ```
   - **Comparar:**
     ```
     diff conteos_origen.csv conteos_restaurada.csv
     ```
     Sin salida significa conteos iguales.
7. Anotar la hora final (fin del RTO).

## 3. Resultado de la prueba

| Dato | Valor |
|---|---|
| Fecha del respaldo usado | |
| Antigüedad del respaldo al momento de la prueba | ≤ RPO: ☐ |
| Hora de inicio y de fin | |
| Tiempo total de restauración | ≤ RTO: ☐ |
| Conteos antes y después | Iguales: ☐ (tabla adjunta) |
| Problemas encontrados | |

**Evidencia:** `evidencia/07_resiliencia/R6_respaldo/` (conteos, capturas y salidas de los comandos, sin cadenas de conexión ni claves).
