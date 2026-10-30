// Limpia (borra, archiva o desactiva) todo lo que crearon las pruebas, buscándolo por el prefijo TRL-QA-.
// Por seguridad, SIN --ejecutar solo lista lo que encontraría. Nunca toca registros sin el prefijo.
// Uso: node limpiar.js <limpiar.json> [--ejecutar]      (Node 18 o superior; clave en PASS_<ROL>)
// Variable opcional TRL_PREFIX: el prefijo a limpiar (por defecto «TRL-QA-», es decir, todas las corridas).
const fs = require('fs');
const cfg = JSON.parse(fs.readFileSync(process.argv[2] || 'limpiar.json', 'utf8'));
const EJECUTAR = process.argv.includes('--ejecutar');
const API = (process.env.API_URL || cfg.apiUrl || '').replace(/\/$/, '');
const PASS = process.env[`PASS_${cfg.rol.toUpperCase()}`];
const PREFIJO = process.env.TRL_PREFIX || 'TRL-QA-';
if (!API || !PASS) { console.error('Falta API_URL o la clave PASS_<ROL>.'); process.exit(1); }
if (!PREFIJO.startsWith('TRL-QA-')) { console.error('Por seguridad, el prefijo debe empezar por TRL-QA-.'); process.exit(1); }
const sustituir = (o, v) => JSON.parse(JSON.stringify(o).replace(/\{(\w+)\}/g, (_, k) => (v[k] ?? `{${k}}`)));
const obtener = (o, ruta) => ruta.split('.').reduce((x, k) => (x == null ? x : x[k]), o);

(async () => {
  const ing = cfg.ingreso;
  const r = await fetch(API + ing.ruta, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sustituir(ing.cuerpo, { email: cfg.email, password: PASS })) });
  if (!r.ok) { console.error(`Ingreso falló: HTTP ${r.status}`); process.exit(1); }
  const cab = { 'Content-Type': 'application/json' };
  if (ing.sesion === 'bearer') cab.Authorization = `Bearer ${(await r.json())[ing.campoToken || 'token']}`;
  else cab.Cookie = (r.headers.get('set-cookie') || '').split(';')[0];
  const resumen = [];
  for (const rec of cfg.recursos) {
    const res = await fetch(API + rec.buscar.replace('{prefijo}', encodeURIComponent(PREFIJO)), { headers: cab });
    const j = await res.json().catch(() => ({}));
    const lista = (rec.lista ? obtener(j, rec.lista) : j) || [];
    // Sin distinguir mayúsculas: los correos de prueba suelen guardarse en minúsculas.
    const mios = (Array.isArray(lista) ? lista : []).filter((x) => String(obtener(x, rec.campoNombre) || '').toLowerCase().includes(PREFIJO.toLowerCase()));
    let hechos = 0, errores = 0;
    for (const x of mios) {
      const id = obtener(x, rec.campoId);
      if (!EJECUTAR) { console.log(`[simulación] ${rec.accion.metodo} ${rec.accion.ruta.replace('{id}', id)} · ${obtener(x, rec.campoNombre)}`); continue; }
      const a = await fetch(API + rec.accion.ruta.replace('{id}', encodeURIComponent(id)), { method: rec.accion.metodo, headers: cab, ...(rec.accion.cuerpo ? { body: JSON.stringify(rec.accion.cuerpo) } : {}) });
      a.ok ? hechos++ : errores++;
    }
    resumen.push({ recurso: rec.buscar, encontrados: mios.length, limpiados: EJECUTAR ? hechos : 0, errores });
  }
  console.log(JSON.stringify({ prefijo: PREFIJO, ejecutado: EJECUTAR, resumen }, null, 2));
  if (!EJECUTAR) console.log('Simulación: nada se cambió. Repita con --ejecutar para limpiar.');
})();
