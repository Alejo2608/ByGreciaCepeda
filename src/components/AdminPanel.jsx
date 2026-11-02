import { useEffect, useMemo, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { collection, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { ADMIN_EMAIL } from '../lib/admin';
import {
  bloquearRango,
  createReserva,
  editReserva,
  esEditable,
  moveReserva,
  removeReserva,
  swapReservas,
} from '../lib/reservas';
import { lashServices, browServices, microBrows, makeupServices } from '../data/services';
import {
  addDays,
  BREAK_END,
  BREAK_START,
  dayTimes,
  durationMinutes,
  fitsInDay,
  formatFecha,
  formatHour,
  isBreakTime,
  isOpenDay,
  slotIdsFor,
  todayISO,
} from '../lib/schedule';
import Calendar from './Calendar';
import ConfirmDialog from './ConfirmDialog';
import AdminModal from './AdminModal';

// Servicios que se pueden elegir al editar una cita.
const catalogo = [
  { title: 'Pestañas', items: lashServices },
  { title: 'Cejas', items: browServices },
  { title: 'Micro brows', items: microBrows },
  { title: 'Maquillaje', items: makeupServices },
];

// Bloqueos por grupo de horas: toda la mañana, toda la tarde o el día completo.
const bloqueosGrupo = [
  { id: 'manana', label: 'Turno mañana', texto: 'toda la mañana' },
  { id: 'tarde', label: 'Turno tarde', texto: 'toda la tarde' },
  { id: 'dia', label: 'Día completo', texto: 'el día completo' },
];

const statusLabel = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  bloqueado: 'Bloqueado',
};

// Elegir nueva fecha y hora para una cita confirmada.
function RescheduleBox({ reserva, onDone, onCancel }) {
  const [fecha, setFecha] = useState(reserva.fecha);
  const [hora, setHora] = useState('');
  const [busy, setBusy] = useState(new Set());
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const minutes = durationMinutes(reserva.duracion);
  // Las citas de maquillaje pueden ser en el horario amplio.
  const extended = Boolean(reserva.preferencias);
  const own = new Set(reserva.slots || []);

  useEffect(() => {
    if (!fecha || !isOpenDay(fecha, true)) {
      setBusy(new Set());
      return undefined;
    }
    let cancelled = false;
    getDocs(query(collection(db, 'slots'), where('fecha', '==', fecha)))
      .then((snap) => {
        if (!cancelled) setBusy(new Set(snap.docs.map((d) => d.id)));
      })
      .catch(() => {
        if (!cancelled) setMsg('No se pudieron cargar los horarios.');
      });
    return () => {
      cancelled = true;
    };
  }, [fecha]);

  const now = new Date();
  const nowHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const times =
    fecha && isOpenDay(fecha, true)
      ? dayTimes(extended).filter(
          (h) =>
            !isBreakTime(h) &&
            fitsInDay(h, minutes, extended) &&
            (fecha !== todayISO() || h > nowHHMM) &&
            slotIdsFor(fecha, h, minutes).every((id) => own.has(id) || !busy.has(id)),
        )
      : [];

  const save = async () => {
    if (!hora) {
      setMsg('Elige una hora.');
      return;
    }
    setSaving(true);
    try {
      await moveReserva(reserva, fecha, hora);
      onDone();
    } catch (err) {
      setMsg(err.message === 'ocupado' ? 'Ese horario ya está ocupado.' : 'No se pudo cambiar la cita.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 space-y-4 rounded-2xl bg-mist/60 p-4">
      <p className="text-xs uppercase tracking-widest text-accent">Cambiar fecha y hora</p>
      <Calendar
        value={fecha}
        onChange={(d) => {
          setFecha(d);
          setHora('');
        }}
        isDisabled={(d) => d < todayISO() || !isOpenDay(d, true)}
      />
      {fecha && isOpenDay(fecha, true) && (
        <div className="grid grid-cols-3 gap-2">
          {times.length === 0 && <p className="col-span-3 text-sm text-accent">No hay horarios libres ese día.</p>}
          {times.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHora(h)}
              className={`rounded-xl px-2 py-2 text-sm transition ${
                hora === h ? 'bg-ink text-paper' : 'bg-white hover:bg-mist'
              }`}
            >
              {formatHour(h)}
            </button>
          ))}
        </div>
      )}
      {msg && <p className="text-sm text-accent">{msg}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={save} disabled={saving} className="btn-fill px-5 py-2 text-xs disabled:opacity-50">
          Guardar cambio
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-ink/30 px-5 py-2 text-xs uppercase tracking-widest transition hover:bg-mist"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// Citas de hoy o mañana que se pueden intercambiar con la seleccionada.
function SwapList({ reserva, reservas, onPick }) {
  const siguiente = addDays(reserva.fecha, 1);
  const opciones = reservas
    .filter(
      (r) =>
        r.id !== reserva.id &&
        r.estado !== 'bloqueado' &&
        !r.sinHorario &&
        (r.fecha === reserva.fecha || r.fecha === siguiente) &&
        esEditable(r),
    )
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));

  if (opciones.length === 0) {
    return <p className="text-sm text-accent">No hay otras citas hoy ni mañana para intercambiar.</p>;
  }

  return (
    <ul className="space-y-2">
      {opciones.map((r) => (
        <li key={r.id}>
          <button
            type="button"
            onClick={() => onPick(r)}
            className="flex w-full items-center justify-between gap-3 rounded-xl bg-mist/60 px-4 py-3 text-left text-sm transition hover:bg-mist"
          >
            <span>
              {r.fecha === reserva.fecha ? 'Hoy' : 'Mañana'} · {formatHour(r.hora)} · {r.nombre}
            </span>
            <span className="text-xs text-accent">{r.servicio}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

// Servicios de la misma categoría que la cita (pestañas solo cambia a pestañas, etc.).
function EditList({ reserva, onPick }) {
  const grupo = catalogo.find((group) => group.items.some((item) => item.name === reserva.servicio));
  if (!grupo) return <p className="text-sm text-accent">Esta cita no se puede cambiar de servicio.</p>;

  return (
    <div className="space-y-5">
      {[grupo].map((group) => (
        <div key={group.title}>
          <p className="text-xs uppercase tracking-widest text-accent">{group.title}</p>
          <ul className="mt-2 space-y-2">
            {group.items.map((item) => {
              const actual = item.name === reserva.servicio;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onPick(item)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-2 text-left text-sm transition ${
                      actual ? 'bg-ink text-paper' : 'bg-mist/60 hover:bg-mist'
                    }`}
                  >
                    <span>{item.name}</span>
                    <span className="text-xs">{item.price}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

// Panel privado de Grecia (#admin): calendario, citas del día, confirmaciones y cambios.
export default function AdminPanel() {
  const [user, setUser] = useState(undefined);
  const [reservas, setReservas] = useState([]);
  const [fecha, setFecha] = useState(todayISO());
  const [grupoSel, setGrupoSel] = useState('manana'); // grupo elegido en la lista de bloqueo
  const [bloqueo, setBloqueo] = useState(null); // grupo por confirmar: 'manana' | 'tarde' | 'dia'
  const [message, setMessage] = useState('');
  const [releasing, setReleasing] = useState(null); // reserva por liberar o desbloquear
  const [turno, setTurno] = useState('manana');
  const [accion, setAccion] = useState(null); // { tipo: 'cambiar' | 'editar' | 'intercambiar', reserva }
  const [swapPending, setSwapPending] = useState(null); // { a, b } por confirmar

  const isAdmin = Boolean(user && user.email === ADMIN_EMAIL && user.emailVerified);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    if (!isAdmin) return undefined;
    return onSnapshot(collection(db, 'reservas'), (snap) => {
      setReservas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [isAdmin]);

  // Cuántas reservas hay por día (para marcar el calendario).
  const counts = useMemo(() => {
    const map = {};
    reservas.forEach((r) => {
      map[r.fecha] = (map[r.fecha] || 0) + 1;
    });
    return map;
  }, [reservas]);

  // Qué reserva ocupa cada turno: "AAAA-MM-DD_HH:mm" → reserva.
  const occupancy = useMemo(() => {
    const map = {};
    reservas.forEach((r) => (r.slots || []).forEach((id) => (map[id] = r)));
    return map;
  }, [reservas]);

  // Citas (sin bloqueos) del día seleccionado, en orden de hora.
  const citasDelDia = useMemo(
    () =>
      reservas
        .filter((r) => r.fecha === fecha && r.estado !== 'bloqueado')
        .sort((a, b) => a.hora.localeCompare(b.hora)),
    [reservas, fecha],
  );

  if (user === undefined) return <p className="px-6 py-40 text-center text-sm text-accent">Cargando…</p>;

  if (!isAdmin) {
    return (
      <section className="mx-auto max-w-md px-6 py-40 text-center">
        <h1 className="font-serif text-3xl">Panel de citas</h1>
        {user ? (
          <>
            <p className="mt-4 text-sm text-accent">Esta cuenta no tiene acceso.</p>
            <button type="button" onClick={() => signOut(auth)} className="btn-fill mt-6">
              Cerrar sesión
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => signInWithPopup(auth, new GoogleAuthProvider()).catch(() => setMessage('No se pudo iniciar sesión.'))}
            className="btn-fill mt-6"
          >
            Entrar con Google
          </button>
        )}
        {message && <p className="mt-4 text-sm text-accent">{message}</p>}
      </section>
    );
  }

  const confirmar = async (r) => {
    setMessage('');
    try {
      await updateDoc(doc(db, 'reservas', r.id), { estado: 'confirmada' });
    } catch {
      setMessage('No se pudo confirmar la cita. Intenta de nuevo.');
    }
  };

  // Pide confirmación en una ventana propia del panel (sin la del navegador).
  const liberar = (r) => setReleasing(r);

  const confirmarLiberar = async () => {
    const reserva = releasing;
    setReleasing(null);
    setMessage('');
    try {
      await removeReserva(reserva);
    } catch {
      setMessage('No se pudo liberar el horario. Intenta de nuevo.');
    }
  };

  const guardarEdicion = async (servicio) => {
    const reserva = accion.reserva;
    setAccion(null);
    setMessage('');
    try {
      await editReserva(reserva, servicio);
    } catch (err) {
      setMessage(
        err.message === 'ocupado'
          ? 'Con ese servicio la cita se cruza con otra. Elige otro horario.'
          : 'No se pudo editar la cita.',
      );
    }
  };

  const confirmarSwap = async () => {
    const { a, b } = swapPending;
    setSwapPending(null);
    setAccion(null);
    setMessage('');
    try {
      await swapReservas(a, b);
    } catch (err) {
      setMessage(
        err.message === 'ocupado' ? 'No se pudo intercambiar: alguno de los horarios ya está ocupado.' : 'No se pudo intercambiar.',
      );
    }
  };

  const bloquear = async (hora) => {
    setMessage('');
    try {
      await createReserva(
        {
          servicio: 'Horario bloqueado',
          precio: '',
          duracion: '1 hora',
          fecha,
          hora,
          nombre: 'Bloqueado',
          telefono: '',
          instagram: '',
          preferencias: null,
          datos: '',
          estado: 'bloqueado',
        },
        slotIdsFor(fecha, hora, 60),
      );
    } catch (err) {
      setMessage(err.message === 'ocupado' ? 'Ese horario ya está ocupado o apartado.' : 'No se pudo bloquear.');
    }
  };

  // Un grupo es la mañana, la tarde o el día completo.
  const enGrupo = (grupo, hora) => grupo === 'dia' || (grupo === 'manana' ? hora < BREAK_START : hora >= BREAK_END);
  const bloqueosDeGrupo = (grupo) =>
    reservas.filter(
      (r) =>
        r.fecha === fecha && r.estado === 'bloqueado' && (r.slots ?? []).some((id) => enGrupo(grupo, id.split('_')[1])),
    );

  const afectadasGrupo = (grupo) =>
    reservas.filter(
      (r) =>
        r.fecha === fecha && r.estado !== 'bloqueado' && (r.slots ?? []).some((id) => enGrupo(grupo, id.split('_')[1])),
    );

  // Bloquea las horas libres del grupo. Las citas que caen en ese grupo se quitan de la hora y quedan
  // en la lista como "Sin horario", para que Grecia las cambie de día u hora.
  const bloquearGrupo = async (grupo) => {
    setMessage('');
    const bloqueadas = new Set(bloqueosDeGrupo(grupo).flatMap((r) => r.slots ?? []));
    const grupos = [];
    dayTimes(true).forEach((hora) => {
      const libre = !isBreakTime(hora) && enGrupo(grupo, hora) && !bloqueadas.has(`${fecha}_${hora}`);
      if (!libre) {
        grupos.push(null);
        return;
      }
      const ultimo = grupos[grupos.length - 1];
      if (ultimo) ultimo.push(hora);
      else grupos.push([hora]);
    });
    const bloques = grupos.filter(Boolean).map((horas) => ({ hora: horas[0], minutos: horas.length * 30 }));
    if (bloques.length === 0) {
      setMessage('No hay horas libres en este grupo.');
      return;
    }
    try {
      await bloquearRango(fecha, bloques, afectadasGrupo(grupo));
    } catch {
      setMessage('No se pudo bloquear.');
    }
  };

  // Quita los bloqueos del grupo, para corregir un error.
  const desbloquearGrupo = async (grupo) => {
    setMessage('');
    try {
      for (const r of bloqueosDeGrupo(grupo)) await removeReserva(r);
    } catch {
      setMessage('No se pudo desbloquear.');
    }
  };

  // Filas del día: una por hora de atención.
  const rows = dayTimes(true).map((hora) => {
    const reserva = occupancy[`${fecha}_${hora}`];
    return { hora, reserva, esInicio: reserva && reserva.hora === hora, almuerzo: isBreakTime(hora) };
  });

  const dayAvailable = fecha && isOpenDay(fecha, true);

  // Las horas se muestran por turno: mañana (antes del almuerzo) y tarde (después del almuerzo).
  const rowsTurno = rows.filter(
    ({ hora, almuerzo }) => !almuerzo && (turno === 'manana' ? hora < BREAK_START : hora >= BREAK_END),
  );

  return (
    <section className="mx-auto max-w-5xl px-4 py-32">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Panel de citas</h1>
        <button type="button" onClick={() => signOut(auth)} className="text-xs uppercase tracking-widest text-accent hover:text-ink">
          Cerrar sesión
        </button>
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-[1.1fr_1fr]">
        <div>
          <Calendar value={fecha} onChange={setFecha} counts={counts} size="large" />
          <p className="mt-3 text-xs text-accent">Los puntos marcan los días con citas o bloqueos.</p>

          <div className="mt-8">
            <p className="font-serif text-2xl capitalize">Citas del día</p>
            <p className="text-xs uppercase tracking-widest text-accent capitalize">{formatFecha(fecha)}</p>
            {citasDelDia.length === 0 && <p className="mt-4 text-sm text-accent">No hay citas para este día.</p>}
            <ul className="mt-4 space-y-3">
              {citasDelDia.map((r) => (
                <li key={r.id} className="rounded-xl bg-white/70 px-4 py-3 ring-1 ring-mist">
                  <p className="text-sm font-medium">
                    {formatHour(r.hora)} · {r.nombre}
                  </p>
                  <p className="text-xs text-accent">
                    {r.servicio} · {r.duracion} · {r.telefono}
                    {r.instagram && ` · ${r.instagram}`}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-accent">
                    {r.sinHorario ? 'Sin horario' : statusLabel[r.estado]}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-widest">
                    {esEditable(r) && (
                      <button
                        type="button"
                        onClick={() => setAccion({ tipo: 'cambiar', reserva: r })}
                        className="rounded-full border border-ink/30 px-3 py-1 transition hover:bg-mist"
                      >
                        {r.sinHorario ? 'Asignar horario' : 'Cambiar'}
                      </button>
                    )}
                    {esEditable(r) && !r.sinHorario && (
                      <>
                        <button
                          type="button"
                          onClick={() => setAccion({ tipo: 'editar', reserva: r })}
                          className="rounded-full border border-ink/30 px-3 py-1 transition hover:bg-mist"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setAccion({ tipo: 'intercambiar', reserva: r })}
                          className="rounded-full border border-ink/30 px-3 py-1 transition hover:bg-mist"
                        >
                          Intercambiar
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => liberar(r)}
                      className="rounded-full border border-ink/30 px-3 py-1 transition hover:bg-mist"
                    >
                      Liberar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <p className="font-serif text-2xl capitalize">{formatFecha(fecha)}</p>
          {!dayAvailable && <p className="mt-3 text-sm text-accent">Ese día el local está cerrado.</p>}

          {dayAvailable && (
            <>
              <div className="mt-4 flex items-center gap-3 text-sm">
                <select
                  aria-label="Qué bloquear"
                  className="rounded-xl border border-ink/20 bg-white px-3 py-2 text-sm"
                  value={grupoSel}
                  onChange={(e) => setGrupoSel(e.target.value)}
                >
                  {bloqueosGrupo.map(({ id, label }) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setBloqueo({ tipo: 'bloquear', grupo: grupoSel })}
                  className="btn-fill px-5 py-2 text-xs"
                >
                  Bloquear
                </button>
                <button
                  type="button"
                  onClick={() => setBloqueo({ tipo: 'desbloquear', grupo: grupoSel })}
                  disabled={bloqueosDeGrupo(grupoSel).length === 0}
                  className="rounded-full border border-ink/30 px-5 py-2 text-xs uppercase tracking-widest transition hover:bg-mist disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  Desbloquear
                </button>
              </div>

              <div className="mt-6 flex gap-2 text-xs uppercase tracking-widest">
                {[
                  ['manana', 'Mañana'],
                  ['tarde', 'Tarde'],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTurno(id)}
                    className={`rounded-full px-4 py-2 transition ${
                      turno === id ? 'bg-ink text-paper' : 'border border-ink/30 hover:bg-mist'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <ul className="mt-4 space-y-2">
                {rowsTurno.map(({ hora, reserva, esInicio, almuerzo }) => (
                  <li key={hora} className="rounded-xl bg-white/70 px-4 py-3 ring-1 ring-mist">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="w-20 text-sm font-medium">{formatHour(hora)}</span>

                      {almuerzo && <span className="text-sm text-accent">Almuerzo</span>}

                      {!almuerzo && !reserva && (
                        <>
                          <span className="text-sm text-accent">Libre</span>
                          <button
                            type="button"
                            onClick={() => bloquear(hora)}
                            className="rounded-full border border-ink/30 px-4 py-1 text-xs uppercase tracking-widest transition hover:bg-mist"
                          >
                            Bloquear
                          </button>
                        </>
                      )}

                      {!almuerzo && reserva && !esInicio && (
                        <span className="text-sm text-accent">
                          {statusLabel[reserva.estado]} · {reserva.nombre} (continúa)
                        </span>
                      )}

                      {!almuerzo && reserva && esInicio && (
                        <div className="flex flex-1 flex-wrap items-center justify-between gap-3">
                          <div className="text-sm">
                            <p className="font-medium">
                              {statusLabel[reserva.estado]} · {reserva.nombre}
                            </p>
                            {reserva.estado !== 'bloqueado' && (
                              <p className="text-xs text-accent">
                                {reserva.servicio} · {reserva.telefono}
                                {reserva.instagram && ` · ${reserva.instagram}`}
                              </p>
                            )}
                            {reserva.datos && <p className="mt-1 text-xs text-ink/75">{reserva.datos}</p>}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {reserva.estado === 'pendiente' && (
                              <button type="button" onClick={() => confirmar(reserva)} className="btn-fill px-4 py-1 text-xs">
                                Confirmar
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => liberar(reserva)}
                              className="rounded-full border border-ink/30 px-4 py-1 text-xs uppercase tracking-widest transition hover:bg-mist"
                            >
                              {reserva.estado === 'bloqueado' ? 'Desbloquear' : 'Cancelar cita'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                  </li>
                ))}
              </ul>
            </>
          )}

          {message && <p className="mt-4 text-sm text-accent">{message}</p>}
        </div>
      </div>

      {accion?.tipo === 'cambiar' && (
        <AdminModal title="Cambiar hora" onClose={() => setAccion(null)}>
          <RescheduleBox reserva={accion.reserva} onDone={() => setAccion(null)} onCancel={() => setAccion(null)} />
        </AdminModal>
      )}

      {accion?.tipo === 'editar' && (
        <AdminModal title="Editar servicio" onClose={() => setAccion(null)}>
          <p className="mb-5 text-sm text-accent">
            {accion.reserva.nombre} · {formatFecha(accion.reserva.fecha)} · {formatHour(accion.reserva.hora)}
          </p>
          <EditList reserva={accion.reserva} onPick={guardarEdicion} />
        </AdminModal>
      )}

      {accion?.tipo === 'intercambiar' && (
        <AdminModal title="Intercambiar horario" onClose={() => setAccion(null)}>
          <p className="mb-5 text-sm text-accent">
            {accion.reserva.nombre} · {formatHour(accion.reserva.hora)}. Elige con quién cambiar.
          </p>
          <SwapList
            reserva={accion.reserva}
            reservas={reservas}
            onPick={(otra) => setSwapPending({ a: accion.reserva, b: otra })}
          />
        </AdminModal>
      )}

      <ConfirmDialog
        open={Boolean(bloqueo)}
        title={bloqueo?.tipo === 'bloquear' ? 'Bloquear horarios' : 'Desbloquear horarios'}
        message={
          bloqueo?.tipo === 'bloquear'
            ? `Se bloquearán las horas libres de ${bloqueosGrupo.find((g) => g.id === bloqueo.grupo)?.texto} del ${formatFecha(fecha)}.${
                bloqueo.grupo && afectadasGrupo(bloqueo.grupo).length > 0
                  ? ` ${afectadasGrupo(bloqueo.grupo).length} cita(s) quedarán sin horario en la lista para cambiarlas de día u hora.`
                  : ''
              }`
            : `Se quitarán los bloqueos de ${bloqueosGrupo.find((g) => g.id === bloqueo?.grupo)?.texto} del ${formatFecha(fecha)}.`
        }
        confirmLabel={bloqueo?.tipo === 'bloquear' ? 'Sí, bloquear' : 'Sí, desbloquear'}
        onConfirm={() => {
          const { tipo, grupo } = bloqueo;
          setBloqueo(null);
          if (tipo === 'bloquear') bloquearGrupo(grupo);
          else desbloquearGrupo(grupo);
        }}
        onClose={() => setBloqueo(null)}
      />

      <ConfirmDialog
        open={Boolean(swapPending)}
        title="Intercambiar horarios"
        message={
          swapPending
            ? `${swapPending.a.nombre} pasará a ${formatHour(swapPending.b.hora)} del ${formatFecha(swapPending.b.fecha)}, y ${swapPending.b.nombre} pasará a ${formatHour(swapPending.a.hora)} del ${formatFecha(swapPending.a.fecha)}.`
            : ''
        }
        confirmLabel="Sí, intercambiar"
        onConfirm={confirmarSwap}
        onClose={() => setSwapPending(null)}
      />

      <ConfirmDialog
        open={Boolean(releasing)}
        title={releasing?.estado === 'bloqueado' ? 'Desbloquear horario' : 'Cancelar cita'}
        message={
          releasing?.estado === 'bloqueado'
            ? '¿Quieres desbloquear este horario?'
            : `¿Quieres cancelar la cita de ${releasing?.nombre}? Se libera el horario.`
        }
        confirmLabel={releasing?.estado === 'bloqueado' ? 'Desbloquear' : 'Sí, cancelar'}
        onConfirm={confirmarLiberar}
        onClose={() => setReleasing(null)}
      />
    </section>
  );
}
