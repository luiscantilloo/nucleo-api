/**
 * Levanta los 3 programas a la vez (mismo código, endpoints separados):
 *   Parienta  → :4000
 *   NARA      → :4100
 *   QUINTIA   → :4200
 *
 * Uso: npm run start:dev:ambos
 */
import { spawn } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function run(program) {
  return spawn("node", ["scripts/run-dev.mjs", program], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
}

console.log("[run-ambos] Parienta  → http://127.0.0.1:4000");
console.log("[run-ambos] NARA      → http://127.0.0.1:4100");
console.log("[run-ambos] QUINTIA   → http://127.0.0.1:4200");

const children = [run("parienta"), run("nara"), run("quintia")];

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
  c.on("exit", (code) => shutdown(code ?? 0));
}
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
