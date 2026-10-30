// C5 · S2, S4 y S5: matriz rol × recurso. Compara el estado HTTP real con el esperado de matriz-acceso.json.
const fs = require('fs');
const path = require('path');
const { test, expect, request: pwRequest } = require('@playwright/test');
const { API_URL, PREFIJO, conCredenciales, sesionAPI, plantilla, guardar, programHeaders } = require('./lib');

const matriz = JSON.parse(fs.readFileSync(process.env.MATRIZ || path.join(__dirname, 'matriz-acceso.json'), 'utf8'));
const roles = [...new Set(matriz.filas.flatMap((f) => Object.keys(f.esperado)))];

for (const r of roles) {
  test(`S2 matriz de acceso · ${r}`, async () => {
    test.skip(r !== 'anonimo' && !conCredenciales(r), `Falta PASS_${r.toUpperCase()}`);
    const ctx = r === 'anonimo'
      ? await pwRequest.newContext({ baseURL: API_URL, extraHTTPHeaders: programHeaders() })
      : await sesionAPI(r);
    const resultados = [];
    for (const f of matriz.filas) {
      if (!(r in f.esperado)) continue;
      const opts = f.cuerpo ? { data: plantilla(f.cuerpo, { prefijo: PREFIJO }) } : {};
      const res = await ctx.fetch(f.ruta, { method: f.metodo, ...opts });
      resultados.push({ rol: r, metodo: f.metodo, ruta: f.ruta, esperado: f.esperado[r], real: res.status(), ok: res.status() === f.esperado[r] });
    }
    await ctx.dispose();
    guardar(`matriz_${r}_${Date.now()}.json`, resultados);
    const diferencias = resultados.filter((x) => !x.ok).map((x) => `${x.metodo} ${x.ruta}: esperado ${x.esperado}, real ${x.real}`);
    expect(diferencias, `diferencias para ${r}`).toEqual([]);
  });
}
