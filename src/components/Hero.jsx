import { buildWhatsAppLink } from '../lib/whatsapp';

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-paper via-mist/40 to-paper pt-24"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 md:grid-cols-2 md:px-6">
        <div className="relative z-10 text-center md:text-left">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-accent">Lashista · Maquillaje · Cursos</p>
          <h1 className="font-serif text-5xl leading-tight md:text-7xl">
            Tu mirada, <span className="italic text-accent">realzada</span> con arte
          </h1>
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-ink/80 md:mx-0">
            Extensiones de pestañas, maquillaje para cada ocasión y formación para quienes quieren
            hacer de la belleza su profesión.
          </p>
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
          <img
            src="/images/grecia.jpg"
            alt="Grecia Cepeda, maquilladora profesional"
            className="h-full w-full object-cover object-top"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-paper/75 md:hidden" />
        </div>
      </div>
    </section>
  );
}
