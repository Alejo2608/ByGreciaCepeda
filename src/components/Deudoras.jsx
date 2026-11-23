import { useMemo } from "react";
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

// Clientas con citas ya atendidas y sin pagar. Todo visible: citas, pagar y recordar.
// Solo cuentan las citas confirmadas de hoy o de días anteriores que todavía no están pagadas.
export default function Deudoras({ reservas, onPagar, onRecordar }) {
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

      <ul className="mt-6 space-y-4">
        {clientas.map((c) => (
          <li key={c.clave} className="overflow-hidden rounded-2xl bg-white/70 ring-1 ring-mist">
            <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-5 py-4">
              <div className="min-w-0">
                <p className="font-serif text-xl">{c.nombre}</p>
                <p className="text-sm text-accent">
                  {c.citas.length} {c.citas.length === 1 ? "cita" : "citas"}
                  {c.telefono && ` · ${c.telefono}`}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-red-600 px-3 py-1 text-xs uppercase tracking-widest text-white">
                {c.total} USD
              </span>
            </div>

            <ul className="divide-y divide-ink/10">
              {c.citas.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {formatFecha(r.fecha)} · {formatHour(r.hora)}
                    </p>
                    <p className="text-xs text-accent">
                      {r.servicio} · {r.precio}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onRecordar({ ...c, citas: [r], total: montoDe(r.precio) })}
                      className="rounded-full border border-ink/30 px-3 py-1.5 text-xs normal-case tracking-normal transition hover:bg-mist"
                    >
                      Recordar pago
                    </button>
                    <button
                      type="button"
                      onClick={() => onPagar(r)}
                      className="rounded-full bg-green-700 px-3 py-1.5 text-xs uppercase tracking-widest text-white transition hover:bg-green-800"
                    >
                      Marcar pagado
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
