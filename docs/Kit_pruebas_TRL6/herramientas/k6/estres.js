// C4 (a) · Estrés: sube por escalones hasta VUS_MAX para encontrar el punto de quiebre.
// k6 run -e CFG=k6.config.json -e BASE_URL=... -e VUS_MAX=<4 × objetivo> -e PASS_<ROL>=... --summary-export=estres_resumen.json --out csv=estres_series.csv estres.js
// El punto de quiebre se lee en estres_series.csv: el primer escalón con p95 >= 2 s o errores >= 1 %.
// Los umbrales aquí NO detienen la prueba (abortOnFail: false): se quiere ver hasta dónde llega.
import exec from 'k6/execution';
import { sleep } from 'k6';
import { construirSlots, ingresar, vuelta } from './comun.js';

const MAX = Number(__ENV.VUS_MAX || 200);
const PASOS = 8;
const SLOTS = construirSlots(MAX);
const stages = [];
for (let i = 1; i <= PASOS; i += 1) {
  const t = Math.round((MAX * i) / PASOS);
  stages.push({ duration: '1m', target: t }, { duration: '2m', target: t });
}
stages.push({ duration: '2m', target: 0 });

export const options = {
  stages,
  thresholds: { http_req_duration: [{ threshold: 'p(95)<2000', abortOnFail: false }], http_req_failed: [{ threshold: 'rate<0.01', abortOnFail: false }] },
  noCookiesReset: true,
};

let rol = null; let cab = null;
export default function () {
  if (!rol) rol = SLOTS[(exec.vu.idInTest - 1) % SLOTS.length];
  if (!cab) { cab = ingresar(rol); if (!cab) { sleep(5); return; } }
  if (!vuelta(rol, cab)) cab = null;
}
