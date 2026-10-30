// C1 · Casos generales: salud y versión, ingreso por rol, sesión, rutas protegidas y cabeceras.
// Los flujos propios del sistema van en flujos.spec.js.
const { test, expect, request: pwRequest } = require('@playwright/test');
const { cfg, API_URL, rol, conCredenciales, sesionAPI, ingresoUI, plantilla, guardar, programHeaders } = require('./lib');

test('G-01 la salud responde y devuelve la versión desplegada', async () => {
  const ctx = await pwRequest.newContext({ baseURL: API_URL, extraHTTPHeaders: programHeaders() });
  const res = await ctx.get(cfg.salud);
  expect(res.status()).toBe(200);
  const j = await res.json();
  const version = j[cfg.campoVersion || 'commit'];
  expect(version, `la salud trae ${cfg.campoVersion}`).toBeTruthy();
  guardar(`salud_${Date.now()}.json`, { at: new Date().toISOString(), version, programId: j.programId || cfg.programId });
  await ctx.dispose();
});

for (const r of cfg.roles) {
  test(`G-02 ingreso válido (${r.id}) lleva a su inicio`, async ({ page }) => {
    test.skip(!conCredenciales(r.id), `Falta PASS_${r.id.toUpperCase()}`);
    await ingresoUI(page, r.id);
    await expect(page).toHaveURL(new RegExp(r.inicio.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), { timeout: 20000 });
  });
}

test('G-03 ingreso inválido muestra un mensaje genérico y no entra', async ({ page }) => {
  const ui = cfg.ingreso.ui; const r = cfg.roles[0];
  await page.goto(ui.ruta);
  await page.getByLabel(ui.etiquetaCorreo, { exact: false }).fill(r.email);
  await page.getByLabel(ui.etiquetaClave, { exact: false }).fill('clave-incorrecta-' + Date.now());
  await page.getByRole('button', { name: ui.boton }).click();
  await expect(page.getByText(new RegExp(ui.textoErrorGenerico, 'i')).first()).toBeVisible({ timeout: 10000 });
  await expect(page).toHaveURL(new RegExp(ui.ruta));
});

test('G-04 sin sesión las rutas protegidas responden 401', async () => {
  const ctx = await pwRequest.newContext({ baseURL: API_URL, extraHTTPHeaders: programHeaders() });
  const fallas = [];
  for (const ruta of cfg.rutasProtegidas) {
    const s = (await ctx.get(ruta)).status();
    if (s !== 401) fallas.push(`${ruta} → ${s}`);
  }
  await ctx.dispose();
  expect(fallas, 'rutas que no devolvieron 401').toEqual([]);
});

test('G-05 la cookie de sesión tiene HttpOnly, SameSite y Secure (en https)', async () => {
  const ing = cfg.ingreso.api;
  test.skip(ing.sesion !== 'cookie', 'La sesión no es por cookie');
  const r = rol(cfg.roles[0].id);
  test.skip(!r.pass, 'Falta la clave del primer rol');
  const ctx = await pwRequest.newContext({ baseURL: API_URL, extraHTTPHeaders: programHeaders() });
  const res = await ctx.post(ing.ruta, { data: plantilla(ing.cuerpo, { email: r.email, password: r.pass }) });
  const sc = res.headers()['set-cookie'] || '';
  expect(sc, 'HttpOnly').toMatch(/httponly/i);
  expect(sc, 'SameSite').toMatch(/samesite=(lax|strict)/i);
  if (API_URL.startsWith('https')) expect(sc, 'Secure').toMatch(/secure/i);
  await ctx.dispose();
});

test('G-06 una sesión alterada no entra', async () => {
  const ing = cfg.ingreso.api;
  const cab = {
    ...programHeaders(),
    ...(ing.sesion === 'bearer'
      ? { Authorization: 'Bearer token.alterado.' + Date.now() }
      : { Cookie: `${ing.nombreCookie}=valor-alterado-${Date.now()}` }),
  };
  const ctx = await pwRequest.newContext({ baseURL: API_URL, extraHTTPHeaders: cab });
  const s = (await ctx.get(cfg.rutasProtegidas[0])).status();
  await ctx.dispose();
  expect(s).toBe(401);
});

test('G-07 cabeceras de seguridad presentes en la aplicación', async ({ request }) => {
  const res = await request.get('/');
  const h = res.headers();
  const faltan = (cfg.cabecerasEsperadas || []).filter((k) => !h[k.toLowerCase()]);
  expect(faltan, 'cabeceras que faltan').toEqual([]);
});

for (const r of cfg.roles) {
  test(`G-08 la sesión por API del rol ${r.id} funciona`, async () => {
    test.skip(!conCredenciales(r.id), `Falta PASS_${r.id.toUpperCase()}`);
    const ctx = await sesionAPI(r.id);
    // /api/auth/me: 200 con user (todos los roles). No usar rutasProtegidas[0]: muchos roles reciben 403 por RBAC.
    const ruta = cfg.rutaSesion || '/api/auth/me';
    const res = await ctx.get(ruta);
    expect(res.status()).toBe(200);
    const j = await res.json();
    expect(j.user || j.ok, `sesión activa del rol ${r.id}`).toBeTruthy();
    await ctx.dispose();
  });
}
