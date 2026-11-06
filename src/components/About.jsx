import { useEffect, useState } from 'react';
import useReveal from '../lib/useReveal';

const stats = [
  { valor: 5, sufijo: '', etiqueta: 'Años de trayectoria' },
  { valor: 4, sufijo: '', etiqueta: 'Áreas de especialidad' },
  { valor: 100, sufijo: '+', etiqueta: 'Masterclasses y talleres impartidos' },
];

// Cuenta desde 0 hasta el valor cuando el número entra en pantalla. Si el usuario pide menos movimiento, muestra el valor directo.
function Contador({ valor, sufijo, visible }) {
  const [actual, setActual] = useState(0);

  useEffect(() => {
    if (!visible) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setActual(valor);
      return undefined;
    }
    const inicio = performance.now();
    const duracion = 1400;
    let frame;
    const paso = (ahora) => {
      const progreso = Math.min((ahora - inicio) / duracion, 1);
      const suave = 1 - Math.pow(1 - progreso, 3);
      setActual(Math.round(valor * suave));
      if (progreso < 1) frame = requestAnimationFrame(paso);
    };
    frame = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(frame);
  }, [visible, valor]);

  return (
    <span className="font-serif text-5xl leading-none text-accent md:text-6xl">
      {actual}
      {sufijo}
    </span>
  );
}

function Estadistica({ valor, sufijo, etiqueta }) {
  const [ref, visible] = useReveal(0.4);
  return (
    <li
      ref={ref}
      className={`flex items-center gap-6 border-b border-ink/10 py-6 transition duration-700 first:pt-0 last:border-b-0 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'
      }`}
    >
      <div className="w-24 shrink-0 text-center">
        <Contador valor={valor} sufijo={sufijo} visible={visible} />
      </div>
      <p className="text-xs uppercase tracking-[0.25em] text-ink/70">{etiqueta}</p>
    </li>
  );
}

export default function About() {
  return (
    <section id="sobre-mi" className="mx-auto max-w-6xl px-4 py-24 md:px-6 md:pt-16 lg:pt-24">
      <div className="grid items-center gap-14 md:grid-cols-[1.3fr_1fr] md:gap-20">
        <div className="text-center md:text-left">
          <p className="text-xs uppercase tracking-[0.35em] text-accent">Sobre mí</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">Grecia Cepeda</h2>
          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-ink/60">Beauty Artist &amp; Educator</p>
          <span aria-hidden="true" className="mx-auto mt-6 block h-px w-16 bg-ink/30 md:mx-0" />
          <p className="mt-8 text-base leading-relaxed text-ink/80">
            Soy Grecia, especialista en diseño de mirada y maquilladora profesional en Trujillo. Más que realizar una
            aplicación o un maquillaje, creo experiencias personalizadas donde cada detalle se proyecta según tu rostro,
            tu estilo y la ocasión. Amo elevar la belleza real con precisión técnica y profesionalismo.
          </p>
          <p className="mt-4 text-base leading-relaxed text-ink/80">
            Además de atender en consulta, transmito mi pasión como Master Educator en cursos presenciales, guiando a
            futuras profesionales a construir su camino con bases técnicas sólidas, química de productos y dominio real
            del oficio.
          </p>
        </div>

        <ul className="border-t border-ink/10 md:border-t-0">
          {stats.map((s) => (
            <Estadistica key={s.etiqueta} {...s} />
          ))}
        </ul>
      </div>
    </section>
  );
}
