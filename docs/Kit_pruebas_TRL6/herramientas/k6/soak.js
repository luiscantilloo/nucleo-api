// C4 (b) · Soak: carga sostenida con un rol (cfg.soak.rol) durante DURACION (mínimo 2h).
// k6 run -e CFG=k6.config.json -e BASE_URL=... -e VUS_SOAK=<≈30 % del objetivo> -e DURACION=2h -e PASS_<ROL>=... --summary-export=soak_resumen.json --out csv=soak_series.csv soak.js
// La degradación se calcula con degradacion.js sobre soak_series.csv (p95 de la primera hora frente a la última).
import { sleep } from 'k6';
import { UMBRALES, cfg, ingresar, vuelta } from './comun.js';

const VUS = Number(__ENV.VUS_SOAK || 20);
const DURACION = __ENV.DURACION || '2h';
const ROL = (cfg.soak && cfg.soak.rol) || Object.keys(cfg.roles)[0];

export const options = {
  stages: [{ duration: '5m', target: VUS }, { duration: DURACION, target: VUS }, { duration: '2m', target: 0 }],
  thresholds: UMBRALES,
  noCookiesReset: true,
};

let cab = null;
export default function () {
  if (!cab) { cab = ingresar(ROL); if (!cab) { sleep(5); return; } }
  if (!vuelta(ROL, cab)) cab = null;
}
