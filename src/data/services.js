// Servicios según el catálogo "Lash & Brows" de Grecia Cepeda. Precios en euros.
// Cada item tiene su propio mensaje de WhatsApp: edita `message` para cambiarlo.
// Maquillaje: precios y fotos del catálogo "Makeup Servicios".

export const lashServices = [
  {
    id: 'clasica-1x1',
    name: 'Técnica clásica 1x1',
    price: '20€',
    image: '/images/services/clasica-1x1.jpg',
    description: 'Aporta naturalidad, look sutil y elegante. Perfecta para pestañas abundantes.',
    notes: ['También en color marrón'],
    message: 'Hola Grecia, me interesa la técnica clásica 1x1 (20€). ¿Me compartes disponibilidad?',
  },
  {
    id: 'efecto-rimel',
    name: 'Efecto rímel',
    price: '25€',
    image: '/images/services/efecto-rimel.jpg',
    description: 'Imita el acabado exacto de la máscara de pestañas comercial. Más línea, uniforme y definido.',
    message: 'Hola Grecia, me interesa el efecto rímel (25€). ¿Me compartes disponibilidad?',
  },
  {
    id: 'efecto-humedo',
    name: 'Efecto húmedo',
    price: '25€',
    image: '/images/services/efecto-humedo.jpg',
    description:
      'Simula pestañas recién mojadas o con un poco de rímel transparente o gel, que las hace lucir agrupadas y brillantes. Ideal si ya probaste las clásicas y quieres "un paso más".',
    message: 'Hola Grecia, me interesa el efecto húmedo (25€). ¿Me compartes disponibilidad?',
  },
  {
    id: 'tecnologicas-5w',
    name: 'Tecnológicas 5W',
    price: '30€',
    image: '/images/services/tecnologicas-5w.jpg',
    description: 'Volumen y densidad notablemente mayores, con abanicos pre-armados para un look uniforme y con cuerpo.',
    notes: ['También en color marrón'],
    message: 'Hola Grecia, me interesan las tecnológicas 5W (30€). ¿Me compartes disponibilidad?',
  },
  {
    id: 'tecno-rimel-aura',
    name: 'Tecno rímel efecto Aura',
    price: '30€',
    image: '/images/services/tecno-rimel-aura.jpg',
    description: 'Mirada más intensa y definida, como si estuvieras maquillada con máscara de pestañas.',
    notes: ['También en color marrón'],
    message: 'Hola Grecia, me interesa el tecno rímel efecto Aura (30€). ¿Me compartes disponibilidad?',
  },
  {
    id: 'three-core',
    name: 'Tecnológicas Three Core',
    price: '30€',
    image: '/images/services/three-core.jpg',
    description: 'Opción de volumen 3D. Ideal si buscas un equilibrio entre look natural y alto impacto.',
    message: 'Hola Grecia, me interesan las tecnológicas Three Core (30€). ¿Me compartes disponibilidad?',
  },
  {
    id: 'curva-m-foxy',
    name: 'Tecnológicas curva "M" Foxy',
    price: '30€',
    image: '/images/services/curva-m-foxy.jpg',
    description: 'Simula una mirada rasgada con un acabado natural y sutil. Ideal para ojos redondos, grandes y almendrados.',
    notes: ['También en color marrón'],
    message: 'Hola Grecia, me interesa la curva M Foxy (30€). ¿Me compartes disponibilidad?',
  },
  {
    id: 'ucraniano',
    name: 'Tecnológicas ucraniano',
    price: '30€',
    image: '/images/services/ucraniano.jpg',
    description: 'Fibras nuevas que se parecen al volumen artesanal, también llamado volumen ruso.',
    notes: ['También en color marrón'],
    message: 'Hola Grecia, me interesan las tecnológicas ucraniano (30€). ¿Me compartes disponibilidad?',
  },
  {
    id: 'camelia',
    name: 'Tecnológicas Camelia',
    price: '25€',
    image: '/images/services/camelia.jpg',
    description:
      'Volumen natural con efecto texturizado y esponjoso. Imitan el crecimiento natural de las pestañas, que no tienen todas la misma longitud.',
    notes: ['También en color marrón'],
    message: 'Hola Grecia, me interesan las tecnológicas Camelia (25€). ¿Me compartes disponibilidad?',
  },
  {
    id: 'kim-k',
    name: 'Efecto Kim-K',
    price: '30€',
    image: '/images/services/kim-k.jpg',
    description: 'Estilo glamuroso con contraste marcado entre la base y las espigas largas. Mirada rasgada y de alto impacto.',
    notes: ['Se puede realizar en cualquier modelo tecnológico'],
    message: 'Hola Grecia, me interesa el efecto Kim-K (30€). ¿Me compartes disponibilidad?',
  },
  {
    id: 'comic-manga',
    name: 'Efecto cómic (manga)',
    price: '30€',
    image: '/images/services/comic-manga.jpg',
    description:
      'Inspirado en el anime: de 5 a 9 picos gruesos y bien definidos sobre una base corta, para una mirada muy expresiva.',
    notes: ['Se puede realizar en cualquier modelo tecnológico'],
    message: 'Hola Grecia, me interesa el efecto cómic (manga) (30€). ¿Me compartes disponibilidad?',
  },
  {
    id: 'retiro',
    name: 'Retiro de extensiones',
    price: '3€',
    image: '/images/retiro.jpg',
    description:
      'Ideal después de cumplir su ciclo, para evitar daños en tus pestañas naturales. Usa productos hipoalergénicos que evitan irritación en tus ojos y piel.',
    message: 'Hola Grecia, quisiera agendar el retiro de extensiones (3€). ¿Qué disponibilidad tienes?',
  },
];

export const browServices = [
  {
    id: 'epilacion-henna',
    name: 'Epilación y henna',
    price: '8€',
    image: '/images/services/epilacion-henna.jpg',
    description:
      'Diseño personalizado acorde a tu fisonomía, con henna de alta calidad que aporta acabados naturales y compactos.',
    notes: ['Solo epilación: 5€'],
    message: 'Hola Grecia, me interesa la epilación y henna (8€). ¿Me compartes disponibilidad?',
  },
  {
    id: 'lash-lifting',
    name: 'Lash lifting',
    price: '20€',
    image: '/images/services/lash-lifting.jpg',
    description:
      'Tratamiento premium X MaxyMova que nutre tus pestañas después de los procedimientos permanentes. Incluye tinturado.',
    message: 'Hola Grecia, me interesa el lash lifting (20€). ¿Me compartes disponibilidad?',
  },
  {
    id: 'brows-lamination',
    name: 'Brows lamination',
    price: '20€',
    image: '/images/services/brows-lamination.jpg',
    description: 'Efecto más completo: incluye tratamiento X MaxyMova, epilación y tinte.',
    message: 'Hola Grecia, me interesa el brows lamination (20€). ¿Me compartes disponibilidad?',
  },
];

export const microBrows = [
  {
    id: 'shadow-brows',
    name: 'Micro Brows (Shadow Brows)',
    price: '90€',
    image: '/images/micro-brows.jpg',
    description:
      'Micropigmentación semipermanente con dermógrafo que crea un sombreado suave y difuminado, con acabado similar al maquillaje en sombra o polvo, sin líneas ni bordes marcados.',
    notes: ['Retoque del mes siguiente', 'Crema post cuidado', 'Depilación gratis al mes 2'],
    message: 'Hola Grecia, me interesan las Micro Brows (Shadow Brows) (90€). ¿Me compartes disponibilidad?',
  },
];

// Maquillaje según el catálogo "Makeup Servicios by Grecia". Precios en euros.
const BRIDAL = 'Asesoría de look, preparación correcta de piel y maquillaje resistente a lágrimas, duradero y adaptado a tu personalidad.';

export const makeupServices = [
  {
    id: 'social',
    name: 'Social Makeup',
    price: '30€',
    image: '/images/makeup/social.jpg',
    description:
      'Asesoría de look, preparación correcta de piel y maquillaje resistente a lágrimas, duradero y adaptado a tu personalidad. Para novias, quinceañeras y grados.',
    message: 'Hola Grecia, me interesa el Social Makeup (30€). ¿Me compartes disponibilidad?',
  },
  {
    id: 'soft',
    name: 'Soft Makeup',
    price: '25€',
    image: '/images/makeup/soft.jpg',
    description:
      'Realza tu belleza natural y se adapta a eventos cotidianos o celebraciones como cumpleaños y bautizos. Armoniza con tu ropa y dura varias horas.',
    message: 'Hola Grecia, me interesa el Soft Makeup (25€). ¿Me compartes disponibilidad?',
  },
  {
    id: 'novias-1',
    name: 'Makeup Novias 1',
    price: '50€',
    image: '/images/makeup/novias-1.jpg',
    description: BRIDAL,
    notes: ['Incluye prueba de maquillaje'],
    message: 'Hola Grecia, me interesa el Makeup Novias 1 (50€, con prueba de maquillaje). ¿Me compartes disponibilidad?',
  },
  {
    id: 'novias-2',
    name: 'Makeup Novias 2',
    price: '55€',
    image: '/images/makeup/novias-2.jpg',
    description: BRIDAL,
    notes: ['Incluye peinado'],
    message: 'Hola Grecia, me interesa el Makeup Novias 2 (55€, con peinado). ¿Me compartes disponibilidad?',
  },
  {
    id: 'novias-3',
    name: 'Makeup Novias 3',
    price: '75€',
    image: '/images/makeup/novias-3.jpg',
    description: BRIDAL,
    notes: ['Incluye peinado y prueba de maquillaje'],
    message: 'Hola Grecia, me interesa el Makeup Novias 3 (75€, con peinado y prueba). ¿Me compartes disponibilidad?',
  },
  {
    id: 'prueba',
    name: 'Prueba de maquillaje',
    price: '30€',
    image: '/images/makeup/prueba.jpg',
    description:
      'Maquillaje social de prueba para evaluar el estilo que quieres para tu evento especial, antes del gran día.',
    message: 'Hola Grecia, me interesa la prueba de maquillaje (30€). ¿Me compartes disponibilidad?',
  },
];
