/**
 * Producción Render — UN servicio, N programas (N Mongo).
 *
 * Env (ejemplo: deploy/RENDER-UNICO.env.example):
 *   PARIENTA_MONGODB_URI / PARIENTA_MONGODB_DB / PARIENTA_AUTH_SECRET / PARIENTA_CORS_ORIGIN
 *   NARA_MONGODB_URI / NARA_MONGODB_DB / NARA_AUTH_SECRET / NARA_CORS_ORIGIN
 *   QUINTIA_MONGODB_URI / QUINTIA_MONGODB_DB / QUINTIA_AUTH_SECRET / QUINTIA_CORS_ORIGIN
 *   (alias legacy CONSCIENTE_* aceptado)
 *   (+ keys IA compartidas)
 *   PORT ← Render
 *
 * Arranca stacks internos + proxy público en $PORT (x-program-id).
 * Compat: si solo hay MONGODB_URI + PROGRAM_ID, arranca un solo programa (modo legacy).
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
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

function normalizeProgramId(id) {
  const v = String(id || "").trim().toLowerCase();
  if (v === "consiente") return "quintia";
  if (v === "plateado") return "parienta";
  return v;
}

const parientaUri = pref("PARIENTA_MONGODB_URI", "PLATEADO_MONGODB_URI");
const naraUri = pref("NARA_MONGODB_URI");
const quintiaUri = pref("QUINTIA_MONGODB_URI", "CONSCIENTE_MONGODB_URI");

const dual = !!(parientaUri && naraUri);
const withQuintia = dual && !!quintiaUri;

/** Modo un solo programa (legacy / debug). */
function startSingle() {
  const programId = normalizeProgramId(pref("PROGRAM_ID") || "parienta");
  const uri =
    pref("MONGODB_URI") ||
    (programId === "nara"
      ? naraUri
      : programId === "quintia"
        ? quintiaUri
        : parientaUri);
  if (!uri) {
    console.error(
      "[start-prod] Falta Mongo. Multi: PARIENTA_ + NARA_ (+ QUINTIA_). O legacy: MONGODB_URI + PROGRAM_ID.",
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
        : programId === "quintia"
          ? pref("QUINTIA_MONGODB_DB", "CONSCIENTE_MONGODB_DB") || "nucleo_consiente"
          : pref("PARIENTA_MONGODB_DB", "PLATEADO_MONGODB_DB") || "nucleo_parienta"),
    AUTH_SECRET:
      pref("AUTH_SECRET") ||
      (programId === "nara"
        ? pref("NARA_AUTH_SECRET")
        : programId === "quintia"
          ? pref("QUINTIA_AUTH_SECRET", "CONSCIENTE_AUTH_SECRET")
          : pref("PARIENTA_AUTH_SECRET", "PLATEADO_AUTH_SECRET")),
    CORS_ORIGIN:
      pref("CORS_ORIGIN") ||
      (programId === "nara"
        ? pref("NARA_CORS_ORIGIN")
        : programId === "quintia"
          ? pref("QUINTIA_CORS_ORIGIN", "CONSCIENTE_CORS_ORIGIN")
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

function startMulti() {
  if (!hasCrisis("parienta") || !hasCrisis("nara")) {
    console.error("[start-prod] Faltan programs/parienta o programs/nara");
    process.exit(1);
  }
  if (withQuintia && !hasCrisis("quintia")) {
    console.error("[start-prod] Falta programs/quintia/crisis.json");
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

  const children = [];

  children.push(
    startStack("parienta", {
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
    }),
  );

  children.push(
    startStack("nara", {
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
    }),
  );

  if (withQuintia) {
    const quintiaAuth =
      pref("QUINTIA_AUTH_SECRET", "CONSCIENTE_AUTH_SECRET") || pref("AUTH_SECRET");
    if (!quintiaAuth) {
      console.error("[start-prod] Falta QUINTIA_AUTH_SECRET");
      process.exit(1);
    }
    children.push(
      startStack("quintia", {
        ...shared,
        PROGRAM_ID: "quintia",
        MONGODB_URI: quintiaUri,
        MONGODB_DB:
          pref("QUINTIA_MONGODB_DB", "CONSCIENTE_MONGODB_DB") || "nucleo_consiente",
        AUTH_SECRET: quintiaAuth,
        CORS_ORIGIN:
          pref("QUINTIA_CORS_ORIGIN", "CONSCIENTE_CORS_ORIGIN") ||
          "http://localhost:3004,http://127.0.0.1:3004",
        PORT: "4200",
        NARA_GATEWAY_PORT: "4200",
        NARA_AUTH_PORT: "4201",
        NARA_PEOPLE_PORT: "4202",
        NARA_OPS_PORT: "4203",
        NARA_AI_PORT: "4204",
      }),
    );
  }

  const proxyEnv = {
    ...process.env,
    PORT: pref("PORT") || "10000",
    PARIENTA_INTERNAL_PORT: "4000",
    NARA_INTERNAL_PORT: "4100",
    QUINTIA_INTERNAL_PORT: withQuintia ? "4200" : "",
    PARIENTA_CORS_ORIGIN: pref("PARIENTA_CORS_ORIGIN", "PLATEADO_CORS_ORIGIN"),
    NARA_CORS_ORIGIN: pref("NARA_CORS_ORIGIN"),
    QUINTIA_CORS_ORIGIN: pref("QUINTIA_CORS_ORIGIN", "CONSCIENTE_CORS_ORIGIN"),
    QUINTIA_MONGODB_URI: quintiaUri || "",
  };
  const proxy = spawn("node", ["scripts/nucleo-proxy.mjs"], {
    cwd: root,
    env: proxyEnv,
    stdio: "inherit",
    shell: true,
  });
  children.push(proxy);

  function shutdown(code) {
    for (const c of children) {
      try {
        c.kill("SIGTERM");
      } catch {
        /* ignore */
      }
    }
    process.exit(code);
  }

  for (const c of children) {
    c.on("exit", (code) => {
      console.error("[start-prod] un proceso salió", code);
      shutdown(code ?? 1);
    });
  }
  process.on("SIGINT", () => shutdown(0));
  process.on("SIGTERM", () => shutdown(0));

  const mode = withQuintia ? "triple" : "dual";
  console.log(
    `[start-prod] modo=${mode} proxy=:${pref("PORT") || "(PORT Render)"} internos parienta=:4000 nara=:4100` +
      (withQuintia ? " quintia=:4200" : ""),
  );
}

if (dual) startMulti();
else startSingle();
