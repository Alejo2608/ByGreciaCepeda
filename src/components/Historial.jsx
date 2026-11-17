import { useMemo, useState } from 'react';
import { formatFecha, formatHour } from '../lib/schedule';

// Nombre del mes en español, con mayúscula inicial: "2026-11" → "Noviembre 2026".
function nombreMes(mes) {
  const texto = new Date(`${mes}-01T12:00:00`).toLocaleDateString('es', { month: 'long', year: 'numeric' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Historial de clientas atendidas: meses → días → citas. Las citas solo se dibujan al abrir un día,
// así la lista sigue ligera aunque haya cientos de clientas.
export default function Historial({ archivo }) {
  const [abiertos, setAbiertos] = useState({});
  const alternar = (clave) => setAbiertos((s) => ({ ...s, [clave]: !s[clave] }));

  const meses = useMemo(() => {
    const porMes = {};
    archivo.forEach((r) => {
      const mes = r.fecha.slice(0, 7);
      const grupo = (porMes[mes] ??= { mes, dias: {} });
      (grupo.dias[r.fecha] ??= []).push(r);
    });
    return Object.values(porMes)
      .sort((a, b) => b.mes.localeCompare(a.mes))
      .map((grupo) => ({
        mes: grupo.mes,
        total: Object.values(grupo.dias).reduce((n, lista) => n + lista.length, 0),
        dias: Object.entries(grupo.dias)
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
      {meses.map((grupo) => {
        const claveMes = `m-${grupo.mes}`;
        const abiertoMes = Boolean(abiertos[claveMes]);
        return (
          <li key={grupo.mes} className="rounded-2xl bg-white/60 ring-1 ring-mist">
            <button
              type="button"
              aria-expanded={abiertoMes}
              onClick={() => alternar(claveMes)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-serif text-xl">{nombreMes(grupo.mes)}</span>
              <span className="flex items-center gap-3 text-xs uppercase tracking-widest text-accent">
                {grupo.total} {grupo.total === 1 ? 'cita' : 'citas'}
                <span aria-hidden="true" className={`text-base transition ${abiertoMes ? 'rotate-180' : ''}`}>
                  ⌄
                </span>
              </span>
            </button>

            {abiertoMes && (
              <ul className="space-y-2 px-3 pb-3">
                {grupo.dias.map(({ fecha, lista }) => {
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
