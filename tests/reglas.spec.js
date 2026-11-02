import { test, expect } from '@playwright/test';

// Reglas de precio y pago. Si cambia la configuración en categories.js, estas pruebas avisan.

const conDescuento = ['pestanas', 'cejas', 'micro-brows'];
const sinDescuento = ['maquillaje', 'cursos'];

for (const hash of conDescuento) {
  test(`${hash}: muestra el 10 % de descuento en el servicio`, async ({ page }) => {
    await page.goto(`/#${hash}`);
    await expect(page.locator('article').first().getByText('de descuento pagando en')).toBeVisible();
  });
}

for (const hash of sinDescuento) {
  test(`${hash}: no muestra el 10 % de descuento`, async ({ page }) => {
    await page.goto(`/#${hash}`);
    await expect(page.getByText('de descuento pagando en')).toHaveCount(0);
  });
}
