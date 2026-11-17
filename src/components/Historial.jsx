import { useMemo, useState } from 'react';
import { addDays, formatFecha, formatHour } from '../lib/schedule';

// Lunes de la semana a la que pertenece una fecha (AAAA-MM-DD).
function lunesDe(fecha) {
  const dia = new Date(`${fecha}T12:00:00`).getDay(); // 0 = domingo
  return addDays(fecha, -((dia + 6) % 7));
}

// Historial de clientas atendidas: semanas → días → citas. Las citas solo se dibujan al abrir un día,
// así la lista sigue ligera aunque haya cientos de clientas.
export default function Historial({ archivo }) {
  const [abiertos, setAbiertos] = useState({});
  const alternar = (clave) => setAbiertos((s) => ({ ...s, [clave]: !s[clave] }));

  const semanas = useMemo(() => {
    const porSemana = {};
    archivo.forEach((r) => {
      const lunes = lunesDe(r.fecha);
      const semana = (porSemana[lunes] ??= { lunes, dias: {} });
      (semana.dias[r.fecha] ??= []).push(r);
    });
    return Object.values(porSemana)
      .sort((a, b) => b.lunes.localeCompare(a.lunes))
      .map((semana) => ({
        lunes: semana.lunes,
        total: Object.values(semana.dias).reduce((n, lista) => n + lista.length, 0),
        dias: Object.entries(semana.dias)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([fecha, lista]) => ({
            fecha,
            lista: [...lista].sort((x, y) => x.hora.localeCompare(y.hora)),
          })),
      }));
  }, [archivo]);

  if (archivo.length === 0) {
    return <p className="mt-6 text-sm text-accent">Todavía no hay días archivados.</p>;
  }

  return (
    <ul className="mt-6 space-y-3">
      {semanas.map((semana) => {
        const claveSemana = `s-${semana.lunes}`;
        const abiertaSemana = Boolean(abiertos[claveSemana]);
        return (
          <li key={semana.lunes} className="rounded-2xl bg-white/60 ring-1 ring-mist">
            <button
              type="button"
              aria-expanded={abiertaSemana}
              onClick={() => alternar(claveSemana)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-serif text-xl">Semana del {formatFecha(semana.lunes)}</span>
              <span className="flex items-center gap-3 text-xs uppercase tracking-widest text-accent">
                {semana.total} {semana.total === 1 ? 'cita' : 'citas'}
                <span aria-hidden="true" className={`text-base transition ${abiertaSemana ? 'rotate-180' : ''}`}>
                  ⌄
                </span>
              </span>
            </button>

            {abiertaSemana && (
              <ul className="space-y-2 px-3 pb-3">
                {semana.dias.map(({ fecha, lista }) => {
                  const claveDia = `d-${fecha}`;
                  const abiertoDia = Boolean(abiertos[claveDia]);
                  return (
                    <li key={fecha} className="rounded-xl bg-white ring-1 ring-mist">
                      <button
                        type="button"
                        aria-expanded={abiertoDia}
                        onClick={() => alternar(claveDia)}
                        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
                      >
                        <span className="text-sm capitalize">{formatFecha(fecha)}</span>
                        <span className="flex items-center gap-3 text-xs uppercase tracking-widest text-accent">
                          {lista.length} {lista.length === 1 ? 'clienta' : 'clientas'}
                          <span aria-hidden="true" className={`text-base transition ${abiertoDia ? 'rotate-180' : ''}`}>
                            ⌄
                          </span>
                        </span>
                      </button>

                      {abiertoDia && (
                        <ul className="space-y-2 px-3 pb-3">
                          {lista.map((r) => (
                            <li
                              key={r.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-mist/40 px-4 py-3"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium">
                                  {formatHour(r.hora)} · {r.nombre}
                                </p>
                                <p className="text-xs text-accent">
                                  {r.servicio} · {r.precio}
                                  {r.telefono && ` · ${r.telefono}`}
                                  {r.instagram && ` · ${r.instagram}`}
                                </p>
                              </div>
                              <span
                                className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-widest text-white ${
                                  r.pagado === true ? 'bg-green-700' : 'bg-red-600'
                                }`}
                              >
                                {r.pagado === true ? 'Pagado' : 'No pagado'}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
