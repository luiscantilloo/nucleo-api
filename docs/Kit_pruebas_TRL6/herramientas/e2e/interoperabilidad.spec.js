// C6: un intercambio real por integración. Usa la sección interoperabilidad de config.json.
// Registra el estado, el tiempo y un resumen corto de la respuesta (sin datos personales) en INTEGRACIONES_<fecha>.json.
const { test, expect } = require('@playwright/test');
const { cfg, conCredenciales, sesionAPI, plantilla, PREFIJO, guardar } = require('./lib');

const registros = [];
for (const it of (cfg.interoperabilidad && cfg.interoperabilidad.lista) || []) {
  test(`C6 ${it.integracion}`, async () => {
    test.skip(!conCredenciales(it.rol), `Falta PASS_${it.rol.toUpperCase()}`);
    const ctx = await sesionAPI(it.rol);
    const t0 = Date.now();
    const r = await ctx.fetch(it.ruta, { method: it.metodo || 'GET', ...(it.cuerpo ? { data: plantilla(it.cuerpo, { prefijo: PREFIJO }) } : {}) });
    const ms = Date.now() - t0;
    let resumen = '';
    try { const j = await r.json(); resumen = String(it.campoResumen ? j[it.campoResumen] : JSON.stringify(j)).slice(0, 120); } catch { resumen = (await r.text()).slice(0, 120); }
    await ctx.dispose();
    registros.push({ integracion: it.integracion, fecha: new Date().toISOString(), metodo: it.metodo, ruta: it.ruta, estado: r.status(), ms, resumen });
    expect(r.status(), `${it.integracion}: estado esperado`).toBe(it.esperado || 200);
  });
}
test.afterAll(() => { if (registros.length) guardar(`INTEGRACIONES_${Date.now()}.json`, registros); });
