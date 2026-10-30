/**
 * Levanta Plateado (:4000) y NARA (:4100) a la vez — mismo código, endpoints separados.
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

console.log("[run-ambos] Plateado → http://127.0.0.1:4000");
console.log("[run-ambos] NARA     → http://127.0.0.1:4100");

const a = run("parienta");
const b = run("nara");

function shutdown(code) {
  a.kill("SIGTERM");
  b.kill("SIGTERM");
  process.exit(code);
}

a.on("exit", (c) => shutdown(c ?? 0));
b.on("exit", (c) => shutdown(c ?? 0));
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
