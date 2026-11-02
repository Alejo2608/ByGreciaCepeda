import { useEffect } from 'react';
import { createPortal } from 'react-dom';

// Ventana del panel de Grecia con el mismo estilo de los términos y condiciones.
export default function AdminModal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-paper p-8 shadow-2xl"
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
        <h2 className="font-serif text-3xl leading-tight">{title}</h2>
        <div className="mt-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
