
// Servicios según el catálogo "Lash & Brows" de Grecia Cepeda. Precios en dólares (USD).
// Cada item tiene su propio mensaje de WhatsApp: edita `message` para cambiarlo.
// Maquillaje: precios y fotos del catálogo "Makeup Servicios".
export const lashServices = [
  {
    id: 'clasica-1x1',
    name: 'Técnica clásica 1x1',
    price: '23 USD',
    duration: '2 horas',
    image: '/images/services/clasica-1x1.jpg',
    description: 'Aporta naturalidad, look sutil y elegante. Perfecta para pestañas abundantes.',
    notes: ['También en color marrón'],
    message: 'Hola Grecia, me interesa la técnica clásica 1x1 (23 USD). ¿Me compartes disponibilidad?',
  },
  {
    id: 'efecto-rimel',
    name: 'Efecto rímel',
    price: '28 USD',
    duration: '2 horas',
    image: '/images/services/efecto-rimel.jpg',
    description: 'Imita el acabado exacto de la máscara de pestañas comercial. Más línea, uniforme y definido.',
    message: 'Hola Grecia, me interesa el efecto rímel (28 USD). ¿Me compartes disponibilidad?',
  },
  {
    id: 'efecto-humedo',
    name: 'Efecto húmedo',
    price: '28 USD',
    duration: '2 horas',
    image: '/images/services/efecto-humedo.jpg',
    description:
      'Simula pestañas recién mojadas o con un poco de rímel transparente o gel, que las hace lucir agrupadas y brillantes. Ideal si ya probaste las clásicas y quieres "un paso más".',
    message: 'Hola Grecia, me interesa el efecto húmedo (28 USD). ¿Me compartes disponibilidad?',
  },
  {
    id: 'tecnologicas-5w',
    name: 'Tecnológicas 5W',
    price: '35 USD',
    duration: '2 horas',
    image: '/images/services/tecnologicas-5w.jpg',
    description: 'Volumen y densidad notablemente mayores, con abanicos pre-armados para un look uniforme y con cuerpo.',
    notes: ['También en color marrón'],
    message: 'Hola Grecia, me interesan las tecnológicas 5W (35 USD). ¿Me compartes disponibilidad?',
  },
  {
    id: 'tecno-rimel-aura',
    name: 'Tecno rímel efecto Aura',
    price: '35 USD',
    duration: '2 horas',
    image: '/images/services/tecno-rimel-aura.jpg',
    description: 'Mirada más intensa y definida, como si estuvieras maquillada con máscara de pestañas.',
    notes: ['También en color marrón'],
    message: 'Hola Grecia, me interesa el tecno rímel efecto Aura (35 USD). ¿Me compartes disponibilidad?',
  },
  {
    id: 'three-core',
    name: 'Tecnológicas Three Core',
    price: '35 USD',
    duration: '2 horas',
    image: '/images/services/three-core.jpg',
    description: 'Opción de volumen 3D. Ideal si buscas un equilibrio entre look natural y alto impacto.',
    message: 'Hola Grecia, me interesan las tecnológicas Three Core (35 USD). ¿Me compartes disponibilidad?',
  },
  {
    id: 'curva-m-foxy',
    name: 'Tecnológicas curva "M" Foxy',
    price: '35 USD',
    duration: '2 horas',
    image: '/images/services/curva-m-foxy.jpg',
    description: 'Simula una mirada rasgada con un acabado natural y sutil. Ideal para ojos redondos, grandes y almendrados.',
    notes: ['También en color marrón'],
    message: 'Hola Grecia, me interesa la curva M Foxy (35 USD). ¿Me compartes disponibilidad?',
  },
  {
    id: 'ucraniano',
    name: 'Tecnológicas ucraniano',
    price: '35 USD',
    duration: '2 horas',
    image: '/images/services/ucraniano.jpg',
    destacado: true,
    description: 'Fibras nuevas que se parecen al volumen artesanal, también llamado volumen ruso.',
    notes: ['También en color marrón'],
    message: 'Hola Grecia, me interesan las tecnológicas ucraniano (35 USD). ¿Me compartes disponibilidad?',
  },
  {
    id: 'kim-k',
    name: 'Efecto Kim-K',
    price: '35 USD',
    duration: '2 horas',
    image: '/images/services/kim-k.jpg',
    description: 'Estilo glamuroso con contraste marcado entre la base y las espigas largas. Mirada rasgada y de alto impacto.',
    notes: ['Se puede realizar en cualquier modelo tecnológico'],
    message: 'Hola Grecia, me interesa el efecto Kim-K (35 USD). ¿Me compartes disponibilidad?',
  },
  {
    id: 'comic-manga',
    name: 'Efecto cómic (manga)',
    price: '35 USD',
    duration: '2 horas',
    image: '/images/services/comic-manga.jpg',
    description:
      'Inspirado en el anime: de 5 a 9 picos gruesos y bien definidos sobre una base corta, para una mirada muy expresiva.',
    notes: ['Se puede realizar en cualquier modelo tecnológico'],
    message: 'Hola Grecia, me interesa el efecto cómic (manga) (35 USD). ¿Me compartes disponibilidad?',
  },
  {
    id: 'retiro',
    name: 'Retiro de extensiones',
    price: '3 USD',
    duration: '2 horas',
    image: '/images/retiro.jpg',
    description:
      'Ideal después de cumplir su ciclo, para evitar daños en tus pestañas naturales. Usa productos hipoalergénicos que evitan irritación en tus ojos y piel.',
    message: 'Hola Grecia, quisiera agendar el retiro de extensiones (3 USD). ¿Qué disponibilidad tienes?',
  },
];

export const browServices = [
  {
    id: 'epilacion-henna',
    name: 'Epilación con henna',
    price: '10 USD',
    duration: '30 minutos',
    image: '/images/services/epilacion-henna.jpg',
    description:
      'Diseño personalizado acorde a tu fisonomía, con henna de alta calidad que aporta acabados naturales y compactos.',
    notes: ['Solo epilación con diseño: 6 USD'],
    message: 'Hola Grecia, me interesa la epilación con henna (10 USD). ¿Me compartes disponibilidad?',
  },
  {
    id: 'lash-lifting',
    name: 'Lash lifting',
    price: '25 USD',
    duration: '1 hora',
    image: '/images/services/lash-lifting.jpg',
    description:
      'Tratamiento premium X MaxyMova que nutre tus pestañas después de los procedimientos permanentes. Incluye tinturado.',
    message: 'Hola Grecia, me interesa el lash lifting (25 USD). ¿Me compartes disponibilidad?',
  },
  {
    id: 'brows-lamination',
    name: 'Brows lamination',
    price: '20 USD',
    duration: '1 hora',
    image: '/images/services/brows-lamination.jpg',
    description: 'Efecto más completo: incluye tratamiento X MaxyMova, epilación y tinte.',
    message: 'Hola Grecia, me interesa el brows lamination (20 USD). ¿Me compartes disponibilidad?',
  },
];
export const microBrows = [
  {
    id: 'shadow-brows',
    name: 'Micro Brows (Shadow Brows)',
    price: '80 USD',
    duration: '2 horas',
    image: '/images/micro-brows.jpg',
    description:
      'Micropigmentación semipermanente con dermógrafo que crea un sombreado suave y difuminado, con acabado similar al maquillaje en sombra o polvo, sin líneas ni bordes marcados. Primera sesión.',
    notes: ['Crema post cuidado', 'Depilación gratis al mes 2'],
    message: 'Hola Grecia, me interesan las Micro Brows (Shadow Brows) primera sesión (80 USD). ¿Me compartes disponibilidad?',
  },
  {
    id: 'retoque-micro-brows',
    name: 'Retoque de micro brows',
    image: '/images/retoque-micro-brows.jpg',
    price: '40 USD',
    duration: '2 horas',
    
    description:
      'Segunda sesión de retoque de tu micropigmentación de cejas, para corregir y fortalecer el color y la forma.',
    notes: ['Depilación gratis'],
    message: 'Hola Grecia, me interesa el retoque de micro brows (40 USD). ¿Me compartes disponibilidad?',
  },
];

// Maquillaje según el catálogo "Makeup Servicios by Grecia". Precios en dólares (USD).
export const makeupServices = [
  {
    id: 'social',
    name: 'Social Makeup',
    destacado: true,
    ideal: 'Tus noches especiales: cumpleaños, graduaciones, cenas o cualquier evento social.',
    price: '40 USD',
    duration: '1 hora y 30 minutos',
    image: '/images/makeup/social.jpg',
    description:
      'Un maquillaje pensado para que luzcas impecable de principio a fin: asesoría de look, piel bien preparada y un acabado resistente a lágrimas, adaptado a tu personalidad y a tu outfit.',
    message: 'Hola Grecia, me interesa el Social Makeup (40 USD). ¿Me compartes disponibilidad?',
  },
  {
    id: 'soft',
    name: 'Soft Makeup',
    ideal: 'Celebraciones de día o salidas especiales: bautizos, cumpleaños y reuniones familiares.',
    price: '35 USD',
    duration: '1 hora y 30 minutos',
    image: '/images/makeup/soft.jpg',
    description:
      'Realza tu belleza natural con un acabado suave y luminoso que armoniza con tu ropa y se mantiene durante toda la celebración.',
    message: 'Hola Grecia, me interesa el Soft Makeup (35 USD). ¿Me compartes disponibilidad?',
  },
  {
    id: 'novias-1',
    name: 'Makeup Novias',
    ideal: 'Tu gran boda: el maquillaje que te acompaña desde el primer "sí" hasta la última foto.',
    price: '45 USD',
    duration: '1 hora y 30 minutos',
    image: '/images/makeup/novias-1.jpg',
    description:
      'Tu día merece un maquillaje que se vea perfecto en fotos y en persona. Asesoría de look desde el inicio, piel bien preparada y un acabado resistente a lágrimas y a la emoción.',
    message: 'Hola Grecia, me interesa el Makeup Novias (45 USD, con prueba de maquillaje). ¿Me compartes disponibilidad?',
  },
  {
    id: 'quince',
    name: 'Makeup Quinceañeras',
    ideal: 'Tu gran noche de quince: el maquillaje que brilla igual que tú, de la foto de entrada al último baile.',
    price: '45 USD',
    duration: '1 hora y 30 minutos',
    image: '/images/makeup/quince.jpg',
    description:
      'Tu noche de quince merece brillar. Te acompañamos con asesoría de look, piel bien preparada y un maquillaje duradero que se adapta a tu personalidad y a tu vestido.',
    message: 'Hola Grecia, me interesa el maquillaje para quinceañeras (45 USD). ¿Me compartes disponibilidad?',
  },
  {
    id: 'prueba',
    name: 'Prueba de maquillaje',
    ideal: 'Elegir tu look antes del gran día, sin sorpresas.',
    price: '30 USD',
    duration: '1 hora y 30 minutos',
    image: '/images/makeup/prueba.jpg',
    description:
      'Pruébalo con tiempo: un maquillaje social de prueba para ver el estilo que quieres y ajustar lo que te guste antes de tu evento.',
    message: 'Hola Grecia, me interesa la prueba de maquillaje (30 USD). ¿Me compartes disponibilidad?',
  },
];
