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
      className="relative flex min-h-[100svh] items-end overflow-hidden bg-gradient-to-br from-paper via-mist/40 to-paper pb-24 pt-28 md:min-h-0 md:items-center md:landscape:min-h-screen md:pb-10 md:pt-28 lg:pb-0 lg:pt-24"
    >
      {/* Celular y iPhone: la foto es el fondo con un degradado cálido, y el texto va en una tarjeta clara
          en la parte baja para que no se mezcle con el rostro. El escritorio no cambia. */}
      <img
        src="/images/grecia.jpg"
        alt="Grecia Cepeda, maquilladora profesional"
        className="absolute inset-0 h-full w-full object-cover md:hidden"
        style={{ objectPosition: 'center 12%' }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-[#FAF7F3]/30 via-[#EEEAE6]/75 to-[#F4F4F7]/95 md:hidden" />

      {/* Se baja la tarjeta para dejar el rostro libre arriba. */}
      <div className="relative z-10 mx-auto mt-[34svh] w-full max-w-md px-5 md:hidden">
        <div className="rounded-3xl bg-paper/85 px-6 py-8 text-center shadow-[0_12px_40px_-12px_rgba(52,52,52,0.3)] ring-1 ring-white/70 backdrop-blur-sm">
          <p className="fade-up font-firma text-5xl leading-none text-ink">{site.name}</p>
          <p className="fade-up mt-4 whitespace-nowrap text-[10px] uppercase tracking-[0.25em] text-accent">
            Lashista · Maquillaje · Cursos
          </p>
          <h1 className="fade-up mt-3 font-serif text-3xl leading-tight text-ink" style={{ animationDelay: '0.2s' }}>
            Tu mirada,
            <span className="block font-script text-[1.2em] font-normal text-accent">realzada con arte</span>
          </h1>
          <p className="fade-up mt-5 text-sm leading-relaxed text-ink/80" style={{ animationDelay: '0.35s' }}>
            Extensiones de pestañas, maquillaje para cada ocasión y formación para quienes quieren hacer de la belleza su
            profesión.
          </p>

          <ul className="fade-up mt-6 grid grid-cols-3 gap-2 border-y border-ink/10 py-4 text-[10px] uppercase leading-snug tracking-widest text-ink/80">
            <li className="flex flex-col items-center gap-2">
              <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
                <circle cx="12" cy="12" r="2.8" />
              </svg>
              Pestañas y cejas
            </li>
            <li className="flex flex-col items-center gap-2">
              <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" className="text-accent">
                <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z" />
                <path d="M18.5 15.5l.8 1.8 1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8z" />
              </svg>
              Maquillaje
            </li>
            <li className="flex flex-col items-center gap-2">
              <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <path d="M3 6.5C5 5.2 8 5 12 6.5c4-1.5 7-1.3 9 0V19c-2-1.3-5-1.1-9 .5-4-1.6-7-1.4-9-.5z" />
                <path d="M12 6.5V19.5" />
              </svg>
              Cursos con modelo
            </li>
          </ul>

          <div className="fade-up mt-7 flex flex-col gap-3" style={{ animationDelay: '0.45s' }}>
            <a
              href={buildWhatsAppLink('Hola Grecia, quisiera agendar una cita.')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 rounded-full bg-ink px-6 py-4 text-sm uppercase tracking-widest text-paper transition active:bg-accent"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="#25D366">
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.4l-.7-1.8c-.2-.4-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1.1 2.7.1.2 1.8 2.8 4.4 3.9 2.2.9 2.6.7 3.1.7.5-.1 1.6-.7 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.5-.3z" />
              </svg>
              Agendar por WhatsApp
            </a>
            <a
              href="#servicios"
              className="flex items-center justify-center rounded-full border border-ink/40 px-6 py-4 text-sm uppercase tracking-widest text-ink transition active:bg-ink/5"
            >
              Ver servicios
            </a>
          </div>
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
