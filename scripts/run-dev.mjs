/**
 * Arranca una instancia del núcleo leyendo UN solo .env.
 *
 *   node scripts/run-dev.mjs parienta   → :4000 / nucleo_parienta (o PARIENTA_MONGODB_DB)
 *   node scripts/run-dev.mjs plateado   → alias de parienta (compat)
 *   node scripts/run-dev.mjs nara       → :4100 / DB nara (Atlas)
 *
 * En .env: variables compartidas + prefijos PARIENTA_* (o PLATEADO_* legado) y NARA_*.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
let program = String(process.argv[2] || "").trim();
if (program === "plateado") program = "parienta";

const DEFAULTS = {
  parienta: {
    PROGRAM_ID: "parienta",
    MONGODB_DB: "nucleo_parienta",
    GATEWAY_PORT: "4000",
    AUTH_PORT: "4001",
    PEOPLE_PORT: "4002",
    OPS_PORT: "4003",
    AI_PORT: "4004",
    CORS_ORIGIN: "http://localhost:3003,http://127.0.0.1:3003",
    AUTH_SECRET: "dev-auth-secret-parienta-change-me",
    prefix: "PARIENTA",
    legacyPrefix: "PLATEADO",
  },
  nara: {
    PROGRAM_ID: "nara",
    MONGODB_DB: "nara",
    GATEWAY_PORT: "4100",
    AUTH_PORT: "4101",
    PEOPLE_PORT: "4102",
    OPS_PORT: "4103",
    AI_PORT: "4104",
    CORS_ORIGIN:
      "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3002,http://127.0.0.1:3002",
    AUTH_SECRET: "dev-auth-secret-nara-change-me",
    prefix: "NARA",
  },
};

if (!DEFAULTS[program]) {
  console.error("Uso: node scripts/run-dev.mjs <parienta|nara>");
  process.exit(1);
}

function parseEnvFile(path) {
  const out = {};
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

function pick(obj, keys) {
  const o = {};
  for (const k of keys) {
    if (obj[k] != null && String(obj[k]).trim() !== "") o[k] = obj[k];
  }
  return o;
}

function pref(file, prefix, key) {
  return file[`${prefix}_${key}`];
}

const d = DEFAULTS[program];
const file = parseEnvFile(resolve(root, ".env"));
const p = d.prefix;
const legacy = d.legacyPrefix || null;
const pref2 = (key) => pref(file, p, key) || (legacy ? pref(file, legacy, key) : undefined);

const gateway = pref2("GATEWAY_PORT") || d.GATEWAY_PORT;
const auth = pref2("AUTH_PORT") || d.AUTH_PORT;
const people = pref2("PEOPLE_PORT") || d.PEOPLE_PORT;
const ops = pref2("OPS_PORT") || d.OPS_PORT;
const ai = pref2("AI_PORT") || d.AI_PORT;

const mongodbUri =
  pref2("MONGODB_URI") || file.MONGODB_URI || "";
const mongodbDb =
  pref2("MONGODB_DB") ||
  file[`MONGODB_DB_${p}`] ||
  (legacy ? file[`MONGODB_DB_${legacy}`] : undefined) ||
  d.MONGODB_DB;

const env = {
  ...process.env,
  ...pick(file, [
    "GEMINI_API_KEY",
    "GEMINI_MODEL",
    "OPENAI_API_KEY",
    "OPENAI_MODEL",
    "N8N_TEO_WEBHOOK",
    "N8N_WEBHOOK_SECRET",
    "ACCESS_LOG_EMAIL_SALT",
    "ACCESS_ALERT_WEBHOOK",
    "ACCESS_ALERT_EMAIL",
    "ACCESS_ALERT_EMAIL_WEBHOOK",
  ]),
  PROGRAM_ID: d.PROGRAM_ID,
  MONGODB_URI: mongodbUri,
  MONGODB_DB: mongodbDb,
  AUTH_SECRET:
    pref2("AUTH_SECRET") || file[`AUTH_SECRET_${p}`] || d.AUTH_SECRET,
  CORS_ORIGIN: pref2("CORS_ORIGIN") || d.CORS_ORIGIN,
  PORT: gateway,
  NARA_GATEWAY_PORT: gateway,
  NARA_AUTH_PORT: auth,
  NARA_PEOPLE_PORT: people,
  NARA_OPS_PORT: ops,
  NARA_AI_PORT: ai,
  NUCLEO_PORTS: [gateway, auth, people, ops, ai].join(","),
  NARA_MS_HOST: file.NARA_MS_HOST || "127.0.0.1",
};

if (!env.MONGODB_URI) {
  console.error("[run-dev] Falta MONGODB_URI en .env");
  process.exit(1);
}

console.log(
  `[run-dev] programa=${env.PROGRAM_ID} gateway=:${env.PORT} db=${env.MONGODB_DB}`,
);

const child = spawn("npm", ["run", "start:dev:stack"], {
  cwd: root,
  env,
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));
