import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import CategoryPage from './components/CategoryPage';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import { categories } from './data/categories';

// Sitio estático: cada categoría tiene su página en #id, sin router ni configuración extra en el hosting.
function useHash() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return hash;
}

export default function App() {
  const hash = useHash();
  const page = categories.find((category) => `#${category.id}` === hash);

  useEffect(() => {
    if (page) {
      window.scrollTo(0, 0);
      return;
    }
    // Al volver al inicio desde otra vista, el elemento aún no existía cuando el navegador intentó hacer scroll.
    const target = hash && document.getElementById(hash.slice(1));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  }, [hash, page]);

  return (
    <>
      <Navbar />
      <main>
        {page ? (
          <CategoryPage category={page} />
        ) : (
          <>
            <Hero />
            <About />
            <Services />
          </>
        )}
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
