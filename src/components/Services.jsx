import { categories } from '../data/categories';
import CategoryIntro from './CategoryIntro';

export default function Services() {
  return (
    <section id="servicios" className="bg-mist/30 px-4 py-10 md:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="space-y-28">
          {categories.map((category, index) => (
            <CategoryIntro key={category.id} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
