/**
 * Arranque producción (Render u otro host): un proceso con gateway + microservicios.
 *
 * En el panel (env flat, sin prefijos PLATEADO_/PARIENTA_):
 *   PROGRAM_ID=parienta
 *   MONGODB_URI=...
 *   MONGODB_DB=nucleo_parienta
 *   AUTH_SECRET=...
 *   CORS_ORIGIN=https://tu-parienta.vercel.app
 *   PORT   ← lo inyecta Render; el gateway escucha ahí (0.0.0.0)
 *
 * Auth/people/ops/ai quedan en 127.0.0.1:4001–4004 dentro del mismo contenedor.
 *
 * Uso: npm run build && npm run start:prod
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const programId = String(process.env.PROGRAM_ID || "parienta").trim() || "parienta";

if (!process.env.MONGODB_URI) {
  console.error("[start-prod] Falta MONGODB_URI");
  process.exit(1);
}
if (!process.env.AUTH_SECRET && !process.env.NARA_AUTH_SECRET) {
  console.error("[start-prod] Falta AUTH_SECRET");
  process.exit(1);
}
const crisis = resolve(root, "programs", programId, "crisis.json");
if (!existsSync(crisis)) {
  console.error(`[start-prod] No está programs/${programId}/crisis.json (cwd debe ser la raíz del repo)`);
  process.exit(1);
}

const gateway = String(process.env.PORT || process.env.NARA_GATEWAY_PORT || "4000");
const auth = String(process.env.NARA_AUTH_PORT || "4001");
const people = String(process.env.NARA_PEOPLE_PORT || "4002");
const ops = String(process.env.NARA_OPS_PORT || "4003");
const ai = String(process.env.NARA_AI_PORT || "4004");

const env = {
  ...process.env,
  PROGRAM_ID: programId,
  MONGODB_DB: process.env.MONGODB_DB || (programId === "nara" ? "nara" : "nucleo_parienta"),
  AUTH_SECRET: process.env.AUTH_SECRET || process.env.NARA_AUTH_SECRET,
  PORT: gateway,
  NARA_GATEWAY_PORT: gateway,
  NARA_AUTH_PORT: auth,
  NARA_PEOPLE_PORT: people,
  NARA_OPS_PORT: ops,
  NARA_AI_PORT: ai,
  NARA_MS_HOST: process.env.NARA_MS_HOST || "127.0.0.1",
};

console.log(
  `[start-prod] PROGRAM_ID=${env.PROGRAM_ID} gateway=:${gateway} db=${env.MONGODB_DB} ms=${env.NARA_MS_HOST}:${auth}-${ai}`,
);

const child = spawn("npm", ["run", "start:prod:all"], {
  cwd: root,
  env,
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));
