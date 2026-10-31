import { site } from '../data/site';

// Devuelve el enlace de wa.me con el mensaje ya escrito.
export function buildWhatsAppLink(message) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${site.whatsappNumber}?text=${text}`;
}
