import { useEffect } from 'react';
import { createPortal } from 'react-dom';

// Ventana de confirmación con el mismo estilo de los términos y condiciones.
export default function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="relative w-full max-w-md rounded-2xl bg-paper p-8 shadow-2xl"
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

        <h2 id="confirm-title" className="font-serif text-3xl leading-tight">
          {title}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-ink/80">{message}</p>

        <div className="mt-8 flex gap-3">
          <button type="button" onClick={onConfirm} className="btn-fill flex-1">
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-ink/30 px-8 py-3 text-center text-sm uppercase tracking-widest transition hover:bg-mist"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
