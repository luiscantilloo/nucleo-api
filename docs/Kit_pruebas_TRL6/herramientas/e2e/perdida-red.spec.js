// C7 · R4: pérdida de red del usuario mientras guarda. Usa la sección perdidaRed de config.json.
// Comprueba 5 condiciones:
//   1. aviso visible al fallar el guardado;
//   2. lo escrito sigue en pantalla;
//   3. se puede reintentar (el botón sigue disponible o hay botón de reintento);
//   4. al volver la red, el registro se guarda;
//   5. en el servidor queda UN solo registro con el prefijo (sin duplicados).
const { test, expect } = require('@playwright/test');
const { cfg, PREFIJO: BASE_PREFIJO, conCredenciales, sesionAPI, ingresoUI, guardar } = require('./lib');

const pr = cfg.perdidaRed;

test('R4 pérdida de red al guardar', async ({ page, context }) => {
  // Prefijo único de esta corrida: otras pruebas usan el mismo prefijo base y no deben contarse como duplicados.
  const PREFIJO = `${BASE_PREFIJO}R4-${Date.now().toString(36)}-`;
  test.skip(!pr, 'Falta la sección perdidaRed en config.json');
  test.skip(!conCredenciales(pr.rol), `Falta PASS_${pr.rol.toUpperCase()}`);
  const resultado = { prefijo: PREFIJO, condiciones: {}, eventos: [] };
  const ev = (que, extra = {}) => resultado.eventos.push({ at: new Date().toISOString(), que, ...extra });
  page.on('requestfailed', (req) => { if (new URL(req.url()).pathname.startsWith('/api/')) ev('petición fallida', { metodo: req.method(), ruta: new URL(req.url()).pathname, error: req.failure()?.errorText }); });

  await ingresoUI(page, pr.rol);
  await page.waitForLoadState('networkidle');
  await page.goto(pr.ruta);
  for (const paso of pr.abrir || []) await page.getByRole('button', { name: paso }).click();
  const valores = pr.campos.map((c) => ({ ...c, valor: c.valor.replace('{prefijo}', PREFIJO) }));
  for (const c of valores) await page.getByLabel(c.etiqueta, { exact: false }).fill(c.valor);

  // Se corta la red y se intenta guardar.
  await context.setOffline(true); ev('red cortada');
  await page.getByRole('button', { name: pr.boton }).click().catch((e) => ev('clic falló', { e: String(e).slice(0, 120) }));
  await page.waitForTimeout(4000);

  const aviso = await page.locator('[role="alert"],[role="status"],[aria-live]').filter({ hasText: new RegExp(pr.textoAviso, 'i') }).count()
    + await page.getByText(new RegExp(pr.textoAviso, 'i')).count();
  resultado.condiciones['1_aviso_visible'] = aviso > 0;
  let conservados = true;
  for (const c of valores) {
    const v = await page.getByLabel(c.etiqueta, { exact: false }).inputValue().catch(() => null);
    if (v !== c.valor) conservados = false;
  }
  resultado.condiciones['2_datos_conservados'] = conservados;
  const boton = page.getByRole('button', { name: new RegExp(`${pr.boton}|reintentar`, 'i') }).first();
  resultado.condiciones['3_reintento_posible'] = await boton.isEnabled().catch(() => false);

  // Vuelve la red y se reintenta.
  await context.setOffline(false); ev('red restablecida');
  if (resultado.condiciones['3_reintento_posible']) await boton.click().catch(() => {});
  await page.waitForTimeout(6000);

  // Verificación en el servidor.
  const api = await sesionAPI(pr.rol);
  const res = await api.get(pr.busqueda.ruta.replace('{prefijo}', encodeURIComponent(PREFIJO)));
  const j = await res.json().catch(() => ({}));
  const lista = (pr.busqueda.lista ? j[pr.busqueda.lista] : j) || [];
  const mios = (Array.isArray(lista) ? lista : []).filter((x) => String(x[pr.busqueda.campoNombre] || '').includes(PREFIJO));
  await api.dispose();
  resultado.condiciones['4_guardado_al_volver'] = mios.length >= 1;
  resultado.condiciones['5_sin_duplicados'] = mios.length === 1;
  resultado.registros_encontrados = mios.length;

  guardar(`perdida_red_${Date.now()}.json`, resultado);
  const fallan = Object.entries(resultado.condiciones).filter(([, v]) => !v).map(([k]) => k);
  expect(fallan, 'condiciones que no se cumplen').toEqual([]);
});
