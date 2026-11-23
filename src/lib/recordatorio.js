import { addDays, formatFecha, formatHour, todayISO } from './schedule';

// Texto del recordatorio que se le envía a la clienta.
export function mensajeRecordatorio(r) {
  const cuando = r.fecha === addDays(todayISO(), 1) ? 'para mañana' : `para el ${formatFecha(r.fecha)}`;
  const pago = r.pagado === true ? 'Pagado. ¡Muchas gracias!' : 'Aún no se ha pagado.';
  return [
    `Hola ${r.nombre}, le recordamos que tiene una cita ${cuando}:`,
    '',
    `Servicio: ${r.servicio}`,
    `Hora: ${formatHour(r.hora)}`,
    `Pago: ${pago}`,
    '',
    'Por favor responda este mensaje para confirmar su cita. ¡Le esperamos!',
    '',
    'Grecia Cepeda',
  ].join('\n');
}

// Enlace de WhatsApp directo a la clienta. Convierte un número venezolano (04XX…) al formato internacional (58…).
export function enlaceWhatsAppClienta(telefono, texto) {
  let digitos = String(telefono || '').replace(/\D/g, '');
  if (!digitos) return null;
  if (digitos.startsWith('0')) digitos = `58${digitos.slice(1)}`;
  return `https://wa.me/${digitos}?text=${encodeURIComponent(texto)}`;
}
