// Utilidades comunes de las pruebas. Lee config.json (o la ruta en CFG) y las claves de PASS_<ROL>.
const fs = require('fs');
const path = require('path');
const { request: pwRequest, expect } = require('@playwright/test');

const CFG_PATH = process.env.CFG || path.join(__dirname, 'config.json');
if (!fs.existsSync(CFG_PATH)) throw new Error(`No existe ${CFG_PATH}. Copie config.ejemplo.json a config.json y llénelo.`);
const cfg = JSON.parse(fs.readFileSync(CFG_PATH, 'utf8'));

const BASE_URL = process.env.BASE_URL;
const API_URL = process.env.API_URL || BASE_URL;
if (!BASE_URL) throw new Error('Falta BASE_URL.');

const SUFIJO = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
const PREFIJO = process.env.TRL_PREFIX || `TRL-QA-${SUFIJO}-`;
const EFECTOS = process.env.E2E_EFECTOS === '1';

const programHeaders = () => {
  const h = { ...((cfg.ingreso && cfg.ingreso.api && cfg.ingreso.api.headers) || {}) };
  if (cfg.programId && !h['x-program-id']) h['x-program-id'] = cfg.programId;
  return h;
};

const rol = (id) => {
  const r = cfg.roles.find((x) => x.id === id);
  if (!r) throw new Error(`Rol ${id} no está en config.json`);
  return { ...r, pass: process.env[`PASS_${id.toUpperCase()}`] };
};
const conCredenciales = (id) => { try { const r = rol(id); return Boolean(r.email && r.pass); } catch { return false; } };
const plantilla = (obj, vars) => JSON.parse(JSON.stringify(obj).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`)));

/** Contexto de API con la sesión del rol (cookie o bearer, según config). */
async function sesionAPI(id) {
  const r = rol(id);
  const ing = cfg.ingreso.api;
  const headers = programHeaders();
  const ctx = await pwRequest.newContext({ baseURL: API_URL, extraHTTPHeaders: headers });
  const res = await ctx.post(ing.ruta, { data: plantilla(ing.cuerpo, { email: r.email, password: r.pass }) });
  expect(res.ok(), `ingreso por API del rol ${id} (HTTP ${res.status()})`).toBeTruthy();
  if (ing.sesion === 'bearer') {
    const token = (await res.json())[ing.campoToken || 'token'];
    await ctx.dispose();
    return pwRequest.newContext({ baseURL: API_URL, extraHTTPHeaders: { ...headers, Authorization: `Bearer ${token}` } });
  }
  // Cookie: en http la cookie Secure no se reenvía sola; se pasa como cabecera.
  const sc = res.headers()['set-cookie'] || '';
  const m = sc.match(new RegExp(`${ing.nombreCookie || '[^=;\\s]+'}=([^;]+)`));
  if (m && !API_URL.startsWith('https')) {
    await ctx.dispose();
    return pwRequest.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: { ...headers, Cookie: `${ing.nombreCookie}=${m[1]}` },
    });
  }
  return ctx;
}

/** Ingreso por la pantalla. */
async function ingresoUI(page, id) {
  const r = rol(id); const ui = cfg.ingreso.ui;
  await page.goto(ui.ruta);
  await page.getByLabel(ui.etiquetaCorreo, { exact: false }).fill(r.email);
  await page.getByLabel(ui.etiquetaClave, { exact: false }).fill(r.pass);
  await page.getByRole('button', { name: ui.boton }).click();
}

// Con EVIDENCIA=<carpeta evidencia/ del kit>, cada resultado va solo a su subcarpeta.
// Con EVID_DIR=<carpeta>, todo va a esa carpeta. Sin ninguna, a herramientas/e2e/salida/.
const DESTINO = [
  [/^salud_/, '00_version'],
  [/^creados_/, '01_integracion'],
  [/^(S\d+_|matriz_)/, '05_seguridad'],
  [/^INTEGRACIONES_/, '06_interoperabilidad'],
  [/^perdida_red_/, path.join('07_resiliencia', 'R4_perdida_red')],
];
function carpeta(nombre) {
  if (process.env.EVIDENCIA) {
    const d = DESTINO.find(([re]) => re.test(nombre));
    return path.join(process.env.EVIDENCIA, d ? d[1] : 'otros');
  }
  return process.env.EVID_DIR || path.join(__dirname, 'salida');
}
function guardar(nombre, datos) {
  const dir = carpeta(nombre);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, nombre), JSON.stringify(datos, null, 2));
}
function carpetaCapturas() {
  if (process.env.EVIDENCIA) return path.join(process.env.EVIDENCIA, 'capturas');
  return path.join(process.env.EVID_DIR || path.join(__dirname, 'salida'), 'capturas');
}

module.exports = { cfg, BASE_URL, API_URL, PREFIJO, EFECTOS, rol, conCredenciales, sesionAPI, ingresoUI, plantilla, guardar, carpetaCapturas, programHeaders };
