// Capturas de pantalla por rol (escritorio y, con MOVIL=1, celular) para la documentación.
// Usa la sección capturas de config.json. Solo cuentas y datos de prueba: revise cada imagen antes de usarla.
// La prueba FALLA si una pantalla queda en la de ingreso (sesión no iniciada o expirada): esa captura no sirve.
const path = require('path');
const { test, expect } = require('@playwright/test');
const { cfg, conCredenciales, ingresoUI, carpetaCapturas } = require('./lib');

const rutaIngreso = (cfg.ingreso && cfg.ingreso.ui && cfg.ingreso.ui.ruta) || '/login';

for (const p of (cfg.capturas && cfg.capturas.pantallas) || []) {
  test(`captura · ${p.rol}`, async ({ page }, info) => {
    test.skip(!conCredenciales(p.rol), `Falta PASS_${p.rol.toUpperCase()}`);
    const dir = carpetaCapturas();
    await ingresoUI(page, p.rol);
    await page.waitForURL((u) => !u.pathname.startsWith(rutaIngreso), { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    for (const ruta of p.rutas) {
      await page.goto(ruta);
      await page.waitForLoadState('networkidle');
      expect(new URL(page.url()).pathname.startsWith(rutaIngreso), `«${ruta}» quedó en la pantalla de ingreso`).toBeFalsy();
      const nombre = `${p.rol}_${ruta.replace(/\W+/g, '_').replace(/^_|_$/g, '') || 'inicio'}_${info.project.name}.png`;
      await page.screenshot({ path: path.join(dir, nombre), fullPage: true });
    }
  });
}
