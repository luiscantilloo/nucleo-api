# Pruebas con k6

1. Copiar `k6.config.ejemplo.json` a `k6.config.json` y llenar: el ingreso, los roles con su peso (la proporción en la operación) y sus **rutas de lectura**.
2. Las claves van solo en el comando: `-e PASS_<ROL>=...`.

| Prueba | Comando |
|---|---|
| C3 Carga | `k6 run -e CFG=k6.config.json -e BASE_URL=<api> -e VUS_OBJETIVO=<n> -e PASS_ADMIN=... --summary-export=resumen.json --out csv=series.csv carga.js` |
| C4 Estrés | `k6 run -e CFG=k6.config.json -e BASE_URL=<api> -e VUS_MAX=<4 × objetivo> ... --out csv=estres_series.csv estres.js`, luego `node degradacion.js estres_series.csv --por-minuto` |
| C4 Recuperación | Justo después del estrés: `carga.js` con `-e ESCALONES_CORTOS=1`. Debe pasar los umbrales sin reiniciar nada |
| C4 Soak | `k6 run -e CFG=k6.config.json -e BASE_URL=<api> -e VUS_SOAK=<n> -e DURACION=2h ... --out csv=soak_series.csv soak.js`, luego `node degradacion.js soak_series.csv` |

Si el proveedor de hosting mitiga el tráfico (por ejemplo, la cabecera `x-vercel-mitigated` o `cf-mitigated`), k6 se detiene solo. Hay que hablar con el proveedor o permitir la IP de la máquina de pruebas.
