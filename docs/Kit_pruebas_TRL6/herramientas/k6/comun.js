// Funciones comunes de los scripts k6. Configuración en el JSON de -e CFG=... y claves en -e PASS_<ROL>=...
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import exec from 'k6/execution';
import { Rate, Counter, Trend } from 'k6/metrics';

export const BASE_URL = (__ENV.API_URL || __ENV.BASE_URL || '').replace(/\/$/, '');
const CFG_PATH = __ENV.CFG || './k6.config.json';
export const cfg = JSON.parse(open(CFG_PATH));
if (!BASE_URL) throw new Error('Falta BASE_URL (o API_URL).');

const programHeaders = () => {
  const h = { ...(cfg.headers || {}) };
  if (cfg.programId && !h['x-program-id']) h['x-program-id'] = cfg.programId;
  if (cfg.ingreso && cfg.ingreso.headers) Object.assign(h, cfg.ingreso.headers);
  return h;
};

export const tasaError = new Rate('tasa_error');
export const tiempoIngreso = new Trend('tiempo_ingreso', true);
const mitigadas = new Counter('respuestas_mitigadas');

export const UMBRALES = {
  http_req_duration: ['p(95)<2000'],
  http_req_failed: ['rate<0.01'],
  tasa_error: ['rate<0.01'],
};

/** Reparte los usuarios virtuales entre roles según su peso, intercalados. */
export function construirSlots(n) {
  const roles = Object.keys(cfg.roles).filter((r) => (cfg.roles[r].peso || 0) > 0);
  const total = roles.reduce((s, r) => s + cfg.roles[r].peso, 0);
  const meta = Object.fromEntries(roles.map((r) => [r, cfg.roles[r].peso / total]));
  const asignados = Object.fromEntries(roles.map((r) => [r, 0]));
  const slots = [];
  for (let i = 0; i < n; i += 1) {
    let mejor = roles[0]; let menor = Infinity;
    for (const r of roles) { const x = asignados[r] / meta[r]; if (x < menor) { menor = x; mejor = r; } }
    slots.push(mejor); asignados[mejor] += 1;
  }
  return slots;
}

function revisarMitigacion(res) {
  for (const h of cfg.cabecerasDeMitigacion || []) {
    const v = res.headers[h] || res.headers[h.toLowerCase()] || res.headers[h.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('-')];
    if (v) {
      mitigadas.add(1);
      console.error(`El proveedor está mitigando el tráfico (${h}) en ${res.request.url}; se detiene k6`);
      exec.test.abort('Tráfico mitigado por el proveedor de hosting');
    }
  }
}

const plantilla = (obj, vars) => JSON.parse(JSON.stringify(obj).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`)));

/** Inicia sesión una vez por usuario virtual. Devuelve las cabeceras de la sesión (cookie o bearer). */
export function ingresar(rol) {
  const r = cfg.roles[rol];
  const pass = __ENV[`PASS_${rol.toUpperCase()}`];
  if (!pass) throw new Error(`Falta -e PASS_${rol.toUpperCase()}`);
  const ing = cfg.ingreso;
  const baseH = { 'Content-Type': 'application/json', ...programHeaders() };
  const res = http.post(
    `${BASE_URL}${ing.ruta}`,
    JSON.stringify(plantilla(ing.cuerpo, { email: r.email, password: pass })),
    { headers: baseH, tags: { rol, ruta: ing.ruta } },
  );
  revisarMitigacion(res);
  tiempoIngreso.add(res.timings.duration, { rol });
  const ok = check(res, { 'ingreso 2xx': (x) => x.status >= 200 && x.status < 300 }, { rol });
  tasaError.add(!ok, { rol });
  if (!ok) { console.warn(`ingreso falló rol=${rol} http=${res.status}`); return null; }
  if (ing.sesion === 'bearer') {
    let token = null; try { token = res.json(ing.campoToken || 'token'); } catch (e) { token = null; }
    return token ? { ...programHeaders(), Authorization: `Bearer ${token}` } : null;
  }
  const sc = res.headers['Set-Cookie'] || res.headers['set-cookie'] || '';
  const nombre = ing.nombreCookie || 'nara_sid';
  const m = String(sc).match(new RegExp(`${nombre}=([^;]+)`));
  if (m) return { ...programHeaders(), Cookie: `${nombre}=${m[1]}` };
  return { ...programHeaders() };
}

/** Una vuelta de lecturas del rol. Devuelve false si la sesión venció (401). */
export function vuelta(rol, cabeceras) {
  let viva = true;
  group(`lecturas_${rol}`, () => {
    for (const ruta of cfg.roles[rol].rutas) {
      const res = http.get(`${BASE_URL}${ruta}`, {
        headers: { ...programHeaders(), ...(cabeceras || {}) },
        tags: { rol, ruta },
      });
      revisarMitigacion(res);
      const ok = check(res, { [`${ruta} 200`]: (x) => x.status === 200 }, { rol });
      tasaError.add(!ok, { rol, ruta });
      if (res.status === 401) viva = false;
      sleep(1);
    }
  });
  sleep(Math.random() * 3 + 1);
  return viva;
}
