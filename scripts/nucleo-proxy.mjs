/**
 * Proxy público (PORT de Render) → gateways internos:
 *   Parienta (:4000) · NARA (:4100) · QUINTIA (:4200)
 * Enruta por header x-program-id (lo ponen los fronts) o por Origin/Referer.
 */
import http from "node:http";

const publicPort = Number(process.env.PORT || 10000);
const parientaPort = Number(process.env.PARIENTA_INTERNAL_PORT || 4000);
const naraPort = Number(process.env.NARA_INTERNAL_PORT || 4100);
const quintiaPort = Number(
  process.env.QUINTIA_INTERNAL_PORT || process.env.CONSCIENTE_INTERNAL_PORT || 4200,
);

const parientaOrigins = String(process.env.PARIENTA_CORS_ORIGIN || process.env.PLATEADO_CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);
const naraOrigins = String(process.env.NARA_CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);
const quintiaOrigins = String(
  process.env.QUINTIA_CORS_ORIGIN || process.env.CONSCIENTE_CORS_ORIGIN || "",
)
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

function pickProgram(req) {
  const h =
    String(req.headers["x-program-id"] || req.headers["x-nucleo-program"] || "")
      .trim()
      .toLowerCase();
  if (h === "parienta" || h === "plateado") return "parienta";
  if (h === "nara") return "nara";
  if (h === "quintia" || h === "consiente") return "quintia";

  const origin = String(req.headers.origin || req.headers.referer || "").toLowerCase();
  if (origin) {
    if (parientaOrigins.some((o) => origin.startsWith(o) || origin.includes(o.replace(/^https?:\/\//, "")))) {
      return "parienta";
    }
    if (naraOrigins.some((o) => origin.startsWith(o) || origin.includes(o.replace(/^https?:\/\//, "")))) {
      return "nara";
    }
    if (quintiaOrigins.some((o) => origin.startsWith(o) || origin.includes(o.replace(/^https?:\/\//, "")))) {
      return "quintia";
    }
    if (/parienta|plateado|localhost:3003|127\.0\.0\.1:3003/.test(origin)) return "parienta";
    if (/nara|localhost:3000|localhost:3002|127\.0\.0\.1:3000|127\.0\.0\.1:3002/.test(origin)) {
      return "nara";
    }
    if (/quintia|consiente|localhost:3004|127\.0\.0\.1:3004/.test(origin)) return "quintia";
  }
  return null;
}

function targetPort(program) {
  if (program === "nara") return naraPort;
  if (program === "quintia") return quintiaPort;
  return parientaPort;
}

function proxyTo(req, res, port) {
  const headers = { ...req.headers, host: `127.0.0.1:${port}` };
  const opts = {
    hostname: "127.0.0.1",
    port,
    path: req.url,
    method: req.method,
    headers,
  };
  const upstream = http.request(opts, (up) => {
    res.writeHead(up.statusCode || 502, up.headers);
    up.pipe(res);
  });
  upstream.on("error", (err) => {
    res.writeHead(502, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        ok: false,
        error: "Gateway interno no disponible",
        detail: String(err.message || err),
        port,
      }),
    );
  });
  req.pipe(upstream);
}

const programs = ["parienta", "nara"];
if (
  process.env.QUINTIA_MONGODB_URI ||
  process.env.CONSCIENTE_MONGODB_URI ||
  process.env.QUINTIA_INTERNAL_PORT ||
  process.env.CONSCIENTE_INTERNAL_PORT
) {
  programs.push("quintia");
}

const server = http.createServer((req, res) => {
  const url = String(req.url || "");
  const program = pickProgram(req);

  if (
    (url === "/api/health" || url === "/health") &&
    (program == null || req.headers["x-health-all"] === "1")
  ) {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        ok: true,
        service: "nucleo-api",
        mode: programs.length >= 3 ? "triple" : "dual",
        programs,
        commit: process.env.RENDER_GIT_COMMIT || process.env.NARA_COMMIT || null,
      }),
    );
    return;
  }

  const chosen = program || "nara";
  proxyTo(req, res, targetPort(chosen));
});

server.listen(publicPort, "0.0.0.0", () => {
  console.log(
    `[nucleo-proxy] :${publicPort} → parienta=:${parientaPort} nara=:${naraPort} quintia=:${quintiaPort}`,
  );
});
