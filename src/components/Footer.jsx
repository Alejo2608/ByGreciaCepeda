import { site } from '../data/site';
import { categories } from '../data/categories';

const hours = [
  { days: 'Lunes a sábado', time: '8:00 AM – 6:00 PM' },
  { days: 'Maquillaje', time: '6:00 AM – 8:00 PM' },
  { days: 'Domingo', time: 'Solo maquillaje y cursos' },
];

// Encabezado de cada columna, con la línea decorativa que usa el resto de la página.
function Heading({ children }) {
  return (
    <p className="flex items-center gap-3 text-xs uppercase tracking-[0.25em]">
      <span aria-hidden="true" className="h-px w-6 bg-ink/50" />
      {children}
    </p>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-mist bg-paper px-6 py-6 text-ink md:px-10">
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
        <div>
          <p className="font-serif text-xl">{site.name}</p>
          <p className="mt-2 text-xs leading-relaxed text-ink/75">
            Lashista, maquilladora y educadora. Trujillo, Venezuela.
          </p>
          <p className="mt-3 text-xs leading-relaxed">
            {site.address.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>

        <div>
          <Heading>Explorar</Heading>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {categories.map((category) => (
              <li key={category.id}>
                <a href={`#${category.id}`} className="transition hover:text-accent">
                  {category.pageTitle}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Heading>Horario</Heading>
          <ul className="mt-3 space-y-2 text-sm">
            {hours.map((item) => (
              <li key={item.days}>
                <span className="text-ink/60">{item.days}: </span>
                <span>{item.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-6xl border-t border-ink/15 pt-4 text-xs text-ink/50">
        © {new Date().getFullYear()} {site.name}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
