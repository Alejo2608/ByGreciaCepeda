import { useState } from 'react';
import TermsDialog from './TermsDialog';
import BookingDialog from './BookingDialog';

// withForm = maquillaje: primero se aceptan los términos y después se muestra la encuesta de preferencias.
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
  const item = { name, price, duration, bloque: service.bloque };

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white/60 ring-1 ring-mist transition hover:-translate-y-1 hover:shadow-lg">
      {image && (
        <div className="p-4 pb-0">
          <img src={image} alt={name} loading="lazy" className={`${imageClass} w-full rounded-2xl`} />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <h4 className="font-serif text-2xl leading-snug">{name}</h4>
          <span className="shrink-0 rounded-full border border-ink px-3 py-1 text-sm">{price}</span>
        </div>
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
