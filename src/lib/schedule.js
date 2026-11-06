// Horario de atención y duraciones. Los turnos se miran cada 30 minutos.
// Maquillaje atiende en un horario más amplio (extendido); los demás servicios, en el horario normal.
const HOURS = {
  normal: { open: '08:00', close: '18:00' },
  extended: { open: '06:00', close: '20:00' },
};
// Hora de almuerzo: no se agenda entre estas horas.
export const BREAK_START = '12:30';
export const BREAK_END = '13:30';
export const STEP = 30;

// Textos de duración tal como aparecen en services.js.
const DURATIONS = {
  '30 minutos': 30,
  '1 hora': 60,
  '1 hora y 30 minutos': 90,
  '2 horas': 120,
};

// Fechas que no se trabajan (cada año) y fechas solo para maquillaje (cada año), en formato MM-DD.
const CLOSED_DAYS = ['12-25', '01-01', '01-02'];
const MAKEUP_ONLY_DAYS = ['12-24', '12-31'];
// Las clientas solo pueden agendar hasta 3 semanas adelante.
export const MAX_DAYS_AHEAD = 21;

// Duración en minutos a partir del texto guardado: "1 hora", "2 horas", "150 minutos", etc.
export function durationMinutes(text) {
  if (DURATIONS[text]) return DURATIONS[text];
  const m = /^(\d+) minutos$/.exec(text ?? '');
  return m ? Number(m[1]) : 60;
}

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const toHHMM = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

// Formato de 12 horas para mostrar: 8:00 AM, 1:30 PM.
export function formatHour(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = ((h + 11) % 12) + 1;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

// Todas las horas de inicio posibles en un día. extended = horario amplio de maquillaje.
export function dayTimes(extended = false) {
  const { open, close } = extended ? HOURS.extended : HOURS.normal;
  const times = [];
  for (let m = toMinutes(open); m < toMinutes(close); m += STEP) times.push(toHHMM(m));
  return times;
}

// Hora de almuerzo (el local no atiende en ese rango).
export function isBreakTime(hhmm) {
  const m = toMinutes(hhmm);
  return m >= toMinutes(BREAK_START) && m < toMinutes(BREAK_END);
}

// Turnos de 30 minutos que ocupa una cita que empieza a cierta hora.
export function slotIdsFor(fecha, hora, minutes) {
  const ids = [];
  const start = toMinutes(hora);
  for (let m = start; m < start + minutes; m += STEP) ids.push(`${fecha}_${toHHMM(m)}`);
  return ids;
}

// Turnos que ocupa un curso: la misma franja en cada día del curso.
export function bloqueSlotIds(fecha, { dias, inicio, fin }) {
  const minutes = toMinutes(fin) - toMinutes(inicio);
  return Array.from({ length: dias }, (_, i) => slotIdsFor(addDays(fecha, i), inicio, minutes)).flat();
}

// La cita cabe en el horario de atención y no se cruza con la hora de almuerzo.
export function fitsInDay(hora, minutes, extended = false) {
  const { open, close } = extended ? HOURS.extended : HOURS.normal;
  const start = toMinutes(hora);
  const end = start + minutes;
  if (start < toMinutes(open) || end > toMinutes(close)) return false;
  return end <= toMinutes(BREAK_START) || start >= toMinutes(BREAK_END);
}

// Los domingos el local está cerrado, salvo para maquillaje y cursos.
export function isOpenDay(fecha, allowSunday = false) {
  return allowSunday || new Date(`${fecha}T00:00`).getDay() !== 0;
}

// Día que se puede reservar para un servicio. makeup: maquillaje (atiende en festivos de 24 y 31 de diciembre).
// sunday: el servicio sí atiende los domingos (maquillaje y cursos).
export function isBookableDay(fecha, { makeup = false, sunday = false } = {}) {
  const mmdd = fecha.slice(5);
  if (CLOSED_DAYS.includes(mmdd)) return false;
  if (MAKEUP_ONLY_DAYS.includes(mmdd) && !makeup) return false;
  if (esDomingoDeDiciembre(fecha)) return true;
  return isOpenDay(fecha, makeup || sunday);
}

// En diciembre los domingos se atiende solo en la mañana.
export function esDomingoDeDiciembre(fecha) {
  return fecha.slice(5, 7) === '12' && new Date(`${fecha}T00:00`).getDay() === 0;
}

// La cita cabe en el horario del día. Los domingos de diciembre tiene que terminar antes del almuerzo.
export function enHorario(hora, minutes, fecha, extended = false) {
  if (!fitsInDay(hora, minutes, extended)) return false;
  if (!esDomingoDeDiciembre(fecha)) return true;
  return toMinutes(hora) + minutes <= toMinutes(BREAK_START);
}

// Fecha de hoy en formato AAAA-MM-DD, según la hora local.
export function todayISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

// Suma días a una fecha AAAA-MM-DD.
export function addDays(fecha, days) {
  const d = new Date(`${fecha}T00:00`);
  d.setDate(d.getDate() + days);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

// Última fecha que una clienta puede elegir.
export function maxBookingISO() {
  return addDays(todayISO(), MAX_DAYS_AHEAD);
}

export function formatFecha(fecha) {
  return new Date(`${fecha}T00:00`).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
}
