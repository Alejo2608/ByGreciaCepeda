import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Pruebas de seguridad. Las cabeceras viven en vercel.json (Vercel las envía en producción);
// aquí se leen del mismo archivo y se aplican a la versión compilada para comprobar que la página
// sigue funcionando con ellas. No envía ninguna reserva a Firestore.

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(readFileSync(path.join(raiz, 'vercel.json'), 'utf8'));
const cabeceras = Object.fromEntries(config.headers[0].headers.map((h) => [h.key.toLowerCase(), h.value]));

// Pone las cabeceras de vercel.json en cada página que sirve el navegador de prueba.
async function conCabeceras(page, baseURL) {
  const origen = new URL(baseURL).origin;
  await page.route('**/*', async (route) => {
    // Solo las páginas de este sitio: la ventana de inicio de sesión de Firebase tiene sus propias reglas.
    if (route.request().resourceType() !== 'document' || new URL(route.request().url()).origin !== origen) {
      return route.continue();
    }
    const respuesta = await route.fetch();
    await route.fulfill({ response: respuesta, headers: { ...respuesta.headers(), ...cabeceras } });
  });
}

test('vercel.json envía HTTPS estricto, anti-clickjacking y cabeceras de seguridad', () => {
  expect(cabeceras['strict-transport-security']).toMatch(/max-age=\d{8,}/);
  expect(cabeceras['x-frame-options']).toBe('DENY');
  expect(cabeceras['x-content-type-options']).toBe('nosniff');
  expect(cabeceras['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(cabeceras['permissions-policy']).toContain('camera=()');
  expect(cabeceras['cross-origin-opener-policy']).toBe('same-origin-allow-popups');
});

test('la política de contenido bloquea scripts de otros sitios y objetos', () => {
  const csp = cabeceras['content-security-policy'];
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("base-uri 'self'");
  // Nunca se permite eval ni scripts en línea sin control.
  expect(csp).not.toContain("'unsafe-eval'");
  expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
});

test('con la política de contenido aplicada, la portada y el panel siguen funcionando', async ({ page, baseURL }) => {
  await conCabeceras(page, baseURL);
  const errores = [];
  page.on('pageerror', (err) => errores.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errores.push(msg.text());
  });

  await page.goto('/');
  await expect(page.locator('h1').first()).toBeVisible();

  await page.goto('/#admin');
  await expect(page.getByRole('button', { name: 'Entrar con Google' })).toBeVisible();

  // Ningún bloqueo de la política de contenido (CSP) ni error de script.
  const bloqueos = errores.filter((e) => /Content Security Policy|Refused to|violates/i.test(e));
  expect(bloqueos).toEqual([]);
  expect(errores).toEqual([]);
});

test('el panel no muestra datos de clientas a quien no ha iniciado sesión', async ({ page }) => {
  await page.goto('/#admin');
  await expect(page.getByRole('button', { name: 'Entrar con Google' })).toBeVisible();
  await expect(page.getByText('Por cobrar')).toHaveCount(0);
  await expect(page.getByText('Por confirmar')).toHaveCount(0);
});

test('el service worker de notificaciones solo abre enlaces del mismo sitio', async ({ request }) => {
  const respuesta = await request.get('/firebase-messaging-sw.js');
  expect(respuesta.ok()).toBeTruthy();
  const codigo = await respuesta.text();
  expect(codigo).toContain('enlaceSeguro');
  expect(codigo).toContain('self.location.origin');
});
