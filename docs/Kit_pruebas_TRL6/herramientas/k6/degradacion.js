// Calcula la degradación del soak y el p95 por escalón del estrés a partir del CSV de k6.
// Uso: node degradacion.js soak_series.csv            -> p95 de la primera y la última hora y la degradación
//      node degradacion.js estres_series.csv --por-minuto  -> p95 y errores por minuto, para ubicar el quiebre
const fs = require('fs');
const archivo = process.argv[2];
if (!archivo) { console.error('Uso: node degradacion.js <series.csv> [--por-minuto]'); process.exit(1); }
const lineas = fs.readFileSync(archivo, 'utf8').split('\n');
const cab = lineas[0].split(',');
const iM = cab.indexOf('metric_name'), iT = cab.indexOf('timestamp'), iV = cab.indexOf('metric_value');
const dur = [], fallas = [];
for (const l of lineas.slice(1)) {
  const c = l.split(','); if (c.length < 3) continue;
  if (c[iM] === 'http_req_duration') dur.push([Number(c[iT]), Number(c[iV])]);
  if (c[iM] === 'http_req_failed') fallas.push([Number(c[iT]), Number(c[iV])]);
}
const p95 = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * 0.95))]; };
const t0 = Math.min(...dur.map((d) => d[0])); const t1 = Math.max(...dur.map((d) => d[0]));
if (process.argv.includes('--por-minuto')) {
  const porMin = {};
  for (const [t, v] of dur) (porMin[Math.floor((t - t0) / 60)] ||= { d: [], f: [] }).d.push(v);
  for (const [t, v] of fallas) (porMin[Math.floor((t - t0) / 60)] ||= { d: [], f: [] }).f.push(v);
  console.log('minuto,p95_ms,errores_pct');
  for (const m of Object.keys(porMin).map(Number).sort((a, b) => a - b)) {
    const f = porMin[m].f; console.log(`${m},${Math.round(p95(porMin[m].d))},${f.length ? ((100 * f.reduce((s, x) => s + x, 0)) / f.length).toFixed(2) : ''}`);
  }
} else {
  const primera = dur.filter(([t]) => t < t0 + 3600).map((d) => d[1]);
  const ultima = dur.filter(([t]) => t > t1 - 3600).map((d) => d[1]);
  const a = p95(primera), b = p95(ultima);
  console.log(`Duración: ${((t1 - t0) / 3600).toFixed(2)} h`);
  console.log(`p95 primera hora: ${Math.round(a)} ms · p95 última hora: ${Math.round(b)} ms`);
  console.log(`Degradación: ${(((b - a) / a) * 100).toFixed(1)} % (umbral: ≤ 10 %)`);
}
