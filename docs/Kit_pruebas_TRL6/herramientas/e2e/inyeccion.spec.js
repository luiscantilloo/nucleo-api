// C5 · S8: inyección y XSS por la API. Usa la sección inyeccion de config.json.
// Cumple si: ninguna carga produce un error 5xx; al leer lo guardado, el HTML no vuelve sin escapar
// en respuestas de tipo text/html; y el ingreso con operadores NoSQL no entra.
const { test, expect, request: pwRequest } = require('@playwright/test');
const { cfg, API_URL, PREFIJO, conCredenciales, sesionAPI, plantilla, guardar } = require('./lib');

const CARGAS = [
  '<script>alert(1)</script>',
  '"><img src=x onerror=alert(1)>',
  'javascript:alert(1)',
  "' OR '1'='1",
  "'; DROP TABLE x; --",
  { $ne: null },
  { $gt: '' },
  'x'.repeat(10000),
];

test('S8 ingreso con operadores NoSQL no entra', async () => {
  const { programHeaders } = require('./lib');
  const ing = cfg.ingreso.api;
  const ctx = await pwRequest.newContext({ baseURL: API_URL, extraHTTPHeaders: programHeaders() });
  const cuerpo = JSON.parse(JSON.stringify(ing.cuerpo).replace('"{email}"', '{"$ne":null}').replace('"{password}"', '{"$ne":null}'));
  const r = await ctx.post(ing.ruta, { data: cuerpo });
  await ctx.dispose();
  guardar(`S8_ingreso_nosql_${Date.now()}.json`, { estado: r.status() });
  expect(r.status(), 'no debe entrar ni romper').not.toBeLessThan(400);
  expect(r.status()).toBeLessThan(500);
});

for (const obj of (cfg.inyeccion && cfg.inyeccion.objetivos) || []) {
  test(`S8 cargas en ${obj.metodo} ${obj.ruta}`, async () => {
    test.skip(!conCredenciales(obj.rol), `Falta PASS_${obj.rol.toUpperCase()}`);
    const ctx = await sesionAPI(obj.rol);
    const resultados = [];
    for (const campo of obj.campos) {
      for (const carga of CARGAS) {
        const cuerpo = plantilla(obj.cuerpoBase, { prefijo: PREFIJO });
        cuerpo[campo] = typeof carga === 'string' && campo in cuerpo && String(cuerpo[campo]).includes(PREFIJO) ? `${PREFIJO}${carga}` : carga;
        const r = await ctx.fetch(obj.ruta, { method: obj.metodo, data: cuerpo });
        resultados.push({ campo, carga: typeof carga === 'string' ? carga.slice(0, 40) : JSON.stringify(carga), estado: r.status(), sin5xx: r.status() < 500 });
      }
    }
    let reflejoSinEscapar = false;
    if (obj.leerDespues) {
      const r = await ctx.get(obj.leerDespues.replace('{prefijo}', encodeURIComponent(PREFIJO)));
      const tipo = r.headers()['content-type'] || '';
      const cuerpo = await r.text();
      reflejoSinEscapar = tipo.includes('text/html') && /<script>alert\(1\)<\/script>|onerror=alert\(1\)/.test(cuerpo);
    }
    await ctx.dispose();
    guardar(`S8_inyeccion_${obj.ruta.replace(/\W+/g, '_')}_${Date.now()}.json`, { prefijo: PREFIJO, resultados, reflejoSinEscapar });
    expect(resultados.filter((x) => !x.sin5xx), 'cargas que produjeron error 5xx').toEqual([]);
    expect(reflejoSinEscapar, 'HTML devuelto sin escapar').toBe(false);
  });
}
// Además: revisar en pantalla que lo guardado se muestra como texto (captura), ver seguridad.md sección 4.
