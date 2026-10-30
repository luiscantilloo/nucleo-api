// C3 · Carga: concurrencia objetivo con la mezcla de roles. Perfil fijo: 40 % (2 + 5 min), 100 % (2 + 5 min), bajada (2 min).
// k6 run -e CFG=k6.config.json -e BASE_URL=... -e VUS_OBJETIVO=<n> -e PASS_<ROL>=... --summary-export=resumen.json --out csv=series.csv carga.js
// ESCALONES_CORTOS=1 -> 1 min subida, 3 min meseta, 1 min bajada (para la recuperación después del estrés).
import exec from 'k6/execution';
import { sleep } from 'k6';
import { UMBRALES, construirSlots, ingresar, vuelta } from './comun.js';

const OBJETIVO = Number(__ENV.VUS_OBJETIVO || 50);
const CORTO = __ENV.ESCALONES_CORTOS === '1';
const medio = Math.max(1, Math.round(OBJETIVO * 0.4));
const SLOTS = construirSlots(OBJETIVO);

export const options = {
  stages: CORTO
    ? [{ duration: '1m', target: OBJETIVO }, { duration: '3m', target: OBJETIVO }, { duration: '1m', target: 0 }]
    : [{ duration: '2m', target: medio }, { duration: '5m', target: medio }, { duration: '2m', target: OBJETIVO }, { duration: '5m', target: OBJETIVO }, { duration: '2m', target: 0 }],
  thresholds: UMBRALES,
  noCookiesReset: true, // conserva la cookie de sesión entre vueltas
};

let rol = null; let cab = null;
export default function () {
  if (!rol) rol = SLOTS[(exec.vu.idInTest - 1) % SLOTS.length];
  if (!cab) { cab = ingresar(rol); if (!cab) { sleep(5); return; } }
  if (!vuelta(rol, cab)) cab = null;
}
