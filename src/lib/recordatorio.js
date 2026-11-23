import { addDays, formatFecha, formatHour, todayISO } from './schedule';

// Texto del recordatorio que se le envía a la clienta.
export function mensajeRecordatorio(r) {
  // Solo dice "mañana" o "hoy" cuando es exactamente ese día; en otro caso muestra la fecha completa.
  const hoy = todayISO();
  const cuando =
    r.fecha === hoy
      ? 'de hoy'
      : r.fecha === addDays(hoy, 1)
        ? 'de mañana'
        : `del ${formatFecha(r.fecha)}`;
  const pago = r.pagado === true ? 'Pagado. ¡Muchas gracias!' : 'Pago pendiente';
  return [
    `¡Hola, ${r.nombre}! 🤍`,
    '',
    `Te escribe Grecia Cepeda para recordarte tu cita ${cuando}.`,
    '',
    `👁️ Servicio: ${r.servicio}`,
    `🕒 Hora: ${formatHour(r.hora)}`,
    `💳 Pago: ${pago}`,
    '',
    'Para confirmar tu lugar, por favor responde a este mensaje.',
    '',
    '¡Te espero con mucho cariño! ✨',
  ].join('\n');
}

// Texto para recordar el pago de las citas ya atendidas que todavía no se han pagado.
export function mensajePagoPendiente(nombre, citas, total) {
  const lineas = citas.map((c) => `• ${formatFecha(c.fecha)}: ${c.servicio} (${c.precio})`);
  return [
    `¡Hola, ${nombre}! 🤍`,
    '',
    'Te escribe Grecia Cepeda para recordarte que tienes pendiente el pago de:',
    '',
    ...lineas,
    '',
    `Total pendiente: ${total} USD`,
    '',
    'Si ya realizaste el pago, por favor envíame el comprobante por aquí. ¡Muchas gracias! ✨',
  ].join('\n');
}

// Enlace de WhatsApp directo a la clienta. Convierte un número venezolano (04XX…) al formato internacional (58…).
export function enlaceWhatsAppClienta(telefono, texto) {
  let digitos = String(telefono || '').replace(/\D/g, '');
  if (!digitos) return null;
  if (digitos.startsWith('0')) digitos = `58${digitos.slice(1)}`;
  return `https://wa.me/${digitos}?text=${encodeURIComponent(texto)}`;
}
