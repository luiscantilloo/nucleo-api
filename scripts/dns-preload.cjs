/**
 * Precarga DNS para Node (MongoDB SRV).
 * Hotspots / DNS captive suelen devolver querySrv EBADRESP / ETIMEOUT.
 *
 * NODE_DNS_SERVERS=1.1.1.1,8.8.8.8  (default en run-dev)
 * NODE_DNS_SERVERS=system             → no tocar
 */
const dns = require("node:dns");

const raw = String(process.env.NODE_DNS_SERVERS || "1.1.1.1,8.8.8.8").trim();
if (raw && raw !== "system") {
  const servers = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (servers.length) {
    dns.setServers(servers);
  }
}
