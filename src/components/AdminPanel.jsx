import { useEffect, useMemo, useRef, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, limit, onSnapshot, orderBy, query, updateDoc, where, writeBatch } from 'firebase/firestore';
import Campana from './Campana';
import { auth, db } from '../lib/firebase';
import { esAdmin } from '../lib/admin';
import {
  bloquearRango,
  createReserva,
  archivarDia,
  editarReserva,
  esEditable,
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
  enHorario,
  formatFecha,
  formatHour,
  isBreakTime,
  isOpenDay,
  slotIdsFor,
  todayISO,
} from '../lib/schedule';
import Calendar from './Calendar';
import Historial from './Historial';
import Deudoras from './Deudoras';
import PorConfirmar from './PorConfirmar';
import { activarNotificaciones, notificacionesDisponibles } from '../lib/notificaciones';
import { abrirWhatsApp, enlaceWhatsAppClienta, mensajePagoPendiente, mensajeRecordatorio } from '../lib/recordatorio';
import ConfirmDialog from './ConfirmDialog';
import AdminModal from './AdminModal';
import AgendarClienta from './AgendarClienta';

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
  pendiente: 'Por confirmar',
  confirmada: 'Confirmada',
  bloqueado: 'Bloqueado',
};

// Solicitud pendiente: fondo negro claro de la paleta (accent) con textos claros. Cita confirmada: blanca.
const estadoFondo = {
  pendiente:
    'bg-accent text-paper ring-accent [&_.text-accent]:text-paper/80 [&_.text-red-600]:text-red-300 [&_.text-green-700]:text-green-300 [&_.btn-fill]:border-paper [&_.btn-fill]:text-paper',
  confirmada: 'bg-white ring-mist',
};
const estadoTexto = {
  pendiente: 'text-red-600',
  confirmada: 'text-green-700',
};

// Editar una cita: datos de la clienta, servicio, fecha y hora en un solo formulario.
function EditarCita({ reserva, onDone, onCancel }) {
  const [nombre, setNombre] = useState(reserva.nombre ?? '');
  const [telefono, setTelefono] = useState(reserva.telefono ?? '');
  const [instagram, setInstagram] = useState(reserva.instagram ?? '');
  const [servicio, setServicio] = useState(
    () => catalogo.flatMap((group) => group.items).find((item) => item.name === reserva.servicio) ?? null,
  );
  const [fecha, setFecha] = useState(reserva.fecha);
  const [hora, setHora] = useState(reserva.sinHorario ? '' : reserva.hora);
  const [busy, setBusy] = useState(new Set());
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const minutes = durationMinutes(servicio?.duration ?? reserva.duracion);
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
            enHorario(h, minutes, fecha, extended) &&
            (fecha !== todayISO() || h > nowHHMM) &&
            slotIdsFor(fecha, h, minutes).every((id) => own.has(id) || !busy.has(id)),
        )
      : [];

  const save = async () => {
    if (!nombre.trim()) {
      setMsg('Escribe el nombre de la clienta.');
      return;
    }
    if (!servicio) {
      setMsg('Elige un servicio.');
      return;
    }
    if (!hora || !times.includes(hora)) {
      setMsg('Elige una hora disponible.');
      return;
    }
    setSaving(true);
    setMsg('');
    try {
      await editarReserva(reserva, {
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        instagram: instagram.trim(),
        servicio,
        fecha,
        hora,
      });
      onDone();
    } catch (err) {
      setMsg(err.message === 'ocupado' ? 'Ese horario ya está ocupado.' : 'No se pudo guardar la cita.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 space-y-5">
      <div className="space-y-3">
        {[
          ['Nombre', nombre, setNombre],
          ['Teléfono', telefono, setTelefono],
          ['Instagram', instagram, setInstagram],
        ].map(([label, value, set]) => (
          <label key={label} className="block text-xs uppercase tracking-widest text-accent">
            {label}
            <input
              value={value}
              onChange={(e) => set(e.target.value)}
              className="mt-1 w-full rounded-xl bg-white px-4 py-2 text-sm normal-case tracking-normal text-ink ring-1 ring-mist focus:outline-none focus:ring-ink/40"
            />
          </label>
        ))}
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-accent">Servicio</p>
        <div className="mt-2">
          <EditList reserva={reserva} selected={servicio?.name} onPick={setServicio} />
        </div>
      </div>

      <div className="space-y-4 rounded-2xl bg-mist/60 p-4">
        <p className="text-xs uppercase tracking-widest text-accent">Fecha y hora</p>
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
      </div>
      {msg && <p className="text-sm text-accent">{msg}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={save} disabled={saving} className="btn-fill px-5 py-2 text-xs disabled:opacity-50">
          Guardar cambios
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
function EditList({ reserva, selected, onPick }) {
  const grupo = catalogo.find((group) => group.items.some((item) => item.name === reserva.servicio));
  if (!grupo) return <p className="text-sm text-accent">Esta cita no se puede cambiar de servicio.</p>;

  return (
    <div className="space-y-5">
      {[grupo].map((group) => (
        <div key={group.title}>
          <p className="text-xs uppercase tracking-widest text-accent">{group.title}</p>
          <ul className="mt-2 space-y-2">
            {group.items.map((item) => {
              const actual = item.name === selected;
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
  const [reservasDelServidor, setReservasDelServidor] = useState(false); // true solo con la lista completa del servidor
  const [fecha, setFecha] = useState(todayISO());
  const [grupoSel, setGrupoSel] = useState('manana'); // grupo elegido en la lista de bloqueo
  const [bloqueo, setBloqueo] = useState(null); // grupo por confirmar: 'manana' | 'tarde' | 'dia'
  const [message, setMessage] = useState('');
  const [releasing, setReleasing] = useState(null); // reserva por liberar o desbloquear
  const [turno, setTurno] = useState('manana');
  const [accion, setAccion] = useState(null); // { tipo: 'editar' | 'intercambiar', reserva }
  const [swapPending, setSwapPending] = useState(null); // { a, b } por confirmar
  const [avisos, setAvisos] = useState([]); // avisos de días archivados, hasta que Grecia los cierre
  const [archivo, setArchivo] = useState([]); // clientas ya atendidas (colección archivo)
  const [pestana, setPestana] = useState('agenda'); // sección visible: 'agenda' | 'historial'
  const [notifEstado, setNotifEstado] = useState('inactivas'); // avisos push: inactivas | activando | activas | bloqueadas | error
  const [notificaciones, setNotificaciones] = useState([]); // avisos de la campana (solicitudes y recordatorios)
  const [recordatorioSinTelefono, setRecordatorioSinTelefono] = useState(null); // { texto } cuando la cita no tiene teléfono
  const [copiado, setCopiado] = useState(false);
  const [preguntarAvisos, setPreguntarAvisos] = useState(false); // pregunta única para activar los avisos
  const archivando = useRef(new Set()); // días que se están archivando (evita repetir)

  const isAdmin = esAdmin(user);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  // Cuando la app vuelve al primer plano (iPhone), se vuelve a conectar para traer los cambios al instante.
  const [reconexion, setReconexion] = useState(0);
  useEffect(() => {
    const alVolver = () => {
      if (document.visibilityState === 'visible') setReconexion((n) => n + 1);
    };
    document.addEventListener('visibilitychange', alVolver);
    window.addEventListener('focus', alVolver);
    return () => {
      document.removeEventListener('visibilitychange', alVolver);
      window.removeEventListener('focus', alVolver);
    };
  }, []);

  useEffect(() => {
    if (!isAdmin) return undefined;
    // includeMetadataChanges: avisa también cuando el servidor confirma la lista, para saber si viene completa.
    setReservasDelServidor(false);
    return onSnapshot(collection(db, 'reservas'), { includeMetadataChanges: true }, (snap) => {
      setReservas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setReservasDelServidor(!snap.metadata.fromCache && !snap.metadata.hasPendingWrites);
    });
  }, [isAdmin, reconexion]);

  // Cuántas reservas hay por día (para marcar el calendario).
  // Los bloqueos de días ya pasados no cuentan: su punto se quita cuando el día termina.
  const counts = useMemo(() => {
    const map = {};
    const hoy = todayISO();
    reservas.forEach((r) => {
      if (r.estado === 'bloqueado' && r.fecha < hoy) return;
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

  // Si el panel se abre desde una notificación (#admin?fecha=AAAA-MM-DD), muestra ese día en la agenda.
  useEffect(() => {
    const leerFecha = () => {
      const m = window.location.hash.match(/fecha=(\d{4}-\d{2}-\d{2})/);
      if (m) {
        setFecha(m[1]);
        setPestana('agenda');
      }
    };
    leerFecha();
    window.addEventListener('hashchange', leerFecha);
    return () => window.removeEventListener('hashchange', leerFecha);
  }, []);

  // Primera vez que entra Grecia: se pregunta una sola vez si quiere recibir avisos en este celular.
  // Si ya dio permiso antes, se registra el dispositivo sin preguntar de nuevo.
  useEffect(() => {
    if (!isAdmin || !notificacionesDisponibles()) return;
    if (Notification.permission === 'granted') {
      activarNotificaciones(user.email).then(() => setNotifEstado('activas')).catch(() => {});
      return;
    }
    let yaPregunto = false;
    try {
      yaPregunto = localStorage.getItem('avisosPreguntados') === '1';
    } catch {
      yaPregunto = false;
    }
    if (!yaPregunto && Notification.permission === 'default') setPreguntarAvisos(true);
  }, [isAdmin, user]);

  // Notificaciones guardadas (solicitudes nuevas y recordatorios diarios), las más recientes primero.
  // Las de más de 24 horas se borran solas.
  const VIGENCIA_MS = 24 * 60 * 60 * 1000;
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const tic = setInterval(() => setAhora(Date.now()), 60 * 1000);
    return () => clearInterval(tic);
  }, []);

  useEffect(() => {
    if (!isAdmin) return undefined;
    const consulta = query(collection(db, 'notificaciones'), orderBy('creado', 'desc'), limit(50));
    return onSnapshot(consulta, (snap) => {
      const limite = Date.now() - VIGENCIA_MS;
      const vigentes = [];
      snap.docs.forEach((d) => {
        const creado = d.data().creado?.toMillis?.() ?? Date.now();
        if (creado < limite) {
          deleteDoc(d.ref).catch(() => {});
        } else {
          vigentes.push({ id: d.id, ...d.data() });
        }
      });
      setNotificaciones(vigentes);
    });
  }, [isAdmin, reconexion]);

  // Lo que se muestra en la campana: solo lo de las últimas 24 horas.
  const avisosVisibles = useMemo(
    () => notificaciones.filter((a) => (a.creado?.toMillis?.() ?? ahora) >= ahora - VIGENCIA_MS),
    [notificaciones, ahora],
  );

  // Recordatorio de cita: con teléfono abre el chat de WhatsApp con el mensaje listo;
  // sin teléfono muestra el texto para copiarlo y enviarlo a mano.
  const recordarCita = (r) => {
    const texto = mensajeRecordatorio(r);
    const enlace = enlaceWhatsAppClienta(r.telefono, texto);
    if (enlace) {
      abrirWhatsApp(enlace);
    } else {
      setCopiado(false);
      setRecordatorioSinTelefono({ texto });
    }
  };

  // Recordatorio de pago de una clienta: mismo criterio que Recordar cita.
  const recordarPago = (clienta) => {
    const texto = mensajePagoPendiente(clienta.nombre, clienta.citas, clienta.total);
    const enlace = enlaceWhatsAppClienta(clienta.telefono, texto);
    if (enlace) {
      abrirWhatsApp(enlace);
    } else {
      setCopiado(false);
      setRecordatorioSinTelefono({ texto });
    }
  };

  // Quita una notificación de la campana.
  const eliminarAviso = async (a) => {
    try {
      await deleteDoc(doc(db, 'notificaciones', a.id));
    } catch {
      setMessage('No se pudo eliminar la notificación.');
    }
  };

  // Al abrir la campana se marcan como leídas.
  const marcarAvisosLeidos = async () => {
    const pendientes = notificaciones.filter((a) => !a.leida);
    if (pendientes.length === 0) return;
    try {
      const lote = writeBatch(db);
      pendientes.forEach((a) => lote.update(doc(db, 'notificaciones', a.id), { leida: true }));
      await lote.commit();
    } catch {
      /* si falla, el aviso sigue sin leer y se vuelve a intentar al abrir */
    }
  };

  // Va al día del aviso en la agenda.
  const irAAviso = (a) => {
    setFecha(a.fecha);
    setPestana('agenda');
    setTimeout(() => document.getElementById('citas-del-dia')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  };

  // Clientas ya atendidas, para la sección de días anteriores.
  useEffect(() => {
    if (!isAdmin) return undefined;
    return onSnapshot(collection(db, 'archivo'), (snap) => {
      setArchivo(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [isAdmin, reconexion]);

  // Días que YA TERMINARON (antes de hoy) en los que todas las citas están pagadas: se archivan solos y se avisa a Grecia.
  // Nunca se archiva el día de hoy (las citas pagadas por adelantado todavía no se atendieron), y solo se decide con
  // la lista completa del servidor: una lista parcial de la memoria del celular podría parecer "todo pagado" sin serlo.
  useEffect(() => {
    if (!isAdmin || !reservasDelServidor) return;
    const grupos = {};
    reservas
      .filter((r) => r.estado !== 'bloqueado')
      .forEach((r) => {
        (grupos[r.fecha] ??= []).push(r);
      });
    const pagados = Object.keys(grupos).filter(
      (f) => f < todayISO() && grupos[f].every((r) => r.estado === 'confirmada' && r.pagado === true),
    );
    // Si un día deja de estar pagado (p. ej. una cita nueva), se puede volver a archivar más adelante.
    archivando.current.forEach((f) => {
      if (!pagados.includes(f)) archivando.current.delete(f);
    });
    pagados.forEach((f) => {
      if (archivando.current.has(f)) return;
      archivando.current.add(f);
      const lista = grupos[f];
      archivarDia(lista)
        .then(() =>
          setAvisos((a) => [
            ...a,
            `Ya atendiste a todas las clientas del ${formatFecha(f)} y todas pagaron. Se archivaron ${lista.length} cita${lista.length === 1 ? '' : 's'}.`,
          ]),
        )
        .catch(() => {
          archivando.current.delete(f);
          setMessage('No se pudo archivar el día. Se intentará de nuevo.');
        });
    });
  }, [reservas, isAdmin, reservasDelServidor]);

  if (user === undefined) return <p className="px-6 py-40 text-center text-sm text-accent">Cargando…</p>;

  if (!isAdmin) {
    return (
      <section className="mx-auto max-w-md px-6 py-40 text-center">
        <h1 className="whitespace-nowrap font-serif text-3xl sm:text-4xl">Panel de citas</h1>
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

  // Activa los avisos en este celular (se llama desde un toque, como exige iPhone).
  const activarAvisos = async () => {
    setNotifEstado('activando');
    try {
      await activarNotificaciones(user.email);
      setNotifEstado('activas');
    } catch (err) {
      setNotifEstado(err.message === 'sin-permiso' ? 'bloqueadas' : 'error');
    }
  };

  const responderPregunta = (quiere) => {
    try {
      localStorage.setItem('avisosPreguntados', '1');
    } catch {
      /* si el navegador no guarda datos, la pregunta puede volver a salir */
    }
    setPreguntarAvisos(false);
    if (quiere) activarAvisos();
  };

  const confirmar = async (r) => {
    setMessage('');
    try {
      await updateDoc(doc(db, 'reservas', r.id), { estado: 'confirmada' });
    } catch {
      setMessage('No se pudo confirmar la cita. Intenta de nuevo.');
    }
  };

  // Marca la cita como pagada o no pagada. Las citas viejas sin el campo cuentan como no pagadas.
  const cambiarPago = async (r) => {
    setMessage('');
    try {
      await updateDoc(doc(db, 'reservas', r.id), { pagado: !(r.pagado === true) });
    } catch {
      setMessage('No se pudo actualizar el pago. Intenta de nuevo.');
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
    <section className="mx-auto w-full min-w-0 max-w-5xl px-4 py-32">
      <div className="flex items-center justify-between">
        <h1 className="whitespace-nowrap font-serif text-3xl sm:text-4xl">Panel de citas</h1>
        <div className="flex items-center gap-5">
          <button type="button" onClick={() => signOut(auth)} className="text-xs uppercase tracking-widest text-accent hover:text-ink">
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Campana: solicitudes nuevas y recordatorios del día siguiente. */}
      <Campana
        avisos={avisosVisibles}
        onIr={irAAviso}
        onAbrir={marcarAvisosLeidos}
        onEliminar={eliminarAviso}
        mostrarActivar={notificacionesDisponibles() && notifEstado !== 'activas'}
        activando={notifEstado === 'activando'}
        onActivar={activarAvisos}
      />

      <nav aria-label="Secciones del panel" className="mt-8 flex gap-1.5 overflow-x-auto border-b border-ink/10 pb-3 text-xs uppercase tracking-widest sm:gap-2">
        {[
          ['agenda', 'Agenda'],
          ['cobrar', 'Por cobrar'],
          ['confirmar', 'Por confirmar'],
          ['historial', 'Historial'],
        ].map(([id, texto]) => (
          <button
            key={id}
            type="button"
            aria-current={pestana === id ? 'page' : undefined}
            onClick={() => setPestana(id)}
            className={`rounded-full px-5 py-2 transition ${
              pestana === id ? 'bg-ink text-paper' : 'text-accent hover:bg-mist'
            }`}
          >
            {texto}
          </button>
        ))}
      </nav>

      {pestana === 'agenda' && (
      <div className="mt-10 grid min-w-0 grid-cols-1 gap-8 md:grid-cols-[1.1fr_1fr]">
        <div>
          <Calendar value={fecha} onChange={setFecha} counts={counts} size="large" />
          <p className="mt-3 text-xs text-accent">Los puntos marcan los días con citas o bloqueos.</p>

          <div className="mt-8" id="citas-del-dia">
            <div className="flex items-center justify-between gap-3">
              <p className="font-serif text-2xl capitalize">Citas del día</p>
              <button
                type="button"
                onClick={() => setAccion({ tipo: 'agendar' })}
                className="rounded-full border border-ink/30 px-4 py-2 text-xs uppercase tracking-widest transition hover:bg-mist"
              >
                Agendar clienta
              </button>
            </div>
            <p className="text-xs uppercase tracking-widest text-accent capitalize">{formatFecha(fecha)}</p>
            {citasDelDia.length === 0 && <p className="mt-4 text-sm text-accent">No hay citas para este día.</p>}
            <ul className="mt-4 space-y-3">
              {citasDelDia.map((r) => (
                <li key={r.id} className={`rounded-2xl px-5 py-4 ring-1 ${estadoFondo[r.estado] ?? 'bg-white/70 ring-mist'}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-medium">
                        {formatHour(r.hora)} · {r.nombre}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-accent">
                        {r.servicio} · {r.duracion}
                      </p>
                      <p className="text-xs leading-relaxed text-accent">
                        {r.telefono}
                        {r.instagram && ` · ${r.instagram}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-row flex-wrap gap-2 text-[11px] uppercase tracking-widest sm:items-start">
                      <span
                        className={`rounded-full px-3 py-1 text-white ${
                          r.sinHorario
                            ? 'bg-accent'
                            : r.estado === 'confirmada'
                              ? 'bg-green-700'
                              : 'bg-red-600'
                        }`}
                      >
                        {r.sinHorario ? 'Sin horario' : statusLabel[r.estado]}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 font-medium text-white ${
                          r.pagado === true ? 'bg-green-700' : 'bg-red-600'
                        }`}
                      >
                        {r.pagado === true ? 'Pagado' : 'No pagado'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-nowrap gap-1.5 border-t border-ink/10 pt-4 text-[11px] uppercase tracking-wider [&>button]:flex-1 [&>button]:whitespace-nowrap [&>button]:px-2 sm:gap-2 sm:text-xs sm:[&>button]:flex-none sm:[&>button]:px-3">
                    {!r.sinHorario && r.estado === 'confirmada' && (
                      <button
                        type="button"
                        onClick={() => recordarCita(r)}
                        className="rounded-full border border-ink/30 px-3 py-1 text-xs normal-case tracking-normal transition hover:bg-mist"
                      >
                        Recordar
                      </button>
                    )}
                    {r.estado === 'pendiente' && !r.sinHorario && (
                      <button
                        type="button"
                        onClick={() => confirmar(r)}
                        className="btn-fill flex-1 whitespace-nowrap px-2 py-1.5 text-[11px] normal-case tracking-normal sm:flex-none sm:px-3 sm:text-xs"
                      >
                        Confirmar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => cambiarPago(r)}
                      className="rounded-full border border-ink/30 px-3 py-1 transition hover:bg-mist"
                    >
                      {r.pagado === true ? 'Marcar no pagado' : 'Marcar pagado'}
                    </button>
                    {esEditable(r) && (
                      <button
                        type="button"
                        onClick={() => setAccion({ tipo: 'editar', reserva: r })}
                        className="rounded-full border border-ink/30 px-3 py-1 transition hover:bg-mist"
                      >
                        {r.sinHorario ? 'Asignar horario' : 'Editar'}
                      </button>
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
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <select
                  aria-label="Qué bloquear"
                  className="min-w-0 flex-1 rounded-xl border border-ink/20 bg-white px-3 py-2 text-sm sm:flex-none"
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
                  className="btn-fill shrink-0 whitespace-nowrap px-5 py-2 text-xs"
                >
                  Bloquear
                </button>
                <button
                  type="button"
                  onClick={() => setBloqueo({ tipo: 'desbloquear', grupo: grupoSel })}
                  disabled={bloqueosDeGrupo(grupoSel).length === 0}
                  className="shrink-0 whitespace-nowrap rounded-full border border-ink/30 px-5 py-2 text-xs uppercase tracking-widest transition hover:bg-mist disabled:opacity-40 disabled:hover:bg-transparent"
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
                  <li key={hora} className={`rounded-xl px-4 py-3 ring-1 ${(reserva && estadoFondo[reserva.estado]) || 'bg-white/70 ring-mist'}`}>
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
                        <span className={`text-sm ${estadoTexto[reserva.estado] ?? 'text-accent'}`}>
                          {statusLabel[reserva.estado]} · {reserva.nombre} (continúa)
                        </span>
                      )}

                      {!almuerzo && reserva && esInicio && (
                        <div className="flex flex-1 flex-wrap items-center justify-between gap-3">
                          <div className="text-sm">
                            <p className={`font-medium ${estadoTexto[reserva.estado] ?? ''}`}>
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
                          {/* Las citas no tienen botones aquí: se confirman y cancelan desde "Citas del día". */}
                          {reserva.estado === 'bloqueado' && (
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => liberar(reserva)}
                                className="rounded-full border border-ink/30 px-4 py-1 text-xs uppercase tracking-widest transition hover:bg-mist"
                              >
                                Desbloquear
                              </button>
                            </div>
                          )}
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
      )}

      {/* Pregunta única para activar avisos. Solo se muestra si el celular todavía no decidió. */}
      {preguntarAvisos && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-ink/60 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="pregunta-avisos" className="w-full max-w-sm rounded-2xl bg-paper p-6 text-center shadow-xl">
            <p id="pregunta-avisos" className="font-serif text-3xl">¿Activar notificaciones?</p>
            <p className="mt-3 text-sm text-ink/80">
              Te avisamos en este celular cuando una clienta pida una cita, para que la confirmes al momento.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button type="button" onClick={() => responderPregunta(true)} className="btn-fill w-full py-3 text-xs">
                Sí, activar
              </button>
              <button
                type="button"
                onClick={() => responderPregunta(false)}
                className="w-full rounded-full border border-ink/30 py-3 text-xs uppercase tracking-widest transition hover:bg-mist"
              >
                Ahora no
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Aviso flotante: se queda en pantalla hasta que Grecia lo cierre, aunque esté lejos de la lista. */}
      {avisos.length > 0 && (
        <div aria-live="assertive" className="fixed inset-x-4 top-24 z-[55] mx-auto max-w-sm space-y-3">
          {avisos.map((aviso, i) => (
            <div key={i} role="alert" className="rounded-2xl bg-paper p-5 shadow-xl ring-1 ring-green-700/40">
              <p className="font-serif text-2xl text-green-800">Día completo</p>
              <p className="mt-2 text-sm text-ink/80">{aviso}</p>
              <button
                type="button"
                onClick={() => setAvisos((a) => a.filter((_, j) => j !== i))}
                className="btn-fill mt-4 px-5 py-2 text-xs"
              >
                Entendido
              </button>
            </div>
          ))}
        </div>
      )}

      {pestana === 'cobrar' && <Deudoras reservas={reservas} onPagar={cambiarPago} onRecordar={recordarPago} />}

      {pestana === 'confirmar' && <PorConfirmar reservas={reservas} onConfirmar={confirmar} onLiberar={liberar} />}

      {pestana === 'historial' && (
        <section className="mt-10">
          <p className="text-xs uppercase tracking-[0.35em] text-accent">Historial</p>
          <h2 className="mt-2 font-serif text-3xl">Clientas ya atendidas</h2>
          <p className="mt-2 text-xs uppercase tracking-widest text-accent">
            {archivo.length} {archivo.length === 1 ? 'cita archivada' : 'citas archivadas'}
          </p>
          <Historial archivo={archivo} />
        </section>
      )}

      {recordatorioSinTelefono && (
        <AdminModal
          title="Recordatorio de cita"
          onClose={() => {
            setRecordatorioSinTelefono(null);
            setCopiado(false);
          }}
        >
          <p className="text-sm text-ink/80">
            Como no colocaste número de teléfono de la clienta, se generó el texto automático para que tú se lo puedas
            enviar a tu clienta.
          </p>
          <pre className="mt-4 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-mist/60 p-4 font-sans text-sm leading-relaxed">
            {recordatorioSinTelefono.texto}
          </pre>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(recordatorioSinTelefono.texto);
                setCopiado(true);
              } catch {
                setMessage('No se pudo copiar. Selecciona el texto y cópialo a mano.');
              }
            }}
            className="btn-fill mt-5 w-full py-3 text-xs"
          >
            {copiado ? 'Mensaje copiado' : 'Copiar mensaje'}
          </button>
        </AdminModal>
      )}

      {accion?.tipo === 'agendar' && (
        <AdminModal title="Agendar clienta" onClose={() => setAccion(null)}>
          <AgendarClienta occupancy={occupancy} onDone={() => setAccion(null)} />
        </AdminModal>
      )}

      {accion?.tipo === 'editar' && (
        <AdminModal title="Editar cita" onClose={() => setAccion(null)}>
          <p className="mb-2 text-sm text-accent">
            {accion.reserva.nombre} · {formatFecha(accion.reserva.fecha)} · {formatHour(accion.reserva.hora)}
          </p>
          <EditarCita reserva={accion.reserva} onDone={() => setAccion(null)} onCancel={() => setAccion(null)} />
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
