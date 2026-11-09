import { collection, doc, runTransaction, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { durationMinutes, slotIdsFor } from './schedule';

// Guarda una reserva y aparta todos sus turnos en una sola transacción.
// Si alguno de los turnos ya está ocupado, lanza el error 'ocupado' y no guarda nada.
export async function createReserva(data, slotIds) {
  const reservaRef = doc(collection(db, 'reservas'));
  await runTransaction(db, async (tx) => {
    for (const id of slotIds) {
      const slot = await tx.get(doc(db, 'slots', id));
      if (slot.exists()) throw new Error('ocupado');
    }
    tx.set(reservaRef, { ...data, slots: slotIds, creado: serverTimestamp() });
    for (const id of slotIds) {
      const [fecha, hora] = id.split('_');
      tx.set(doc(db, 'slots', id), { fecha, hora, reservaId: reservaRef.id });
    }
  });
  return reservaRef.id;
}

// Cambia fecha, hora y los datos indicados de una reserva. Solo se guarda si el nuevo horario está libre.
async function updateReserva(reserva, fecha, hora, cambios, duracion) {
  const newIds = slotIdsFor(fecha, hora, durationMinutes(duracion));
  const oldIds = reserva.slots ?? [];
  await runTransaction(db, async (tx) => {
    for (const id of newIds) {
      if (oldIds.includes(id)) continue;
      const slot = await tx.get(doc(db, 'slots', id));
      if (slot.exists()) throw new Error('ocupado');
    }
    oldIds.filter((id) => !newIds.includes(id)).forEach((id) => tx.delete(doc(db, 'slots', id)));
    newIds
      .filter((id) => !oldIds.includes(id))
      .forEach((id) => {
        const [f, h] = id.split('_');
        tx.set(doc(db, 'slots', id), { fecha: f, hora: h, reservaId: reserva.id });
      });
    tx.update(doc(db, 'reservas', reserva.id), { ...cambios, fecha, hora, slots: newIds });
  });
}

// Cambia la fecha y hora de una cita.
export function moveReserva(reserva, fecha, hora) {
  return updateReserva(reserva, fecha, hora, { sinHorario: false }, reserva.duracion);
}

// Bloquea horarios de un día. Las citas que ocupaban esos horarios quedan sin horario (sinHorario),
// para que Grecia las reubique en otro día u hora desde la lista de citas del día.
export async function bloquearRango(fecha, bloques, afectadas) {
  const batch = writeBatch(db);
  afectadas.forEach((r) => {
    (r.slots ?? []).forEach((id) => batch.delete(doc(db, 'slots', id)));
    batch.update(doc(db, 'reservas', r.id), { slots: [], sinHorario: true });
  });
  bloques.forEach(({ hora, minutos }) => {
    const ref = doc(collection(db, 'reservas'));
    const ids = slotIdsFor(fecha, hora, minutos);
    batch.set(ref, {
      servicio: 'Horario bloqueado',
      precio: '',
      duracion: `${minutos} minutos`,
      fecha,
      hora,
      nombre: 'Bloqueado',
      telefono: '',
      instagram: '',
      preferencias: null,
      datos: '',
      estado: 'bloqueado',
      slots: ids,
      creado: serverTimestamp(),
    });
    ids.forEach((id) => {
      const [f, h] = id.split('_');
      batch.set(doc(db, 'slots', id), { fecha: f, hora: h, reservaId: ref.id });
    });
  });
  await batch.commit();
}

// Edita todo de una cita a la vez: datos de la clienta, servicio, fecha y hora.
// Solo guarda si el nuevo horario (según la duración del servicio) está libre.
export function editarReserva(reserva, { nombre, telefono, instagram, servicio, fecha, hora }) {
  const cambios = {
    nombre,
    telefono,
    instagram,
    servicio: servicio.name,
    precio: servicio.price,
    duracion: servicio.duration,
    sinHorario: false,
  };
  return updateReserva(reserva, fecha, hora, cambios, servicio.duration);
}

// Cambia el servicio (y su precio y duración) de una cita, conservando fecha y hora.
export function editReserva(reserva, servicio) {
  const cambios = { servicio: servicio.name, precio: servicio.price, duracion: servicio.duration };
  return updateReserva(reserva, reserva.fecha, reserva.hora, cambios, servicio.duration);
}

// Intercambia el horario de dos citas. Si alguno de los nuevos turnos está ocupado, no guarda nada.
export async function swapReservas(a, b) {
  const nuevosA = slotIdsFor(b.fecha, b.hora, durationMinutes(a.duracion));
  const nuevosB = slotIdsFor(a.fecha, a.hora, durationMinutes(b.duracion));
  if (nuevosA.some((id) => nuevosB.includes(id))) throw new Error('ocupado');

  const viejos = new Set([...(a.slots ?? []), ...(b.slots ?? [])]);
  const nuevos = new Map();
  nuevosA.forEach((id) => nuevos.set(id, a.id));
  nuevosB.forEach((id) => nuevos.set(id, b.id));

  await runTransaction(db, async (tx) => {
    for (const id of nuevos.keys()) {
      if (viejos.has(id)) continue;
      const slot = await tx.get(doc(db, 'slots', id));
      if (slot.exists()) throw new Error('ocupado');
    }
    viejos.forEach((id) => {
      if (!nuevos.has(id)) tx.delete(doc(db, 'slots', id));
    });
    nuevos.forEach((reservaId, id) => {
      const [f, h] = id.split('_');
      tx.set(doc(db, 'slots', id), { fecha: f, hora: h, reservaId });
    });
    tx.update(doc(db, 'reservas', a.id), { fecha: b.fecha, hora: b.hora, slots: nuevosA });
    tx.update(doc(db, 'reservas', b.id), { fecha: a.fecha, hora: a.hora, slots: nuevosB });
  });
}

// Solo se pueden mover o editar citas de un turno normal. Los cursos (varios días o franja fija) no.
export function esEditable(reserva) {
  if (reserva.sinHorario) return true;
  return (reserva.slots ?? []).length === durationMinutes(reserva.duracion) / 30;
}

// Borra una reserva y libera sus turnos.
export async function removeReserva(reserva) {
  const batch = writeBatch(db);
  (reserva.slots ?? []).forEach((id) => batch.delete(doc(db, 'slots', id)));
  batch.delete(doc(db, 'reservas', reserva.id));
  await batch.commit();
}
