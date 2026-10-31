import { useState } from 'react';
import { buildWhatsAppLink } from '../lib/whatsapp';
import TermsDialog from './TermsDialog';

export default function ServiceCard({ name, price, description, notes, message, image, withTerms }) {
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white/60 ring-1 ring-mist transition hover:-translate-y-1 hover:shadow-lg">
      {image && (
        <div className="p-4 pb-0">
          <img src={image} alt={name} loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <h4 className="font-serif text-2xl leading-snug">{name}</h4>
          <span className="shrink-0 rounded-full border border-ink px-3 py-1 text-sm">{price}</span>
        </div>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/75">{description}</p>
        {notes && (
          <ul className="mt-4 space-y-1 text-xs uppercase tracking-widest text-accent">
            {notes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        )}
        {withTerms && (
          <button
            type="button"
            onClick={() => setTermsOpen(true)}
            className="mt-6 text-center text-xs uppercase tracking-widest text-accent underline-offset-4 transition hover:text-ink hover:underline"
          >
            Términos y condiciones
          </button>
        )}
        <a
          href={buildWhatsAppLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${withTerms ? 'mt-3' : 'mt-6'} btn-fill w-full py-2 text-xs`}
        >
          Agendar
        </a>
      </div>
      {withTerms && <TermsDialog open={termsOpen} onClose={() => setTermsOpen(false)} />}
    </article>
  );
}
