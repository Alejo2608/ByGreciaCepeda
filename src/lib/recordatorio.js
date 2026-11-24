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
    `👁️ Servicio: ${r.servicio}${r.adicional ? ` + ${r.adicional}` : ''}`,
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
  // Cada cita en su bloque: servicio, fecha y precio.
  // Ordenadas de la más vieja a la más reciente (fecha y luego hora).
  const ordenadas = [...citas].sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
  const bloques = ordenadas.map((c) =>
    [
      `👁️ Servicio: ${c.servicio}${c.adicional ? ` + ${c.adicional}` : ''}`,
      `📅 Fecha: ${formatFecha(c.fecha)}`,
      `💵 Precio: ${c.precio}`,
    ].join('\n'),
  );
  return [
    `¡Hola, ${nombre}! 🤍`,
    '',
    'Te escribe Grecia Cepeda para recordarte que tienes pagos pendientes:',
    '',
    bloques.join('\n\n'),
    '',
    `Pendiente: ${total} USD`,
    '',
    'Si ya realizaste el pago, por favor envíame el comprobante por aquí. ¡Muchas gracias! ✨',
    '',
    'Si aún no lo has hecho, avísame y te comparto los datos para realizar el pago.',
  ].join('\n');
}

// Abre WhatsApp. En la app instalada de iPhone (modo standalone) se usa la misma ventana: así iOS abre
// la app de WhatsApp y al volver se carga de nuevo el panel. Con window.open se quedaba en blanco.
export function abrirWhatsApp(enlace) {
  const instalada = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (instalada) {
    window.location.href = enlace;
  } else {
    window.open(enlace, '_blank', 'noopener');
  }
}

// Enlace de WhatsApp directo a la clienta. Convierte un número venezolano (04XX…) al formato internacional (58…).
export function enlaceWhatsAppClienta(telefono, texto) {
  let digitos = String(telefono || '').replace(/\D/g, '');
  if (!digitos) return null;
  if (digitos.startsWith('0')) digitos = `58${digitos.slice(1)}`;
  return `https://wa.me/${digitos}?text=${encodeURIComponent(texto)}`;
}
