// Revisa la carpeta de evidencia ANTES de entregarla: busca claves, tokens, cookies, cadenas de conexión,
// correos y teléfonos que parezcan reales. No corrige nada: lista los hallazgos para revisarlos a mano.
// Uso: node revisar-evidencia.js <carpeta de evidencia> [dominio de correo permitido, por ejemplo ejemplo.com]
const fs = require('fs');
const path = require('path');
const raiz = process.argv[2] || '../evidencia';
const permitido = (process.argv[3] || 'ejemplo.com|example.com|ejemplo.invalid|\\.invalid').toLowerCase();
const PATRONES = [
  ['clave en texto', /(password|passwd|pass|contrase(ñ|n)a|clave)["']?\s*[:=]\s*["']?[^\s"',}]{6,}/i],
  ['token o secreto', /(secret|token|api[_-]?key|authorization)\s*["':=]\s*["']?(bearer\s+)?[A-Za-z0-9._\-]{16,}/i],
  ['llave de proveedor', /\b(sk-[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_\-]{30,}|ghp_[A-Za-z0-9]{30,}|xox[bp]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16})\b/],
  ['cadena de conexión con credenciales', /\b(mongodb(\+srv)?|postgres(ql)?|mysql|redis):\/\/[^\s:@\/]+:[^\s@\/]+@/i],
  ['llave privada', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['cookie de sesión', /set-cookie:\s*[^=\s]+=[A-Za-z0-9%._\-]{20,}/i],
  ['JWT', /\beyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}/],
];
const CORREO = /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g;
const TELEFONO = /(?<!\d)(\+?\d{1,3}[\s\-]?)?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}(?!\d)/g;
const TEXTO = /\.(json|csv|log|txt|md|html|js|yaml|yml|xml|har)$/i;
const hallazgos = [];
(function recorrer(d) {
  for (const n of fs.readdirSync(d)) {
    const p = path.join(d, n); const st = fs.statSync(p);
    if (st.isDirectory()) { recorrer(p); continue; }
    if (/\.(png|jpe?g|mp4|mov|pdf|xlsx|docx|gz|zip)$/i.test(n)) { hallazgos.push([p, 'revisar a mano (binario: imagen, video o documento)', '']); continue; }
    if (!TEXTO.test(n) || st.size > 50 * 1024 * 1024) continue;
    const lineas = fs.readFileSync(p, 'utf8').split(/\r?\n/);
    lineas.forEach((l, i) => {
      for (const [nombre, re] of PATRONES) if (re.test(l)) hallazgos.push([`${p}:${i + 1}`, nombre, l.trim().slice(0, 100)]);
      for (const m of l.match(CORREO) || []) if (!new RegExp(permitido).test(m.toLowerCase())) hallazgos.push([`${p}:${i + 1}`, 'correo', m]);
      const sinPrefijos = l.replace(/TRL-QA-[\w-]*/g, ' ');   // los prefijos de prueba llevan fecha y hora: no son teléfonos
      for (const m of sinPrefijos.match(TELEFONO) || []) { const d = m.replace(/\D/g, ''); if (!/^(\d)\1+$/.test(d) && !/0{6,}/.test(d)) hallazgos.push([`${p}:${i + 1}`, 'posible teléfono', m.trim()]); }
    });
  }
})(raiz);
const texto = hallazgos.filter((h) => !h[1].startsWith('revisar a mano'));
const binarios = hallazgos.filter((h) => h[1].startsWith('revisar a mano'));
console.log(`Hallazgos en texto: ${texto.length}`);
for (const h of texto) console.log(` - ${h[0]} · ${h[1]} · ${h[2]}`);
console.log(`\nArchivos binarios para revisar a mano (capturas, videos, PDF, Excel): ${binarios.length}`);
for (const h of binarios) console.log(` - ${h[0]}`);
process.exit(texto.length ? 1 : 0);
