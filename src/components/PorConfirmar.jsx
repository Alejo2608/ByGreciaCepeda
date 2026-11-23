import { useMemo } from 'react';
import { formatFecha, formatHour } from '../lib/schedule';

// Citas que todavía no se confirmaron, agrupadas por día. Desde aquí se confirman con un toque.
export default function PorConfirmar({ reservas, onConfirmar }) {
  const porDia = useMemo(() => {
    const pendientes = reservas
      .filter((r) => r.estado === 'pendiente' && !r.sinHorario)
      .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
    const grupos = {};
    pendientes.forEach((r) => {
      (grupos[r.fecha] ??= []).push(r);
    });
    return Object.entries(grupos);
  }, [reservas]);

  const total = porDia.reduce((n, [, lista]) => n + lista.length, 0);

  if (total === 0) {
    return <p className="mt-6 text-sm text-accent">No hay citas por confirmar.</p>;
  }

  return (
    <section className="mt-10">
      <p className="text-xs uppercase tracking-[0.35em] text-accent">Por confirmar</p>
      <h2 className="mt-2 font-serif text-3xl">Clientas por confirmar</h2>
      <p className="mt-2 text-xs uppercase tracking-widest text-accent">
        {total} {total === 1 ? 'cita' : 'citas'}
      </p>

      <div className="mt-6 space-y-6">
        {porDia.map(([fecha, lista]) => (
          <div key={fecha}>
            <p className="text-xs uppercase tracking-widest text-accent">{formatFecha(fecha)}</p>
            <ul className="mt-2 space-y-2">
              {lista.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/70 px-5 py-4 ring-1 ring-mist"
                >
                  <div className="min-w-0">
                    <p className="text-base font-medium">
                      {formatHour(r.hora)} · {r.nombre}
                    </p>
                    <p className="text-sm text-accent">
                      {r.servicio} · {r.telefono}
                    </p>
                  </div>
                  <button type="button" onClick={() => onConfirmar(r)} className="btn-fill px-5 py-2 text-xs normal-case tracking-normal">
                    Confirmar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
