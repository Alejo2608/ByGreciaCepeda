import { site } from '../data/site';
import InstagramIcon from './InstagramIcon';
import useReveal from '../lib/useReveal';

// Cada tarjeta aparece al entrar en pantalla, también al desplazarse con el dedo en celular.
function RevealItem({ children, className }) {
  const [ref, visible] = useReveal();
  return (
    <li ref={ref} className={`${className} transition duration-700 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
      {children}
    </li>
  );
}

// Ícono de ubicación (pin) con el mismo trazo que el logo de Instagram.
function MapPinIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

const cardClass =
  'group flex flex-1 items-center justify-center gap-4 rounded-2xl bg-white/60 px-5 py-6 text-center ring-1 ring-mist lg:px-8 transition hover:-translate-y-1 hover:shadow-lg';

export default function Social() {
  return (
    <section id="redes" className="bg-paper px-6 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.35em] text-accent">Síguenos</p>
      <h2 className="mt-3 font-serif text-4xl md:text-5xl">Redes</h2>
      <span aria-hidden="true" className="mx-auto mt-6 block h-px w-16 bg-ink/30" />

      <ul className="mx-auto mt-12 flex max-w-4xl flex-col justify-center gap-6 md:flex-row">
        {site.instagram.map((account) => (
          <RevealItem key={account.url} className="flex flex-1">
            <a href={account.url} target="_blank" rel="noopener noreferrer" className={cardClass}>
              <InstagramIcon className="h-8 w-8 transition group-hover:text-accent" />
              <span className="text-sm uppercase tracking-widest">{account.label}</span>
            </a>
          </RevealItem>
        ))}

        <RevealItem className="flex flex-1">
          <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className={cardClass}>
            <MapPinIcon className="h-8 w-8 shrink-0 transition group-hover:text-accent" />
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-accent">Ubicación</p>
              <p className="mt-1 text-sm leading-relaxed">
                {site.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </div>
          </a>
        </RevealItem>
      </ul>
    </section>
  );
}
