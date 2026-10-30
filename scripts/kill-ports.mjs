import { execSync } from "node:child_process";

/** Puertos a liberar: NUCLEO_PORTS=4000,4001,... o por defecto el bloque Plateado. */
const PORTS = String(process.env.NUCLEO_PORTS || "4000,4001,4002,4003,4004")
  .split(",")
  .map((x) => Number(x.trim()))
  .filter((n) => Number.isFinite(n) && n > 0);

const isWindows = process.platform === "win32";
const label = PORTS.join("-");

function listeningPids() {
  const pids = new Set();

  if (isWindows) {
    const out = execSync("netstat -ano", { encoding: "utf8" });
    for (const line of out.split(/\r?\n/)) {
      if (!line.includes("LISTENING")) continue;
      for (const port of PORTS) {
        if (new RegExp(`:${port}\\s`).test(line)) {
          const parts = line.trim().split(/\s+/);
          const pid = Number(parts[parts.length - 1]);
          if (pid > 0) pids.add(pid);
        }
      }
    }
    return [...pids];
  }

  for (const port of PORTS) {
    let out = "";
    try {
      out = execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN -t`, {
        encoding: "utf8",
      });
    } catch {
      // nadie escucha
    }
    for (const line of out.split(/\r?\n/)) {
      const pid = Number(line.trim());
      if (pid > 0) pids.add(pid);
    }
  }
  return [...pids];
}

function sleep(ms) {
  if (isWindows) {
    execSync(
      `powershell -NoProfile -Command "Start-Sleep -Milliseconds ${ms}"`,
    );
    return;
  }
  execSync(`sleep ${ms / 1000}`);
}

if (!PORTS.length) {
  console.error("[kill-ports] NUCLEO_PORTS vacío");
  process.exit(1);
}

const pids = listeningPids();
if (!pids.length) {
  console.log(`[kill-ports] ${label} ya libres`);
  process.exit(0);
}

console.log(`[kill-ports] matando PID en ${label}: ${pids.join(", ")}`);
for (const pid of pids) {
  try {
    if (isWindows) {
      execSync(`taskkill /F /PID ${pid}`, { stdio: "inherit" });
    } else {
      execSync(`kill -9 ${pid}`, { stdio: "inherit" });
    }
  } catch {
    // proceso ya muerto
  }
}

sleep(1200);

const left = listeningPids();
if (left.length) {
  console.error(`[kill-ports] aún ocupados por: ${left.join(", ")}`);
  process.exit(1);
}
console.log(`[kill-ports] listo (${label})`);
