import { site } from '../data/site';

// Devuelve el enlace de WhatsApp con el mensaje ya escrito (api.whatsapp.com conserva los emojis).
export function buildWhatsAppLink(message) {
  const text = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${site.whatsappNumber}&text=${text}`;
}
