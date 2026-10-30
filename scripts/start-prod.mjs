/**
 * Producción Render — UN servicio, DOS programas (dos Mongo).
 *
 * Env en Render (ejemplo completo: deploy/RENDER-UNICO.env.example):
 *   PARIENTA_MONGODB_URI / PARIENTA_MONGODB_DB / PARIENTA_AUTH_SECRET / PARIENTA_CORS_ORIGIN
 *   NARA_MONGODB_URI / NARA_MONGODB_DB / NARA_AUTH_SECRET / NARA_CORS_ORIGIN
 *   (+ keys IA compartidas)
 *   PORT ← Render
 *
 * Arranca:
 *   - stack Parienta en :4000 (+ MS 4001–4004)
 *   - stack NARA en :4100 (+ MS 4101–4104)
 *   - proxy público en $PORT que enruta por x-program-id (fronts ya lo envían)
 *
 * Compat: si solo hay MONGODB_URI + PROGRAM_ID, arranca un solo programa (modo legacy).
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function pref(...keys) {
  for (const k of keys) {
    const v = process.env[k];
    if (v != null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

function hasCrisis(programId) {
  return existsSync(resolve(root, "programs", programId, "crisis.json"));
}

const parientaUri = pref(
  "PARIENTA_MONGODB_URI",
  "PLATEADO_MONGODB_URI",
);
const naraUri = pref("NARA_MONGODB_URI");

const dual = !!(parientaUri && naraUri);

/** Modo un solo programa (legacy / debug). */
function startSingle() {
  const programId = pref("PROGRAM_ID") || "parienta";
  const uri = pref("MONGODB_URI") || (programId === "nara" ? naraUri : parientaUri);
  if (!uri) {
    console.error(
      "[start-prod] Falta Mongo. Dual: PARIENTA_MONGODB_URI + NARA_MONGODB_URI. O legacy: MONGODB_URI + PROGRAM_ID.",
    );
    process.exit(1);
  }
  if (!hasCrisis(programId)) {
    console.error(`[start-prod] No está programs/${programId}/crisis.json`);
    process.exit(1);
  }
  const gateway = pref("PORT", "NARA_GATEWAY_PORT") || "4000";
  const env = {
    ...process.env,
    PROGRAM_ID: programId,
    MONGODB_URI: uri,
    MONGODB_DB:
      pref("MONGODB_DB") ||
      (programId === "nara"
        ? pref("NARA_MONGODB_DB") || "nara"
        : pref("PARIENTA_MONGODB_DB", "PLATEADO_MONGODB_DB") || "nucleo_parienta"),
    AUTH_SECRET:
      pref("AUTH_SECRET") ||
      (programId === "nara"
        ? pref("NARA_AUTH_SECRET")
        : pref("PARIENTA_AUTH_SECRET", "PLATEADO_AUTH_SECRET")),
    CORS_ORIGIN:
      pref("CORS_ORIGIN") ||
      (programId === "nara"
        ? pref("NARA_CORS_ORIGIN")
        : pref("PARIENTA_CORS_ORIGIN", "PLATEADO_CORS_ORIGIN")),
    PORT: gateway,
    NARA_GATEWAY_PORT: gateway,
    NARA_AUTH_PORT: pref("NARA_AUTH_PORT") || "4001",
    NARA_PEOPLE_PORT: pref("NARA_PEOPLE_PORT") || "4002",
    NARA_OPS_PORT: pref("NARA_OPS_PORT") || "4003",
    NARA_AI_PORT: pref("NARA_AI_PORT") || "4004",
    NARA_MS_HOST: pref("NARA_MS_HOST") || "127.0.0.1",
  };
  if (!env.AUTH_SECRET) {
    console.error("[start-prod] Falta AUTH_SECRET");
    process.exit(1);
  }
  console.log(`[start-prod] modo=single PROGRAM_ID=${programId} gateway=:${gateway}`);
  const child = spawn("npm", ["run", "start:prod:all"], {
    cwd: root,
    env,
    stdio: "inherit",
    shell: true,
  });
  child.on("exit", (c) => process.exit(c ?? 0));
}

function startStack(label, env) {
  console.log(
    `[start-prod] stack=${label} PROGRAM_ID=${env.PROGRAM_ID} gateway=:${env.PORT} db=${env.MONGODB_DB}`,
  );
  return spawn("npm", ["run", "start:prod:all"], {
    cwd: root,
    env: { ...process.env, ...env },
    stdio: "inherit",
    shell: true,
  });
}

function startDual() {
  if (!hasCrisis("parienta") || !hasCrisis("nara")) {
    console.error("[start-prod] Faltan programs/parienta o programs/nara");
    process.exit(1);
  }
  const shared = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    N8N_TEO_WEBHOOK: process.env.N8N_TEO_WEBHOOK,
    N8N_WEBHOOK_SECRET: process.env.N8N_WEBHOOK_SECRET,
    NARA_MS_HOST: "127.0.0.1",
    AUTH_ALLOW_LEGACY_TOKENS: process.env.AUTH_ALLOW_LEGACY_TOKENS || "0",
  };

  const parientaAuth =
    pref("PARIENTA_AUTH_SECRET", "PLATEADO_AUTH_SECRET") || pref("AUTH_SECRET");
  const naraAuth = pref("NARA_AUTH_SECRET") || pref("AUTH_SECRET");
  if (!parientaAuth || !naraAuth) {
    console.error("[start-prod] Faltan PARIENTA_AUTH_SECRET y/o NARA_AUTH_SECRET");
    process.exit(1);
  }

  const parienta = startStack("parienta", {
    ...shared,
    PROGRAM_ID: "parienta",
    MONGODB_URI: parientaUri,
    MONGODB_DB: pref("PARIENTA_MONGODB_DB", "PLATEADO_MONGODB_DB") || "nucleo_parienta",
    AUTH_SECRET: parientaAuth,
    CORS_ORIGIN:
      pref("PARIENTA_CORS_ORIGIN", "PLATEADO_CORS_ORIGIN") ||
      "http://localhost:3003",
    PORT: "4000",
    NARA_GATEWAY_PORT: "4000",
    NARA_AUTH_PORT: "4001",
    NARA_PEOPLE_PORT: "4002",
    NARA_OPS_PORT: "4003",
    NARA_AI_PORT: "4004",
  });

  const nara = startStack("nara", {
    ...shared,
    PROGRAM_ID: "nara",
    MONGODB_URI: naraUri,
    MONGODB_DB: pref("NARA_MONGODB_DB") || "nara",
    AUTH_SECRET: naraAuth,
    CORS_ORIGIN:
      pref("NARA_CORS_ORIGIN") ||
      "http://localhost:3000,http://localhost:3002",
    PORT: "4100",
    NARA_GATEWAY_PORT: "4100",
    NARA_AUTH_PORT: "4101",
    NARA_PEOPLE_PORT: "4102",
    NARA_OPS_PORT: "4103",
    NARA_AI_PORT: "4104",
  });

  // Esperar un poco a que suban los gateways internos antes del proxy.
  const proxy = spawn("node", ["scripts/nucleo-proxy.mjs"], {
    cwd: root,
    env: {
      ...process.env,
      PORT: pref("PORT") || "10000",
      PARIENTA_INTERNAL_PORT: "4000",
      NARA_INTERNAL_PORT: "4100",
      PARIENTA_CORS_ORIGIN: pref("PARIENTA_CORS_ORIGIN", "PLATEADO_CORS_ORIGIN"),
      NARA_CORS_ORIGIN: pref("NARA_CORS_ORIGIN"),
    },
    stdio: "inherit",
    shell: true,
  });

  function shutdown(code) {
    try {
      parienta.kill("SIGTERM");
    } catch {
      /* ignore */
    }
    try {
      nara.kill("SIGTERM");
    } catch {
      /* ignore */
    }
    try {
      proxy.kill("SIGTERM");
    } catch {
      /* ignore */
    }
    process.exit(code);
  }

  parienta.on("exit", (c) => {
    console.error("[start-prod] stack parienta salió", c);
    shutdown(c ?? 1);
  });
  nara.on("exit", (c) => {
    console.error("[start-prod] stack nara salió", c);
    shutdown(c ?? 1);
  });
  proxy.on("exit", (c) => {
    console.error("[start-prod] proxy salió", c);
    shutdown(c ?? 1);
  });
  process.on("SIGINT", () => shutdown(0));
  process.on("SIGTERM", () => shutdown(0));

  console.log(
    `[start-prod] modo=dual proxy=:${pref("PORT") || "(PORT Render)"} internos parienta=:4000 nara=:4100`,
  );
}

if (dual) startDual();
else startSingle();
