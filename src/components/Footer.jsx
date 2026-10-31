import { site } from '../data/site';
import { buildWhatsAppLink } from '../lib/whatsapp';

export default function Footer() {
  return (
    <footer className="border-t border-mist bg-paper px-4 py-12 text-center md:px-6">
      <p className="font-serif text-2xl">{site.name}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs uppercase tracking-widest">
        {site.instagram.map((account) => (
          <a
            key={account.url}
            href={account.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent"
          >
            {account.label}
          </a>
        ))}
        <a
          href={buildWhatsAppLink('Hola Grecia, quisiera hacer una consulta.')}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-accent"
        >
          WhatsApp
        </a>
      </div>
      <p className="mt-4 text-sm text-ink/75">{site.email}</p>
      <p className="mt-8 text-xs text-ink/50">
        © {new Date().getFullYear()} {site.name}. Todos los derechos reservados.
      </p>
    </footer>
  );
}
