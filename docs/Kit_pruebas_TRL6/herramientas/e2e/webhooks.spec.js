// C5 · S13: integraciones autenticadas. Cada webhook o servicio interno EN USO se llama sin secreto,
// con uno incorrecto y con el correcto (de la variable de entorno indicada). El caso positivo es obligatorio.
// Dos modos por webhook (sección webhooks de config.json):
//   - secreto en cabecera: { "cabecera": "x-secreto", "variableSecreto": "SECRETO_X" }
//   - firma HMAC del cuerpo: { "cabecera": "x-hub-signature-256", "variableSecreto": "APP_SECRET_X",
//                              "firma": { "algoritmo": "sha256", "prefijo": "sha256=" } }
const crypto = require('crypto');
const { test, expect, request: pwRequest } = require('@playwright/test');
const { cfg, guardar } = require('./lib');

for (const w of (cfg.webhooks && cfg.webhooks.lista) || []) {
  test(`S13 ${w.nombre} exige secreto o firma`, async () => {
    const secreto = process.env[w.variableSecreto];
    expect(secreto, `Falta ${w.variableSecreto}: el caso positivo de S13 es obligatorio`).toBeTruthy();
    const cuerpo = JSON.stringify(w.cuerpo || {});
    const valor = (clave, texto = cuerpo) => (w.firma
      ? (w.firma.prefijo || '') + crypto.createHmac(w.firma.algoritmo || 'sha256', clave).update(texto).digest('hex')
      : clave);
    const ctx = await pwRequest.newContext();
    const llamar = async (cab, data = cuerpo) => (await ctx.fetch(w.url, {
      method: w.metodo || 'POST', headers: { 'content-type': 'application/json', ...cab }, data,
    })).status();
    const r = {
      nombre: w.nombre,
      modo: w.firma ? 'firma HMAC' : 'secreto en cabecera',
      sinSecreto: await llamar({}),
      secretoIncorrecto: await llamar({ [w.cabecera]: valor('secreto-incorrecto-' + Date.now()) }),
      cuerpoAlterado: w.firma ? await llamar({ [w.cabecera]: valor(secreto) }, cuerpo.replace(/}$/, ',"alterado":true}')) : null,
      secretoCorrecto: await llamar({ [w.cabecera]: valor(secreto) }),
    };
    await ctx.dispose();
    guardar(`S13_${w.nombre.replace(/\W+/g, '_')}_${Date.now()}.json`, r);
    expect([401, 403], 'sin secreto').toContain(r.sinSecreto);
    expect([401, 403], 'con secreto o firma incorrectos').toContain(r.secretoIncorrecto);
    if (w.firma) expect([401, 403], 'con el cuerpo alterado').toContain(r.cuerpoAlterado);
    expect(r.secretoCorrecto, 'con el secreto o la firma correctos funciona').toBeLessThan(400);
  });
}
