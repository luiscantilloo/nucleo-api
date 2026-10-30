// C5 · S7: política de claves. El rol autorizado intenta crear cuentas con claves débiles: todas deben rechazarse.
// Usa la sección claves de config.json. Las cuentas usan correos de prueba (.invalid) con el prefijo.
// Si la API no permite crear cuentas así (por ejemplo, invitación por correo), se hace manual (seguridad.md, sección 3).
const { test, expect } = require('@playwright/test');
const { cfg, PREFIJO, conCredenciales, sesionAPI, plantilla, guardar } = require('./lib');

test('S7 la política de claves rechaza claves débiles', async () => {
  const c = cfg.claves;
  test.skip(!c, 'Falta la sección claves en config.json');
  test.skip(!conCredenciales(c.rolCreador), `Falta PASS_${c.rolCreador.toUpperCase()}`);
  const ctx = await sesionAPI(c.rolCreador);
  const resultados = [];
  for (const [i, debil] of c.debiles.entries()) {
    const email = `${PREFIJO.toLowerCase()}clave${i}@ejemplo.invalid`;
    const password = debil.replace('{email}', email);
    const r = await ctx.post(c.ruta, { data: plantilla(c.cuerpo, { email, password }) });
    // No se guarda la clave probada, solo su tipo.
    resultados.push({ caso: `débil ${i + 1}`, largo: password.length, estado: r.status(), rechazada: r.status() >= 400 && r.status() < 500 });
  }
  let control = null;
  if (c.aceptadaDeControl) {
    const email = `${PREFIJO.toLowerCase()}control@ejemplo.invalid`;
    const password = c.aceptadaDeControl.replace('{aleatorio}', Math.random().toString(36).slice(2, 10));
    const r = await ctx.post(c.ruta, { data: plantilla(c.cuerpo, { email, password }) });
    control = { estado: r.status(), aceptada: r.ok() };
  }
  await ctx.dispose();
  guardar(`S7_claves_${Date.now()}.json`, { prefijo: PREFIJO, resultados, control });
  expect(resultados.filter((x) => !x.rechazada), 'claves débiles aceptadas').toEqual([]);
  if (control) expect(control.aceptada, 'una clave fuerte sí debe aceptarse (control positivo)').toBe(true);
});
