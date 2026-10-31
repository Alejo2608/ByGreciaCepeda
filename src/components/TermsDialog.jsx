import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { terms } from '../data/terms';

// Se renderiza en el body para que no lo afecten las transformaciones de las tarjetas.
export default function TermsDialog({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-title"
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-paper p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-xl transition hover:bg-mist"
        >
          ×
        </button>

        <h2 id="terms-title" className="font-serif text-3xl leading-tight">
          Términos y <span className="font-semibold">condiciones</span>
        </h2>

        <ul className="mt-6 space-y-4 text-sm leading-relaxed text-ink/80">
          {terms.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
