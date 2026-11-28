import { useState } from 'react';
import { buildWhatsAppLink } from '../lib/whatsapp';
import { site } from '../data/site';

// Al pasar el mouse o el dedo por la portada, el nombre y la foto se mueven en sentidos opuestos.
export default function Hero() {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  const mover = (e) => {
    // Solo con mouse: en celular la foto está de fondo y el movimiento se ve raro.
    if (e.pointerType !== 'mouse') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    setPointer({
      x: ((e.clientX - r.left) / r.width - 0.5) * 2,
      y: ((e.clientY - r.top) / r.height - 0.5) * 2,
    });
  };

  const quieto = () => setPointer({ x: 0, y: 0 });

  return (
    <section
      id="inicio"
      onPointerMove={mover}
      onPointerLeave={quieto}
      className="relative flex min-h-[100svh] flex-col items-stretch overflow-hidden bg-gradient-to-br from-paper via-mist/40 to-paper max-md:bg-none max-md:pb-0 pb-24 pt-0 md:min-h-0 md:flex-row md:items-center md:landscape:min-h-screen md:pb-10 md:pt-28 lg:pb-0 lg:pt-24"
    >
      {/* Celular y iPhone: fondo claro y carbón. La foto va en 4:5 con bordes redondeados y tipografía editorial. */}
      <div className="relative flex w-full flex-col bg-[#F5F5F7] px-5 pb-10 pt-24 text-[#333333] md:hidden">
        <div className="movil-foto mx-auto aspect-[8/9] w-full max-w-[21rem] overflow-hidden rounded-3xl">
          <img
            src="/images/grecia.jpg"
            alt="Grecia Cepeda, maquilladora profesional"
            className="h-full w-full object-cover"
            style={{ objectPosition: 'center top' }}
          />
        </div>

        <h1 className="movil-entrada mt-6 whitespace-nowrap text-center font-firma text-5xl leading-none" style={{ animationDelay: '0.2s' }}>
          Grecia Cepeda
        </h1>
        <p className="movil-entrada mt-3 text-center text-[11px] uppercase tracking-[0.25em]" style={{ animationDelay: '0.3s' }}>
          Lashista · Maquillaje · Cursos
        </p>

        <p className="movil-entrada mt-5 text-center font-serif text-3xl leading-tight" style={{ animationDelay: '0.4s' }}>
          Tu mirada,
          <span className="block font-script text-[1.2em] font-normal">realzada con arte</span>
        </p>
        <p className="movil-entrada mx-auto mt-3 max-w-xs text-center text-[13px] leading-relaxed text-[#333333]/80" style={{ animationDelay: '0.5s' }}>
          Extensiones de pestañas, maquillaje para cada ocasión y formación para quienes quieren hacer de la belleza su profesión.
        </p>

        <ul className="movil-entrada mt-5 flex flex-wrap justify-center gap-2" style={{ animationDelay: '0.55s' }}>
          {['Pestañas y cejas', 'Maquillaje', 'Cursos con modelo real'].map((etiqueta) => (
            <li key={etiqueta} className="rounded-full border border-[#333333] px-3 py-1 text-[10px] uppercase tracking-widest">
              {etiqueta}
            </li>
          ))}
        </ul>

        <div className="movil-entrada mt-6 flex flex-col gap-3" style={{ animationDelay: '0.65s' }}>
          <a
            href={buildWhatsAppLink('Hola Grecia, quisiera agendar una cita.')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-full bg-[#333333] px-6 py-3.5 text-sm uppercase tracking-widest text-[#F5F5F7] transition duration-300 active:scale-[0.98] active:opacity-80"
          >
            Agendar por WhatsApp
          </a>
          <a
            href="#servicios"
            className="flex items-center justify-center rounded-full border border-[#333333] bg-[#F5F5F7] px-6 py-3.5 text-sm uppercase tracking-widest text-[#333333] transition duration-300 active:bg-[#333333]/10"
          >
            Ver servicios
          </a>
        </div>
      </div>

      <div className="mx-auto hidden w-full max-w-6xl items-center gap-12 px-4 md:grid md:grid-cols-2 md:px-6">
        <div className="relative z-10 text-center md:text-left">
          <div
            className="inline-block transition-transform duration-500 ease-out"
            style={{ transform: `translate(${pointer.x * 14}px, ${pointer.y * 8}px)` }}
          >
            <p className="fade-up font-firma text-4xl text-accent md:text-6xl">{site.name}</p>
          </div>
          <p className="fade-up mb-4 mt-2 text-xs uppercase tracking-[0.35em] text-accent" style={{ animationDelay: '0.1s' }}>
            Lashista · Maquillaje · Cursos
          </p>
          <h1 className="fade-up font-serif text-4xl leading-tight md:text-6xl md:leading-[0.85]" style={{ animationDelay: '0.2s' }}>
            <span className="block leading-[0.85]">
              Tu mirada,{' '}
              <span className="font-script text-[1.2em] font-normal text-accent">realzada</span>
            </span>
            <span className="block font-script text-[1.2em] font-normal leading-[0.74]">con arte</span>
          </h1>
          <p className="fade-up mx-auto mt-6 max-w-md text-base leading-relaxed text-ink/80 md:mx-0 md:mt-2.5" style={{ animationDelay: '0.35s' }}>
            Extensiones de pestañas, maquillaje para cada ocasión y formación para quienes quieren
            hacer de la belleza su profesión.
          </p>
          <ul className="mx-auto mt-6 inline-block space-y-2 text-left text-sm text-ink/80 md:mx-0 md:block">
            {['Extensiones de pestañas y cejas', 'Maquillaje para cada ocasión', 'Cursos con modelo real'].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span aria-hidden="true" className="text-accent">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row md:justify-start">
            <a
              href={buildWhatsAppLink('Hola Grecia, quisiera agendar una cita.')}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-ink px-8 py-3 text-sm uppercase tracking-widest text-paper transition hover:bg-accent"
            >
              Agendar por WhatsApp
            </a>
            <a
              href="#servicios"
              className="btn-fill"
            >
              Ver servicios
            </a>
          </div>
        </div>

        {/* En móvil la foto es el fondo con un velo translúcido; en escritorio es un marco junto al texto. */}
        <div className="absolute inset-0 overflow-hidden bg-mist md:relative md:mx-auto md:aspect-[4/5] md:w-full md:max-w-sm md:rounded-2xl md:shadow-xl md:ring-1 md:ring-mist">
          <div className="fade-up h-full w-full" style={{ animationDelay: '0.3s' }}>
            <img
              src="/images/grecia.jpg"
              alt="Grecia Cepeda, maquilladora profesional"
              className="h-full w-full object-cover object-top transition-transform duration-500 ease-out"
              style={{
                transform: `translate(${-pointer.x * 18}px, ${-pointer.y * 12}px) scale(1.08)`,
              }}
            />
          </div>
          <div aria-hidden="true" className="absolute inset-0 bg-paper/75 md:hidden" />
        </div>
      </div>
    </section>
  );
}
