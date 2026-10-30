// C5 · S1: aislamiento entre usuarios (IDOR). Usa la sección idor de config.json.
// El dueño crea un recurso de prueba; otra cuenta del MISMO rol y una de OTRO rol intentan
// leerlo / modificarlo / borrarlo. Debe dar 401, 403 o 404.
// Soporta campoId anidado (p. ej. "person.id") y omitir `leer` si la API no expone GET por id.
const { test, expect } = require('@playwright/test');
const { cfg, PREFIJO, conCredenciales, sesionAPI, plantilla, guardar } = require('./lib');

const c = cfg.idor;

function valorCampo(obj, path) {
  return String(path || 'id').split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}

test('S1 IDOR: nadie toca recursos ajenos', async () => {
  test.skip(!c, 'Falta la sección idor en config.json');
  for (const r of [c.dueno, c.otroMismoRol, c.otroRol]) {
    test.skip(!conCredenciales(r), `Falta PASS_${r.toUpperCase()}`);
  }
  const dueno = await sesionAPI(c.dueno);
  const res = await dueno.post(c.crear.ruta, { data: plantilla(c.crear.cuerpo, { prefijo: PREFIJO }) });
  expect(res.ok(), `el dueño crea el recurso (HTTP ${res.status()})`).toBeTruthy();
  const body = await res.json();
  const id = String(valorCampo(body, c.campoId) || '');
  expect(id && id !== 'undefined', `la respuesta trae ${c.campoId}`).toBeTruthy();
  const url = (t, x = id) => t.replace('{id}', encodeURIComponent(x));
  const resultados = [];
  const denegado = (status) => [401, 403, 404].includes(status);
  const probar = async (quien, ctx, metodo, ruta, cuerpo, { compartirMismoRol = false } = {}) => {
    const r = await ctx.fetch(ruta, {
      method: metodo,
      ...(cuerpo ? { data: plantilla(cuerpo, { prefijo: PREFIJO, id }) } : {}),
    });
    const status = r.status();
    // Si el recurso es de privilegio compartido del mismo rol (p. ej. admin×admin), 200 es aceptable solo para otroMismoRol.
    const ok = compartirMismoRol ? (denegado(status) || status === 200) : denegado(status);
    resultados.push({
      quien,
      metodo,
      ruta: ruta.replace(id, '{id}'),
      estado: status,
      ok,
      nota: compartirMismoRol && status === 200 ? 'privilegio-compartido-mismo-rol' : undefined,
    });
  };
  for (const quien of [c.otroMismoRol, c.otroRol]) {
    const ctx = await sesionAPI(quien);
    const compartir = Boolean(c.mismoRolCompartido && quien === c.otroMismoRol);
    if (c.leer) await probar(quien, ctx, 'GET', url(c.leer), null, { compartirMismoRol: compartir });
    if (c.modificar) {
      await probar(quien, ctx, c.modificar.metodo, url(c.modificar.ruta), c.modificar.cuerpo, { compartirMismoRol: compartir });
    }
    if (c.borrar) {
      await probar(quien, ctx, c.borrarMetodo || 'DELETE', url(c.borrar), c.borrarCuerpo || null, { compartirMismoRol: compartir });
    }
    for (const falso of c.idsInventados || []) {
      if (c.leer) await probar(quien, ctx, 'GET', url(c.leer, falso), null, { compartirMismoRol: false });
      else if (c.borrar) {
        await probar(quien, ctx, c.borrarMetodo || 'DELETE', url(c.borrar, falso), c.borrarCuerpo || null, { compartirMismoRol: false });
      }
    }
    await ctx.dispose();
  }
  if (c.leer) {
    const propio = (await dueno.get(url(c.leer))).status();
    resultados.push({ quien: `${c.dueno} (dueño)`, metodo: 'GET', ruta: c.leer, estado: propio, ok: propio === 200 });
  } else if (c.controlDueño) {
    const r = await dueno.fetch(url(c.controlDueño.ruta), {
      method: c.controlDueño.metodo || 'GET',
      ...(c.controlDueño.cuerpo
        ? { data: plantilla(c.controlDueño.cuerpo, { prefijo: PREFIJO, id }) }
        : {}),
    });
    resultados.push({
      quien: `${c.dueno} (dueño)`,
      metodo: c.controlDueño.metodo || 'GET',
      ruta: c.controlDueño.ruta,
      estado: r.status(),
      ok: r.status() === (c.controlDueño.esperado || 200),
    });
  }
  await dueno.dispose();
  guardar(`S1_idor_${Date.now()}.json`, { prefijo: PREFIJO, resultados });
  expect(resultados.filter((x) => !x.ok), 'accesos que no debieron permitirse (o el dueño sin acceso)').toEqual([]);
});
