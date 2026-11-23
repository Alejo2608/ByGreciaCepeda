import { useMemo, useState } from "react";
import { formatFecha, formatHour, todayISO } from "../lib/schedule";

// Monto de un precio como "35 USD" → 35.
function montoDe(precio) {
  const n = parseFloat(String(precio ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

// Clave para agrupar a una misma clienta (por teléfono si hay, si no por nombre).
function claveClienta(r) {
  return (
    (r.telefono || "").replace(/\D/g, "") ||
    (r.nombre || "").trim().toLowerCase()
  );
}

// Clientas con citas ya atendidas y sin pagar. Una pestaña para cobrar sin buscar en la agenda.
// Solo cuentan las citas confirmadas de hoy o de días anteriores que todavía no están pagadas.
export default function Deudoras({ reservas, onPagar, onRecordar }) {
  const [abiertas, setAbiertas] = useState({});

  const clientas = useMemo(() => {
    const hoy = todayISO();
    const pendientes = reservas.filter(
      (r) =>
        r.estado === "confirmada" &&
        !r.sinHorario &&
        r.fecha <= hoy &&
        r.pagado !== true,
    );
    const grupos = {};
    pendientes.forEach((r) => {
      const clave = claveClienta(r);
      const g = (grupos[clave] ??= {
        clave,
        nombre: r.nombre,
        telefono: r.telefono,
        citas: [],
        total: 0,
      });
      g.citas.push(r);
      g.total += montoDe(r.precio);
    });
    return Object.values(grupos)
      .map((g) => ({
        ...g,
        citas: g.citas.sort((a, b) =>
          (a.fecha + a.hora).localeCompare(b.fecha + b.hora),
        ),
      }))
      .sort((a, b) => b.total - a.total);
  }, [reservas]);

  const totalGeneral = clientas.reduce((n, c) => n + c.total, 0);

  if (clientas.length === 0) {
    return (
      <p className="mt-6 text-sm text-accent">
        No hay clientas con pagos pendientes.
      </p>
    );
  }

  return (
    <section className="mt-10">
      <p className="text-xs uppercase tracking-[0.35em] text-accent">
        Por cobrar
      </p>
      <h2 className="mt-2 font-serif text-3xl">
        Clientas con pagos pendientes
      </h2>
      <p className="mt-2 text-xs uppercase tracking-widest text-accent">
        {clientas.length} {clientas.length === 1 ? "clienta" : "clientas"} ·
        total {totalGeneral} USD
      </p>

      <ul className="mt-6 space-y-3">
        {clientas.map((c) => {
          const abierta = Boolean(abiertas[c.clave]);
          return (
            <li
              key={c.clave}
              className="rounded-2xl bg-white/70 ring-1 ring-mist"
            >
              <button
                type="button"
                aria-expanded={abierta}
                onClick={() =>
                  setAbiertas((s) => ({ ...s, [c.clave]: !s[c.clave] }))
                }
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span>
                  <span className="block font-serif text-xl">{c.nombre}</span>
                  <span className="mt-1 block text-sm text-accent">
                    {c.citas.length} {c.citas.length === 1 ? "cita" : "citas"}
                    {c.telefono && ` · ${c.telefono}`}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="rounded-full bg-red-600 px-3 py-1 text-xs uppercase tracking-widest text-white">
                    {c.total} USD
                  </span>
                  <span
                    aria-hidden="true"
                    className={`text-base transition ${abierta ? "rotate-180" : ""}`}
                  >
                    ⌄
                  </span>
                </span>
              </button>

              {abierta && (
                <>
                  <ul className="space-y-2 px-4 pb-2">
                    {c.citas.map((r) => (
                      <li
                        key={r.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-mist/40 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {formatFecha(r.fecha)} · {formatHour(r.hora)}
                          </p>
                          <p className="text-xs text-accent">
                            {r.servicio} · {r.precio}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onPagar(r)}
                          className="rounded-full bg-green-700 px-4 py-1.5 text-xs uppercase tracking-widest text-white transition hover:bg-green-800"
                        >
                          Marcar pagado
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="px-4 pb-4 pt-1">
                    <button
                      type="button"
                      onClick={() => onRecordar(c)}
                      className="rounded-full border border-ink/30 px-4 py-1.5 text-xs normal-case tracking-normal transition hover:bg-mist"
                    >
                      Recordar pago
                    </button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
