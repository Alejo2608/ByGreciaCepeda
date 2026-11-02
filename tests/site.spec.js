import { test, expect } from '@playwright/test';

// Recorrido general de la página. No envía ninguna reserva a Firestore.

test('la portada carga sin errores de consola', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));

  await page.goto('/');
  await expect(page.locator('h1').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('todas las categorías tienen su página con servicios', async ({ page }) => {
  const categorias = [
    { hash: 'pestanas', texto: 'Técnica clásica' },
    { hash: 'cejas', texto: 'Epilación' },
    { hash: 'micro-brows', texto: 'Shadow' },
    { hash: 'maquillaje', texto: 'Social' },
    { hash: 'cursos', texto: 'Fibras' },
  ];
  for (const { hash, texto } of categorias) {
    await page.goto(`/#${hash}`);
    await expect(page.getByText(texto).first()).toBeVisible();
  }
});

test('los cursos se muestran en USD', async ({ page }) => {
  await page.goto('/#cursos');
  await expect(page.getByText('Los precios son en USD.')).toBeVisible();
});

test('el panel de citas pide iniciar sesión a quien no es Grecia', async ({ page }) => {
  await page.goto('/#admin');
  await expect(page.getByRole('button', { name: 'Entrar con Google' })).toBeVisible();
});

test('los enlaces de WhatsApp usan el número de Grecia', async ({ page }) => {
  await page.goto('/');
  const enlaces = page.locator('a[href*="api.whatsapp.com/send"]');
  // Puede estar bajo una animación de entrada; basta con que exista en la página.
  await expect(enlaces.first()).toBeAttached();
  const href = await enlaces.first().getAttribute('href');
  expect(href).toContain('phone=584121750249');
});
