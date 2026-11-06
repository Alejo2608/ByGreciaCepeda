import { useState } from 'react';
import { categories } from '../data/categories';
import { createReserva } from '../lib/reservas';
import {
  bloqueSlotIds,
  dayTimes,
  durationMinutes,
  enHorario,
  esDomingoDeDiciembre,
  formatHour,
  isBookableDay,
  isBreakTime,
  slotIdsFor,
  todayISO,
} from '../lib/schedule';
import Calendar from './Calendar';

const tipos = {
  pestanas: 'Pestañas',
  cejas: 'Cejas',
  'micro-brows': 'Micro brows',
  maquillaje: 'Maquillaje',
  cursos: 'Cursos',
};

const inputClass = 'mt-2 w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-sm outline-none focus:border-ink';

// Agendar una clienta desde el panel: la cita queda confirmada directamente.
// occupancy: turno "AAAA-MM-DD_HH:mm" → reserva que lo ocupa (viene del panel).
export default function AgendarClienta({ occupancy, onDone }) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tipo, setTipo] = useState('');
  const [servicioId, setServicioId] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const categoria = categories.find((c) => c.id === tipo);
  const servicios = categoria ? categoria.groups.flatMap((g) => g.items) : [];
  const servicio = servicios.find((s) => s.id === servicioId);
  const esMakeup = tipo === 'maquillaje';
  const permiteDomingo = esMakeup || tipo === 'cursos';
  const bloque = servicio?.bloque;
  const minutes = servicio ? durationMinutes(servicio.duration) : 0;

  // Horas libres de un día para el servicio elegido, según los turnos ocupados.
  const horasLibres = (f) => {
    if (!servicio || !f || !isBookableDay(f, { makeup: esMakeup, sunday: permiteDomingo })) return [];
    const ahora = new Date();
    const esHoy = f === todayISO();
    const nowHHMM = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
    if (bloque) {
      const libre = !esDomingoDeDiciembre(f) && bloqueSlotIds(f, bloque).every((id) => !occupancy[id]);
      return libre && (!esHoy || bloque.inicio > nowHHMM) ? [bloque.inicio] : [];
    }
    return dayTimes(esMakeup).filter(
      (h) =>
        !isBreakTime(h) &&
        enHorario(h, minutes, f, esMakeup) &&
        (!esHoy || h > nowHHMM) &&
        slotIdsFor(f, h, minutes).every((id) => !occupancy[id]),
    );
  };

  // Para los cursos la hora es siempre la de inicio de la franja.
  const horas = fecha ? horasLibres(fecha) : [];
  const horaElegida = bloque ? (horas[0] ?? '') : hora;

  const elegirTipo = (id) => {
    setTipo(id);
    setServicioId('');
    setFecha('');
    setHora('');
  };

  const elegirServicio = (id) => {
    setServicioId(id);
    setFecha('');
    setHora('');
  };

  const guardar = async () => {
    setError('');
    if (!nombre.trim() || !servicio || !fecha || !horaElegida) {
      setError('Escribe el nombre y elige servicio, fecha y hora.');
      return;
    }
    const slotIds = bloque ? bloqueSlotIds(fecha, bloque) : slotIdsFor(fecha, horaElegida, minutes);
    setSaving(true);
    try {
      await createReserva(
        {
          servicio: servicio.name,
          precio: servicio.price,
          duracion: servicio.duration,
          fecha,
          hora: horaElegida,
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          instagram: '',
          preferencias: null,
          datos: '',
          estado: 'confirmada',
        },
        slotIds,
      );
      onDone();
    } catch (err) {
      setError(err.message === 'ocupado' ? 'Ese horario ya está ocupado. Elige otro.' : 'No se pudo agendar la cita.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <label className="block text-sm">
        Nombre de la clienta
        <input className={inputClass} value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </label>
      <label className="block text-sm">
        Teléfono <span className="text-accent">(opcional)</span>
        <input type="tel" className={inputClass} value={telefono} onChange={(e) => setTelefono(e.target.value)} />
      </label>

      <fieldset>
        <legend className="text-sm">Tipo de servicio</legend>
        <div className="mt-2 flex flex-wrap gap-2 text-xs uppercase tracking-widest">
          {Object.entries(tipos).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => elegirTipo(id)}
              className={`rounded-full px-4 py-2 transition ${
                tipo === id ? 'bg-ink text-paper' : 'border border-ink/30 hover:bg-mist'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      {tipo && (
        <fieldset>
          <legend className="text-sm">Servicio</legend>
          <ul className="mt-2 space-y-2">
            {servicios.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => elegirServicio(item.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-2 text-left text-sm transition ${
                    servicioId === item.id ? 'bg-ink text-paper' : 'bg-mist/60 hover:bg-mist'
                  }`}
                >
                  <span>{item.name}</span>
                  <span className="text-xs">{item.price}</span>
                </button>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      {servicio && (
        <div>
          <p className="text-sm">Fecha</p>
          <div className="mt-2">
            <Calendar
              value={fecha}
              onChange={(d) => {
                setFecha(d);
                setHora('');
              }}
              isDisabled={(d) => d < todayISO() || !isBookableDay(d, { makeup: esMakeup, sunday: permiteDomingo }) || horasLibres(d).length === 0}
            />
          </div>
        </div>
      )}

      {fecha && (
        <fieldset>
          <legend className="text-sm">{bloque ? 'Horario del curso' : 'Hora'}</legend>
          {horas.length === 0 && (
            <p className="mt-2 text-sm text-accent">No hay horarios libres ese día para este servicio.</p>
          )}
          {bloque && horas.length > 0 && (
            <p className="mt-2 text-sm">
              {formatHour(bloque.inicio)} – {formatHour(bloque.fin)}
            </p>
          )}
          {!bloque && horas.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {horas.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHora(h)}
                  className={`rounded-xl px-2 py-2 text-sm transition ${
                    hora === h ? 'bg-ink text-paper' : 'bg-mist hover:bg-mist/60'
                  }`}
                >
                  {formatHour(h)}
                </button>
              ))}
            </div>
          )}
        </fieldset>
      )}

      {error && <p className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-ink">{error}</p>}

      <button type="button" onClick={guardar} disabled={saving} className="btn-fill w-full disabled:opacity-50">
        Agendar cita
      </button>
    </div>
  );
}
