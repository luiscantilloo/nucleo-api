// Mide cuánto tiempo estuvo caído el sistema durante una prueba de caída (C7, R1 a R3).
// Consulta el endpoint de salud cada N segundos y registra cada cambio de estado.
// Uso: node medir-disponibilidad.js <url de salud> [segundos=2] > disponibilidad_R1.csv
//      Detener con Ctrl+C: al final imprime el resumen (caídas y duración total).
const url = process.argv[2];
const cada = Number(process.argv[3] || 2) * 1000;
if (!url) { console.error('Uso: node medir-disponibilidad.js <url de salud> [segundos]'); process.exit(1); }
let anterior = null; let desde = Date.now(); const caidas = [];
console.log('hora,estado_http,ms,arriba');
async function sondear() {
  const t0 = Date.now(); let estado = 0;
  try { const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 10000); const r = await fetch(url, { signal: ctl.signal }); clearTimeout(to); estado = r.status; } catch { estado = 0; }
  const arriba = estado >= 200 && estado < 300;
  console.log(`${new Date().toISOString()},${estado},${Date.now() - t0},${arriba}`);
  if (anterior !== null && arriba !== anterior) {
    if (!arriba) desde = Date.now(); else caidas.push((Date.now() - desde) / 1000);
  }
  anterior = arriba;
}
const id = setInterval(sondear, cada); sondear();
process.on('SIGINT', () => {
  clearInterval(id);
  const total = caidas.reduce((s, x) => s + x, 0);
  console.error(`\nCaídas: ${caidas.length} · duración de cada una (s): ${caidas.map((x) => x.toFixed(1)).join(', ') || '—'} · total: ${total.toFixed(1)} s`);
  process.exit(0);
});
