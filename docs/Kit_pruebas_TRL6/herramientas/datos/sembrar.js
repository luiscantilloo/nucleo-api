// Carga datos SINTÉTICOS por la API para tener un volumen realista en las pruebas de carga (C3).
// Todo lleva el prefijo TRL-QA-, para encontrarlo y limpiarlo después. Nunca use datos reales.
// Uso: node sembrar.js <sembrar.json>     (Node 18 o superior; claves en PASS_<ROL>)
// sembrar.json: { "apiUrl": "...", "ingreso": {ruta, cuerpo, sesion, nombreCookie, campoToken},
//                 "rol": "operador", "email": "...", "recursos": [{ "ruta": "/api/registros", "cantidad": 500,
//                 "cuerpo": { "nombre": "{prefijo}Registro {i}", "valor": "{i}" } }], "pausaMs": 50 }
const fs = require('fs');
const cfg = JSON.parse(fs.readFileSync(process.argv[2] || 'sembrar.json', 'utf8'));
const API = (process.env.API_URL || cfg.apiUrl || '').replace(/\/$/, '');
const PASS = process.env[`PASS_${cfg.rol.toUpperCase()}`];
const PREFIJO = process.env.TRL_PREFIX || `TRL-QA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-`;
if (!API || !PASS) { console.error('Falta API_URL o la clave PASS_<ROL>.'); process.exit(1); }
const sustituir = (o, v) => JSON.parse(JSON.stringify(o).replace(/\{(\w+)\}/g, (_, k) => (v[k] ?? `{${k}}`)));
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const ing = cfg.ingreso;
  const r = await fetch(API + ing.ruta, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sustituir(ing.cuerpo, { email: cfg.email, password: PASS })) });
  if (!r.ok) { console.error(`Ingreso falló: HTTP ${r.status}`); process.exit(1); }
  const cab = { 'Content-Type': 'application/json' };
  if (ing.sesion === 'bearer') cab.Authorization = `Bearer ${(await r.json())[ing.campoToken || 'token']}`;
  else cab.Cookie = (r.headers.get('set-cookie') || '').split(';')[0];
  const resumen = [];
  for (const rec of cfg.recursos) {
    let ok = 0, err = 0;
    for (let i = 1; i <= rec.cantidad; i += 1) {
      const res = await fetch(API + rec.ruta, { method: 'POST', headers: cab, body: JSON.stringify(sustituir(rec.cuerpo, { prefijo: PREFIJO, i })) });
      res.ok ? ok++ : err++;
      if (i % 50 === 0) process.stdout.write(`${rec.ruta}: ${i}/${rec.cantidad}\r`);
      await espera(cfg.pausaMs ?? 50);
    }
    resumen.push({ ruta: rec.ruta, creados: ok, errores: err });
  }
  console.log('\n' + JSON.stringify({ prefijo: PREFIJO, resumen }, null, 2));
})();
