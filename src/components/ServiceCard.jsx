import { useState } from 'react';
import TermsDialog from './TermsDialog';
import BookingDialog from './BookingDialog';
import useReveal from '../lib/useReveal';

// withForm = maquillaje: primero se aceptan los términos y después se muestra la encuesta de preferencias.
// Maquillaje muestra su información en diapositivas (carrusel); los demás servicios muestran todo fijo.
export default function ServiceCard({
  name,
  price,
  duration,
  description,
  notes,
  image,
  withDiscount,
  withForm,
  allowSunday,
  bloque,
  imageClass = 'aspect-[4/3] object-cover',
  ...service
}) {
  const [termsOpen, setTermsOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [revealRef, visible] = useReveal();
  const item = { name, price, duration, bloque: service.bloque };

  const slides = [
    {
      titulo: 'Descripción',
      contenido: (
        <>
          <p className="text-sm leading-relaxed text-ink/75">{description}</p>
          {duration && bloque && (
            <p className="mt-3 text-xs uppercase tracking-widest text-accent">Duración: {duration}</p>
          )}
          {withDiscount && (
            <p className="mt-3 text-xs uppercase tracking-widest text-accent">
              <span className="font-script text-lg normal-case text-ink">10 %</span> de descuento pagando en Binance,
              Zelle o Efectivo
            </p>
          )}
        </>
      ),
    },
    service.ideal && {
      titulo: 'Perfecto para',
      contenido: <p className="text-sm leading-relaxed text-ink/80">{service.ideal}</p>,
    },
    withForm &&
      notes && {
        titulo: 'Incluye',
        contenido: (
          <ul className="space-y-2 text-sm text-ink/80">
            {notes.map((note) => (
              <li key={note} className="flex gap-3">
                <span aria-hidden="true" className="text-accent">✓</span>
                {note}
              </li>
            ))}
          </ul>
        ),
      },
  ].filter(Boolean);

  const actual = slides[slide] ?? slides[0];
  const siguiente = () => setSlide((s) => (s + 1) % slides.length);
  const anterior = () => setSlide((s) => (s - 1 + slides.length) % slides.length);

  return (
    <article
      ref={revealRef}
      className={`group flex flex-col overflow-hidden rounded-2xl bg-white/60 ring-1 ring-mist transition duration-700 hover:-translate-y-1 hover:shadow-lg active:-translate-y-1 active:shadow-lg ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      {image && (
        <div className="relative p-4 pb-0">
          <div className="overflow-hidden rounded-2xl">
            <img
              src={image}
              alt={name}
              loading="lazy"
              className={`${imageClass} w-full transition duration-700 ease-out group-hover:scale-105 group-active:scale-105`}
            />
          </div>
          {service.destacado && (
            <span className="absolute left-8 top-8 rounded-full bg-ink px-3 py-1 text-xs text-paper">★ Más pedido</span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <h4
            className={`font-serif text-2xl leading-snug transition duration-700 ease-out ${
              visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
            }`}
            style={{ transitionDelay: '0.15s' }}
          >
            {name}
          </h4>
          <span
            className={`shrink-0 rounded-full border border-ink px-3 py-1 text-sm transition duration-700 ease-out ${
              visible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
            }`}
            style={{ transitionDelay: '0.3s' }}
          >
            {price}
          </span>
        </div>

        {withForm ? (
          <>
            {/* Diapositiva actual: una sola sección a la vez para que la tarjeta no se vea recargada. */}
            <div className="mt-4 flex min-h-[7.5rem] flex-1 flex-col">
              <p className="text-xs uppercase tracking-[0.25em] text-accent">{actual.titulo}</p>
              <div key={slide} className="slide-in mt-2 flex-1">
                {actual.contenido}
              </div>
            </div>

            {slides.length > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-2" aria-hidden="true">
                  {slides.map((_, i) => (
                    <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === slide ? 'bg-ink' : 'bg-ink/25'}`} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={anterior}
                    aria-label="Anterior"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 transition hover:bg-mist"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={siguiente}
                    aria-label="Siguiente"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 transition hover:bg-mist"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {service.ideal && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.25em] text-accent">Perfecto para</p>
                <p className="mt-1 text-sm leading-relaxed text-ink/80">{service.ideal}</p>
              </div>
            )}
            <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/75">{description}</p>
            {duration && bloque && (
              <p className="mt-3 text-xs uppercase tracking-widest text-accent">Duración: {duration}</p>
            )}
            {notes && (
              <ul className="mt-4 space-y-1 text-xs uppercase tracking-widest text-accent">
                {notes.map((note) => (
                  <li key={note}>• {note}</li>
                ))}
              </ul>
            )}
            {withDiscount && (
              <p className="mt-5 text-center text-xs uppercase tracking-widest text-accent">
                <span className="font-script text-lg normal-case text-ink">10 %</span> de descuento pagando en Binance,
                Zelle o Efectivo
              </p>
            )}
          </>
        )}

        <button
          type="button"
          onClick={() => (withForm ? setTermsOpen(true) : setBookingOpen(true))}
          className="btn-fill mt-6 w-full py-2 text-xs"
        >
          Agendar
        </button>
      </div>

      {withForm && (
        <TermsDialog open={termsOpen} onClose={() => setTermsOpen(false)} onAccept={() => setBookingOpen(true)} />
      )}
      <BookingDialog
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        service={item}
        preferences={Boolean(withForm)}
        allowSunday={Boolean(withForm) || Boolean(allowSunday)}
      />
    </article>
  );
}
