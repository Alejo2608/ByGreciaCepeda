import { useState } from 'react';

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const toISO = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

// Calendario mensual. value y onChange usan el formato AAAA-MM-DD.
// counts: { 'AAAA-MM-DD': número } para marcar los días con citas.
export default function Calendar({ value, onChange, isDisabled = () => false, counts = {}, size = 'normal' }) {
  const base = value ? new Date(`${value}T00:00`) : new Date();
  const [view, setView] = useState({ y: base.getFullYear(), m: base.getMonth() });

  const first = new Date(view.y, view.m, 1);
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7; // la semana empieza en lunes
  const cells = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const move = (n) => {
    const d = new Date(view.y, view.m + n, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  const navButton =
    'flex h-9 w-9 items-center justify-center rounded-full text-lg text-ink transition hover:bg-mist';

  return (
    <div className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-mist">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => move(-1)} aria-label="Mes anterior" className={navButton}>
          ‹
        </button>
        <p className="font-serif text-xl capitalize">
          {MONTHS[view.m]} <span className="text-accent">{view.y}</span>
        </p>
        <button type="button" onClick={() => move(1)} aria-label="Mes siguiente" className={navButton}>
          ›
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 text-center text-xs uppercase tracking-widest text-accent">
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-1">
            {w}
          </span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <span key={`empty-${i}`} />;
          const key = toISO(view.y, view.m, d);
          const disabled = isDisabled(key);
          const selected = key === value;
          const count = counts[key] || 0;
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onChange(key)}
              className={`relative rounded-xl text-sm transition ${size === 'large' ? 'py-4' : 'py-2'} ${
                selected
                  ? 'bg-ink text-paper'
                  : disabled
                    ? 'cursor-not-allowed text-ink/25'
                    : 'hover:bg-mist'
              }`}
            >
              {d}
              {count > 0 && (
                <span
                  aria-hidden="true"
                  className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                    selected ? 'bg-paper' : 'bg-accent'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
