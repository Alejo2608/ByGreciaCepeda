import ServiceCard from './ServiceCard';

export default function CategoryPage({ category }) {
  return (
    <section className="px-4 pb-24 pt-32 md:px-6">
      <div className="mx-auto max-w-6xl">
        <a href="#inicio" className="text-xs uppercase tracking-widest text-accent transition hover:text-ink">
          ← Volver al inicio
        </a>

        <div className="mt-10 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-accent">{category.eyebrow}</p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">{category.pageTitle}</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink/75">{category.pageDescription}</p>
        </div>

        {category.groups.map((group) => (
          <div key={group.title}>
            {category.groups.length > 1 && (
              <h2 className="mb-8 mt-16 font-serif text-3xl">{group.title}</h2>
            )}
            <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${category.groups.length > 1 ? '' : 'mt-16'}`}>
              {group.items.map((service) => (
                <ServiceCard key={service.id} {...service} withTerms={category.withTerms} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
