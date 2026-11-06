import { test, expect } from '@playwright/test';
import {
  addDays,
  bloqueSlotIds,
  dayTimes,
  enHorario,
  fitsInDay,
  isBookableDay,
  isOpenDay,
  isBreakTime,
  maxBookingISO,
  slotIdsFor,
} from '../src/lib/schedule.js';

// Reglas de horario: servicios normales cierran a las 6:00 PM, maquillaje hasta las 8:00 PM.

test('servicios normales no tienen turnos a partir de las 6:00 PM', () => {
  const times = dayTimes(false);
  expect(times).toContain('17:30');
  expect(times).not.toContain('18:00');
  expect(times[times.length - 1]).toBe('17:30');
});

test('maquillaje atiende desde las 6:00 AM hasta las 7:30 PM de inicio', () => {
  const times = dayTimes(true);
  expect(times[0]).toBe('06:00');
  expect(times[times.length - 1]).toBe('19:30');
});

test('un servicio de 2 horas en horario normal debe terminar antes o a las 6:00 PM', () => {
  expect(fitsInDay('16:00', 120, false)).toBe(true);
  expect(fitsInDay('16:30', 120, false)).toBe(false);
  expect(fitsInDay('17:30', 30, false)).toBe(true);
  expect(fitsInDay('18:00', 30, false)).toBe(false);
});

test('maquillaje de 1h30 puede empezar hasta las 6:30 PM', () => {
  expect(fitsInDay('18:30', 90, true)).toBe(true);
  expect(fitsInDay('19:00', 90, true)).toBe(false);
});

test('la hora de almuerzo es de 12:30 PM a 1:30 PM y no se agenda ni se cruza', () => {
  expect(isBreakTime('12:00')).toBe(false);
  expect(isBreakTime('12:30')).toBe(true);
  expect(isBreakTime('13:00')).toBe(true);
  expect(isBreakTime('13:30')).toBe(false);
  expect(fitsInDay('12:00', 60, false)).toBe(false);
  expect(fitsInDay('11:30', 60, false)).toBe(true);
  expect(fitsInDay('13:30', 60, false)).toBe(true);
});

test('25 de diciembre, 1 y 2 de enero no se trabajan; 24 y 31 de diciembre solo maquillaje', () => {
  expect(isBookableDay('2030-12-25', { makeup: true })).toBe(false);
  expect(isBookableDay('2031-01-01', { makeup: true, sunday: true })).toBe(false);
  expect(isBookableDay('2031-01-02', { makeup: true })).toBe(false);
  expect(isBookableDay('2030-12-24', { makeup: false })).toBe(false);
  expect(isBookableDay('2030-12-24', { makeup: true })).toBe(true);
  expect(isBookableDay('2030-12-31', { makeup: true })).toBe(true);
  expect(isBookableDay('2030-12-31', { sunday: true })).toBe(false);
});

test('los cursos de pestañas y cejas ocupan de 8:00 AM a 1:00 PM en cada día', () => {
  const pestanas = { dias: 2, inicio: '08:00', fin: '13:00' };
  const ids = bloqueSlotIds('2030-03-04', pestanas);
  expect(ids).toHaveLength(20);
  expect(ids[0]).toBe('2030-03-04_08:00');
  expect(ids).toContain('2030-03-05_12:30');
  expect(ids).not.toContain('2030-03-05_13:00');
});

test('en diciembre los domingos se atiende solo en la mañana, para todos los servicios', () => {
  // 2030-12-01 es domingo; 2030-11-03 también es domingo pero no es diciembre.
  expect(isBookableDay('2030-12-01', {})).toBe(true);
  expect(isBookableDay('2030-11-03', {})).toBe(false);
  expect(enHorario('10:00', 60, '2030-12-01')).toBe(true);
  expect(enHorario('11:30', 60, '2030-12-01')).toBe(true);
  expect(enHorario('12:00', 60, '2030-12-01')).toBe(false);
  expect(enHorario('14:00', 60, '2030-11-03')).toBe(true);
});

test('la clienta solo puede agendar hasta 21 días adelante', () => {
  expect(addDays('2030-03-01', 21)).toBe('2030-03-22');
  expect(maxBookingISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});

test('los domingos solo se atienden maquillajes', () => {
  // 2026-11-01 es domingo.
  expect(isOpenDay('2026-11-01', false)).toBe(false);
  expect(isOpenDay('2026-11-01', true)).toBe(true);
  expect(isOpenDay('2026-11-02', false)).toBe(true);
});

test('una cita de 2 horas ocupa cuatro turnos de 30 minutos', () => {
  expect(slotIdsFor('2026-11-02', '14:00', 120)).toEqual([
    '2026-11-02_14:00',
    '2026-11-02_14:30',
    '2026-11-02_15:00',
    '2026-11-02_15:30',
  ]);
});
