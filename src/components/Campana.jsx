import { useState } from 'react';
import { formatFecha, formatHour } from '../lib/schedule';

// Campana del panel: lista de avisos (solicitudes nuevas y recordatorios del día siguiente).
// Al abrirla se marcan como leídos; al tocar un aviso, el panel va a ese día en la agenda.
export default function Campana({ avisos, onIr, onAbrir, mostrarActivar, activando, onActivar }) {
  const [abierta, setAbierta] = useState(false);
  const sinLeer = avisos.filter((a) => !a.leida).length;

  const alternar = () => {
    const abrir = !abierta;
    setAbierta(abrir);
    if (abrir && sinLeer > 0) onAbrir();
  };

  return (
    <div className="fixed right-4 top-4 z-[70]">
      <button
        type="button"
        onClick={alternar}
        aria-label={`Notificaciones: ${sinLeer} sin leer`}
        aria-expanded={abierta}
        className="relative flex h-11 w-11 items-center justify-center rounded-full bg-paper text-ink shadow-sm ring-1 ring-mist transition hover:bg-mist"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {sinLeer > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-medium text-white">
            {sinLeer}
          </span>
        )}
      </button>

      {abierta && (
        <div className="absolute right-0 top-14 w-80 max-w-[90vw] rounded-2xl bg-paper p-3 shadow-xl ring-1 ring-mist">
          <p className="px-2 pb-2 text-xs uppercase tracking-widest text-accent">Notificaciones</p>
          {avisos.length === 0 ? (
            <p className="px-2 py-3 text-sm text-accent">No hay notificaciones.</p>
          ) : (
            <ul className="max-h-96 space-y-1 overflow-y-auto">
              {avisos.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setAbierta(false);
                      onIr(a);
                    }}
                    className={`w-full rounded-xl px-3 py-2.5 text-left transition hover:bg-mist ${a.leida ? '' : 'bg-white/70'}`}
                  >
                    <span className="block text-[10px] uppercase tracking-widest text-accent">
                      {a.tipo === 'recordatorio' ? 'Recordatorio de mañana' : 'Nueva solicitud'}
                    </span>
                    <span className="block text-sm font-medium">{a.titulo}</span>
                    <span className="block text-xs text-accent">
                      {a.texto || `${formatFecha(a.fecha)}${a.hora ? ` · ${formatHour(a.hora)}` : ''}`}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {mostrarActivar && (
            <button
              type="button"
              onClick={onActivar}
              disabled={activando}
              className="mt-3 w-full rounded-xl border border-ink/20 px-3 py-2 text-xs uppercase tracking-widest transition hover:bg-mist disabled:opacity-60"
            >
              {activando ? 'Activando…' : 'Activar avisos en este celular'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
