// C5 · S6: límite de intentos de ingreso. BLOQUEA la cuenta de la sección bloqueo de config.json:
// use una cuenta creada solo para esto (NO la ponga en 'roles'). Clave en PASS_BLOQUEO. Se corre con BLOQUEO=1.
const { test, expect, request: pwRequest } = require('@playwright/test');
const { cfg, API_URL, plantilla, guardar, programHeaders } = require('./lib');

test('S6 bloqueo por intentos fallidos', async () => {
  const b = cfg.bloqueo;
  test.skip(!b || process.env.BLOQUEO !== '1', 'Bloquea una cuenta: correr con BLOQUEO=1 y una cuenta dedicada');
  const r = { email: b.email, pass: process.env.PASS_BLOQUEO };
  test.skip(!r.email || !r.pass, 'Falta bloqueo.email en config.json o PASS_BLOQUEO');
  const ing = cfg.ingreso.api;
  const ctx = await pwRequest.newContext({ baseURL: API_URL, extraHTTPHeaders: programHeaders() });
  const intentos = [];
  for (let i = 1; i <= b.intentos; i += 1) {
    const res = await ctx.post(ing.ruta, { data: plantilla(ing.cuerpo, { email: r.email, password: `incorrecta-${i}-${Date.now()}` }) });
    intentos.push({ intento: i, estado: res.status(), mensaje: (await res.text()).slice(0, 120) });
  }
  // Con la clave correcta: debe seguir bloqueada.
  const correcta = await ctx.post(ing.ruta, { data: plantilla(ing.cuerpo, { email: r.email, password: r.pass }) });
  const textoCorrecta = (await correcta.text()).slice(0, 160);
  // Con un correo inexistente: el mensaje debe ser genérico (no revelar si la cuenta existe).
  const inexistente = await ctx.post(ing.ruta, { data: plantilla(ing.cuerpo, { email: `no-existe-${Date.now()}@ejemplo.invalid`, password: 'x' }) });
  await ctx.dispose();
  const resultado = { intentos, conClaveCorrecta: { estado: correcta.status(), mensaje: textoCorrecta }, correoInexistente: inexistente.status() };
  guardar(`S6_bloqueo_${Date.now()}.json`, resultado);
  expect(correcta.ok(), 'después de los intentos fallidos, la clave correcta NO debe entrar').toBe(false);
  expect(new RegExp(b.textoBloqueo, 'i').test(textoCorrecta) || correcta.status() === 429 || correcta.status() === 423, 'mensaje o estado de bloqueo').toBeTruthy();
});
