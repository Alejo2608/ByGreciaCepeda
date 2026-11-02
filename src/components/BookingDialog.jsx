import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { buildWhatsAppLink } from '../lib/whatsapp';
import { createReserva } from '../lib/reservas';
import {
  addDays,
  bloqueSlotIds,
  dayTimes,
  durationMinutes,
  fitsInDay,
  formatFecha,
  formatHour,
  isBookableDay,
  isBreakTime,
  maxBookingISO,
  slotIdsFor,
  todayISO,
} from '../lib/schedule';
import Calendar from './Calendar';

const questions = [
  { key: 'piel', label: '¿Qué tipo de piel consideras que eres?', message: '¿Qué tipo de piel consideras que eres?', options: ['Grasa', 'Seca', 'Mixta'] },
  { key: 'acabado', label: '¿Prefieres el acabado Mate o Glow?', message: '¿Prefieres el acabado Mate o Glow?', options: ['Mate', 'Glow'] },
  { key: 'pestanas', label: '¿Cómo prefieres las pestañas?', message: '¿Cómo prefieres las pestañas?', options: ['Naturales', 'Glamurosa'] },
  { key: 'labios', label: '¿Cómo prefieres esos labios?', message: '¿Cómo prefieres los labios?', options: ['Mate', 'Gloss'] },
  { key: 'color', label: '¿Qué color o tono?', message: '¿Qué color o tono?', options: ['Nude / Tierra', 'Rojos / Cereza'] },
  {
    key: 'rubores',
    label: 'Tienes preferencia por:',
    message: '¿Tienes preferencia por Rubores en tonos?',
    options: ['Rubores rosa pálido / fucsia', 'Rubores bronceados / terracota', 'Rubores peach coral (naranjas)'],
  },
];

const emptyForm = { telefono: '', instagram: '', piel: '', acabado: '', pestanas: '', labios: '', color: '', rubores: '', extra: '' };

const inputClass = 'mt-2 w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-sm outline-none focus:border-ink';

// Reserva en dos pasos: 1) nombre, fecha y hora; 2) teléfono y datos. Al enviar, la hora queda apartada
// como pendiente y se muestra el enlace para mandarle la solicitud a Grecia por WhatsApp.
// Los cursos (service.bloque) no eligen hora: ocupan la misma franja en cada uno de sus días.
export default function BookingDialog({ open, onClose, service, preferences = false, allowSunday = false }) {
  const [step, setStep] = useState(1);
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [busy, setBusy] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(null);
  const formRef = useRef(null);
  const bloque = service.bloque;
  const minutes = durationMinutes(service.duration);
  // Maquillaje atiende 24 y 31 de diciembre; maquillaje y cursos atienden los domingos.
  const openDay = (d) => isBookableDay(d, { makeup: preferences, sunday: allowSunday });
  const diasDelCurso = (f) => Array.from({ length: bloque ? bloque.dias : 1 }, (_, i) => addDays(f, i));

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Turnos ya ocupados o apartados de la fecha elegida (y de los días siguientes, si es un curso).
  useEffect(() => {
    if (!fecha || !isBookableDay(fecha, { makeup: preferences, sunday: allowSunday })) {
      setBusy(new Set());
      return undefined;
    }
    const dias = bloque ? Array.from({ length: bloque.dias }, (_, i) => addDays(fecha, i)) : [fecha];
    let cancelled = false;
    setLoading(true);
    getDocs(query(collection(db, 'slots'), where('fecha', 'in', dias)))
      .then((snap) => {
        if (!cancelled) setBusy(new Set(snap.docs.map((d) => d.id)));
      })
      .catch(() => {
        if (!cancelled) setError('No pudimos cargar los horarios. Intenta de nuevo.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fecha, bloque, preferences, allowSunday]);

  const availableTimes = useMemo(() => {
    if (!fecha || !isBookableDay(fecha, { makeup: preferences, sunday: allowSunday })) return [];
    const now = new Date();
    const isToday = fecha === todayISO();
    const nowHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (bloque) {
      const libre =
        diasDelCurso(fecha).every((d) => isBookableDay(d, { makeup: preferences, sunday: allowSunday })) &&
        bloqueSlotIds(fecha, bloque).every((id) => !busy.has(id));
      return libre && (!isToday || bloque.inicio > nowHHMM) ? [bloque.inicio] : [];
    }
    return dayTimes(preferences).filter(
      (h) =>
        !isBreakTime(h) &&
        fitsInDay(h, minutes, preferences) &&
        (!isToday || h > nowHHMM) &&
        slotIdsFor(fecha, h, minutes).every((id) => !busy.has(id)),
    );
  }, [fecha, busy, minutes, bloque, preferences, allowSunday]);

  // Para los cursos la hora es siempre la de inicio de la franja.
  const selected = bloque ? (availableTimes[0] ?? '') : hora;

  if (!open) return null;

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // Texto de fecha y hora para mostrar y para el mensaje de WhatsApp.
  const fechaTexto = () => {
    if (!bloque) return `${formatFecha(fecha)} a las ${formatHour(selected)}`;
    const dias = diasDelCurso(fecha).map(formatFecha);
    return `${dias.join(' y ')}, de ${formatHour(bloque.inicio)} a ${formatHour(bloque.fin)}`;
  };

  const goToStep2 = () => {
    if (!nombre.trim() || !form.telefono.trim() || !fecha || !selected) {
      setError('Escribe tu nombre y teléfono, y elige una fecha y una hora.');
      return;
    }
    setError('');
    // Solo maquillaje tiene encuesta y datos extra; los demás servicios se envían de una vez.
    if (preferences) setStep(2);
    else send();
  };

  const buildMessage = () => {
    const details = [
      'Estos son mis datos para reservar',
      `•Nombre: ${nombre.trim()}`,
      `•Teléfono: ${form.telefono.trim()}`,
      form.instagram.trim() && `•Usuario de Instagram: ${form.instagram.trim()}`,
      `•Fecha: ${fechaTexto()}`,
      '—————————————————',
    ]
      .filter(Boolean)
      .join('\n');
    const prefs = preferences
      ? 'Encuesta de Preferencias\n\n' + questions.map((q) => `•${q.message}\nRespuesta: ${form[q.key]}`).join('\n\n')
      : '';
    const extra = form.extra.trim() && `Datos adicionales que desees añadir en tu servicio⬇️\n${form.extra.trim()}`;
    return [`Hola Grecia✨quiero agendar contigo un ${service.name} (${service.price})`, details, prefs, extra]
      .filter(Boolean)
      .join('\n\n');
  };

  const send = async () => {
    setError('');
    const data = {
      servicio: service.name,
      precio: service.price,
      duracion: service.duration,
      fecha,
      hora: selected,
      nombre: nombre.trim(),
      telefono: form.telefono.trim(),
      instagram: form.instagram.trim(),
      preferencias: preferences ? Object.fromEntries(questions.map((q) => [q.key, form[q.key]])) : null,
      datos: form.extra.trim(),
      estado: 'pendiente',
    };
    const slotIds = bloque ? bloqueSlotIds(fecha, bloque) : slotIdsFor(fecha, selected, minutes);
    setLoading(true);
    try {
      await createReserva(data, slotIds);
      const message = buildMessage();
      setSent({ message, link: buildWhatsAppLink(message) });
    } catch (err) {
      if (err.message === 'ocupado') {
        setError('Ese horario acaba de ocuparse. Elige otro, por favor.');
        setHora('');
        setStep(1);
      } else {
        setError('No pudimos enviar tu solicitud. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (!formRef.current.reportValidity()) return;
    send();
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-paper p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-xl transition hover:bg-mist"
        >
          ×
        </button>

        <h2 id="booking-title" className="font-serif text-3xl leading-tight">
          {service.name}
        </h2>
        <p className="mt-1 text-xs uppercase tracking-widest text-accent">
          {service.price}
          {bloque && ` · ${service.duration}`}
        </p>

        {sent && (
          <div className="mt-6 space-y-4 text-sm leading-relaxed">
            <p>
              Tu solicitud quedó registrada. Tu horario queda apartado mientras Grecia lo confirma. Envíale el mensaje
              por WhatsApp para que lo reciba.
            </p>
            <a href={sent.link} target="_blank" rel="noopener noreferrer" className="btn-fill w-full">
              Enviar mensaje por WhatsApp
            </a>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(sent.message)}
              className="w-full text-center text-xs uppercase tracking-widest text-accent underline-offset-4 hover:underline"
            >
              Copiar mensaje
            </button>
          </div>
        )}

        {!sent && step === 1 && (
          <div className="mt-6 space-y-6">
            <label className="block text-sm">
              Nombre del cliente
              <input className={inputClass} value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </label>
            <label className="block text-sm">
              Teléfono
              <input type="tel" className={inputClass} value={form.telefono} onChange={update('telefono')} />
            </label>
            <label className="block text-sm">
              Usuario de Instagram <span className="text-accent">(opcional)</span>
              <input className={inputClass} value={form.instagram} onChange={update('instagram')} />
            </label>

            <div>
              <p className="text-sm">Fecha</p>
              <div className="mt-2">
                <Calendar
                  value={fecha}
                  onChange={(d) => {
                    setFecha(d);
                    setHora('');
                  }}
                  isDisabled={(d) => d < todayISO() || d > maxBookingISO() || !openDay(d)}
                />
              </div>
              <p className="mt-2 text-xs text-accent">Puedes agendar hasta 3 semanas desde hoy.</p>
              {fecha && !openDay(fecha) && (
                <p className="mt-2 text-sm text-accent">Ese día no hay atención para este servicio.</p>
              )}
            </div>

            {fecha && openDay(fecha) && (
              <fieldset>
                <legend className="text-sm">{bloque ? 'Horario del curso' : 'Hora disponible'}</legend>
                {loading && <p className="mt-2 text-sm text-accent">Cargando horarios…</p>}
                {!loading && availableTimes.length === 0 && (
                  <p className="mt-2 text-sm text-accent">
                    {bloque ? 'Ese día ya está ocupado para el curso.' : 'No hay horarios disponibles para esa fecha.'}
                  </p>
                )}
                {bloque && availableTimes.length > 0 && (
                  <p className="mt-2 text-sm">{fechaTexto()}</p>
                )}
                {!bloque && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {availableTimes.map((h) => (
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

            <button type="button" onClick={goToStep2} disabled={loading} className="btn-fill w-full disabled:opacity-50">
              {preferences ? 'Continuar' : 'Solicitar cita'}
            </button>
          </div>
        )}

        {!sent && step === 2 && (
          <form ref={formRef} onSubmit={submit} noValidate className="mt-6 space-y-6">
            <div className="rounded-xl bg-mist px-4 py-3 text-sm">
              <p className="capitalize">{fechaTexto()}</p>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-1 text-xs uppercase tracking-widest text-accent underline-offset-4 hover:underline"
              >
                Cambiar fecha u hora
              </button>
            </div>

            {preferences &&
              questions.map((q) => (
                <fieldset key={q.key}>
                  <legend className="text-sm">{q.label}</legend>
                  <div className="mt-2 space-y-2">
                    {q.options.map((option) => (
                      <label
                        key={option}
                        className="flex cursor-pointer items-center gap-3 rounded-xl bg-mist px-4 py-3 text-sm transition hover:bg-mist/60"
                      >
                        <input
                          required
                          type="radio"
                          name={q.key}
                          value={option}
                          checked={form[q.key] === option}
                          onChange={update(q.key)}
                          className="accent-ink"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}

            <label className="block text-sm">
              Escribe cualquier dato que desees, añadir o eliminar tu servicio{' '}
              <span className="text-accent">(opcional)</span>
              <textarea rows={3} className={inputClass} value={form.extra} onChange={update('extra')} />
            </label>

            {error && <p className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-ink">{error}</p>}

            <button type="submit" disabled={loading} className="btn-fill w-full disabled:opacity-50">
              Solicitar cita
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
