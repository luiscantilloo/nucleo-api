// Configuración común. Las trazas y videos van apagados por defecto: en producción pueden guardar
// datos y cookies. Para depurar en un entorno de pruebas: EVIDENCIA_VISUAL=1.
// MOVIL=1 agrega el proyecto «movil» (375 × 812) para revisar las pantallas en celular.
const { defineConfig, devices } = require('@playwright/test');
const visual = process.env.EVIDENCIA_VISUAL === '1';

const proyectos = [{ name: 'escritorio', use: { viewport: { width: 1366, height: 800 } } }];
if (process.env.MOVIL === '1') proyectos.push({ name: 'movil', use: { ...devices['iPhone 13'], browserName: 'chromium' } });

module.exports = defineConfig({
  testDir: '.',
  testMatch: /.*\.spec\.js$/,
  timeout: 90_000,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  projects: proyectos,
  use: {
    baseURL: process.env.BASE_URL,
    trace: visual ? 'retain-on-failure' : 'off',
    video: visual ? 'retain-on-failure' : 'off',
    screenshot: visual ? 'only-on-failure' : 'off',
  },
});
