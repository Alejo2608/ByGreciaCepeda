import { test, expect } from '@playwright/test';

// Flujo de reserva hasta antes de enviar. No se presiona "Solicitar cita" para no crear
// reservas reales en Firestore.

// Elige un día disponible dentro de las próximas 3 semanas. Se toma el segundo para no depender de hoy.
async function elegirDia(dialog) {
  await dialog.locator('div.grid.grid-cols-7.gap-1 button:not([disabled])').nth(1).click();
}

async function llenarDatosBasicos(dialog) {
  await dialog.getByLabel('Nombre del cliente').fill('Prueba QA');
  await dialog.getByLabel(/Teléfono/).fill('04121234567');
}

test('pestañas: no pide términos, va directo a la hora y el botón dice Solicitar cita', async ({ page }) => {
  await page.goto('/#pestanas');
  await page.locator('article').first().getByRole('button', { name: 'Agendar' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Aceptar y agendar')).toHaveCount(0);

  await llenarDatosBasicos(dialog);
  await elegirDia(dialog);

  await expect(dialog.getByRole('button', { name: '4:00 PM' })).toBeVisible();
  // Las horas que ya no están disponibles se muestran tachadas (deshabilitadas), no se quitan.
  await expect(dialog.getByRole('button', { name: '6:00 PM' })).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: '5:30 PM' })).toBeDisabled();

  await dialog.getByText('Hora disponible').locator('..').locator('button:enabled').first().click();
  await expect(dialog.getByRole('button', { name: 'Solicitar cita' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Continuar' })).toHaveCount(0);
  await expect(dialog.getByText('Datos adicionales')).toHaveCount(0);
});

test('maquillaje: pide términos, luego la encuesta y permite horas hasta las 6:30 PM', async ({ page }) => {
  await page.goto('/#maquillaje');
  await page.locator('article').first().getByRole('button', { name: 'Agendar' }).click();

  const terminos = page.getByRole('dialog');
  await expect(terminos.getByRole('heading', { name: /Términos/ })).toBeVisible();
  await terminos.getByRole('button', { name: 'Aceptar y agendar' }).click();

  const dialog = page.getByRole('dialog');
  await llenarDatosBasicos(dialog);
  await elegirDia(dialog);

  // El horario llega hasta las 6:30 PM; las horas ya tomadas o pasadas aparecen tachadas.
  await expect(dialog.getByRole('button', { name: '6:30 PM' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: '7:00 PM' })).toBeDisabled();

  await dialog.getByText('Hora disponible').locator('..').locator('button:enabled').first().click();
  await dialog.getByRole('button', { name: 'Continuar' }).click();
  await expect(dialog.getByText('¿Qué tipo de piel consideras que eres?')).toBeVisible();
  await expect(dialog.getByText('Datos adicionales', { exact: false })).toHaveCount(0);
});

test('el botón de Agendar de un curso no rompe la página', async ({ page }) => {
  await page.goto('/#cursos');
  const boton = page.locator('article').first().getByRole('button', { name: 'Agendar' });
  await expect(boton).toBeVisible();
  await boton.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
