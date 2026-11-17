import { useMemo, useState } from 'react';
import { addDays, formatFecha, formatHour } from '../lib/schedule';

// Nombre del mes en español, con mayúscula inicial: "2026-11" → "Noviembre 2026".
function nombreMes(mes) {
  const texto = new Date(`${mes}-01T12:00:00`).toLocaleDateString('es', { month: 'long', year: 'numeric' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Lunes de la semana a la que pertenece una fecha (AAAA-MM-DD).
function lunesDe(fecha) {
  const dia = new Date(`${fecha}T12:00:00`).getDay(); // 0 = domingo
  return addDays(fecha, -((dia + 6) % 7));
}

const contar = (n, singular, plural) => `${n} ${n === 1 ? singular : plural}`;

// Historial de clientas atendidas: mes → semana → día → citas.
// Las citas solo se dibujan al abrir un día, así la lista sigue ligera aunque haya cientos de clientas.
export default function Historial({ archivo }) {
  const [abiertos, setAbiertos] = useState({});
  const alternar = (clave) => setAbiertos((s) => ({ ...s, [clave]: !s[clave] }));

  const meses = useMemo(() => {
    const porMes = {};
    archivo.forEach((r) => {
      const mes = r.fecha.slice(0, 7);
      const semanas = (porMes[mes] ??= {});
      const lunes = lunesDe(r.fecha);
      const dias = (semanas[lunes] ??= {});
      (dias[r.fecha] ??= []).push(r);
    });
    return Object.entries(porMes)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([mes, semanas]) => {
        const listaSemanas = Object.entries(semanas)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([lunes, dias]) => {
            const listaDias = Object.entries(dias)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([fecha, lista]) => ({
                fecha,
                lista: [...lista].sort((x, y) => x.hora.localeCompare(y.hora)),
              }));
            return {
              lunes,
              total: listaDias.reduce((n, d) => n + d.lista.length, 0),
              dias: listaDias,
            };
          });
        return {
          mes,
          total: listaSemanas.reduce((n, s) => n + s.total, 0),
          semanas: listaSemanas,
        };
      });
  }, [archivo]);

  if (archivo.length === 0) {
    return <p className="mt-6 text-sm text-accent">Todavía no hay días archivados.</p>;
  }

  // Encabezado desplegable reutilizable para cada nivel.
  const Cabecera = ({ clave, titulo, detalle, className }) => {
    const abierto = Boolean(abiertos[clave]);
    return (
      <button
        type="button"
        aria-expanded={abierto}
        onClick={() => alternar(clave)}
        className={`flex w-full items-center justify-between gap-4 text-left ${className}`}
      >
        <span className="font-serif">{titulo}</span>
        <span className="flex items-center gap-3 text-sm uppercase tracking-widest text-accent">
          {detalle}
          <span aria-hidden="true" className={`text-base transition ${abierto ? 'rotate-180' : ''}`}>
            ⌄
          </span>
        </span>
      </button>
    );
  };

  return (
    <ul className="mt-6 space-y-3">
      {meses.map((mes) => {
        const claveMes = `m-${mes.mes}`;
        return (
          <li key={mes.mes} className="rounded-2xl bg-white/60 ring-1 ring-mist">
            <Cabecera
              clave={claveMes}
              titulo={nombreMes(mes.mes)}
              detalle={contar(mes.total, 'cita', 'citas')}
              className="px-5 py-5 text-2xl"
            />

            {abiertos[claveMes] && (
              <ul className="space-y-2 px-3 pb-3">
                {mes.semanas.map((semana) => {
                  const claveSemana = `s-${semana.lunes}`;
                  return (
                    <li key={semana.lunes} className="rounded-xl bg-white/80 ring-1 ring-mist">
                      <Cabecera
                        clave={claveSemana}
                        titulo={`Semana del ${formatFecha(semana.lunes)}`}
                        detalle={contar(semana.total, 'cita', 'citas')}
                        className="px-4 py-4 text-xl"
                      />

                      {abiertos[claveSemana] && (
                        <ul className="space-y-2 px-3 pb-3">
                          {semana.dias.map(({ fecha, lista }) => {
                            const claveDia = `d-${fecha}`;
                            return (
                              <li key={fecha} className="rounded-lg bg-white ring-1 ring-mist">
                                <Cabecera
                                  clave={claveDia}
                                  titulo={<span className="text-lg capitalize">{formatFecha(fecha)}</span>}
                                  detalle={contar(lista.length, 'clienta', 'clientas')}
                                  className="px-4 py-3"
                                />

                                {abiertos[claveDia] && (
                                  <ul className="space-y-2 px-3 pb-3">
                                    {lista.map((r) => (
                                      <li
                                        key={r.id}
                                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-mist/40 px-4 py-3"
                                      >
                                        <div className="min-w-0">
                                          <p className="text-base font-medium">
                                            {formatHour(r.hora)} · {r.nombre}
                                          </p>
                                          <p className="text-sm text-accent">
                                            {r.servicio} · {r.precio}
                                            {r.telefono && ` · ${r.telefono}`}
                                            {r.instagram && ` · ${r.instagram}`}
                                          </p>
                                        </div>
                                        <span
                                          className={`rounded-full px-3 py-1 text-xs uppercase tracking-widest text-white ${
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
            )}
          </li>
        );
      })}
    </ul>
  );
}
