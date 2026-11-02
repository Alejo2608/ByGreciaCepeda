import { useEffect, useRef, useState } from 'react';

// Clases completas para que Tailwind no las elimine al compilar.
const tints = {
  paper: 'bg-paper',
  warm: 'bg-warm',
  cool: 'bg-cool',
  ink: 'bg-ink',
};

// Una palabra del título va en letra script, como en el catálogo.
function Title({ text, accent }) {
  if (!accent || !text.includes(accent)) return text;
  const [before, after] = text.split(accent);
  return (
    <>
      {before}
      <span className="font-script text-[1.2em] font-normal">{accent}</span>
      {after}
    </>
  );
}

export default function CategoryIntro({ category, index }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const reversed = index % 2 === 1;
  const dark = category.tint === 'ink';

  // Entrada cuando la sección entra en pantalla.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`rounded-[2.5rem] px-6 py-14 transition-all duration-1000 ease-out motion-reduce:transition-none md:px-14 ${
        tints[category.tint] ?? tints.paper
      } ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        <div className={`group relative mx-auto w-full max-w-xs md:max-w-sm ${reversed ? 'md:order-2' : ''}`}>
          {/* Marco desplazado detrás de la foto */}
          <div
            aria-hidden="true"
            className={`absolute inset-0 translate-x-4 translate-y-4 rounded-[2rem] border ${
              dark ? 'border-paper/30' : 'border-ink/20'
            }`}
          />
          <div
            className={`relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-mist shadow-xl ring-1 transition-[clip-path] duration-[1000ms] ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none ${
              dark ? 'ring-paper/10' : 'ring-ink/5'
            }`}
            style={{ clipPath: visible ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)' }}
          >
            {category.image && (
              <img
                src={category.image}
                alt={category.imageAlt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
              />
            )}
          </div>
        </div>

        <div className={`text-center md:text-left ${reversed ? 'md:order-1' : ''}`}>
          <p className={`text-xs uppercase tracking-[0.35em] ${dark ? 'text-paper/60' : 'text-accent'}`}>
            {category.eyebrow}
          </p>
          <h3 className={`mt-3 font-serif text-4xl leading-tight md:text-5xl ${dark ? 'text-paper' : ''}`}>
            <Title text={category.title} accent={category.titleAccent} />
          </h3>
          <span
            aria-hidden="true"
            className={`mx-auto mt-6 block h-px w-16 md:mx-0 ${dark ? 'bg-paper/30' : 'bg-ink/30'}`}
          />
          <p
            className={`mx-auto mt-6 max-w-md text-base leading-relaxed md:mx-0 ${
              dark ? 'text-paper/80' : 'text-ink/80'
            }`}
          >
            {category.intro}
          </p>
          <a
            href={`#${category.id}`}
            className={
              dark
                ? 'btn-fill mt-10 border-paper text-paper hover:bg-paper hover:text-ink'
                : 'btn-fill mt-10'
            }
          >
            {category.buttonLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
