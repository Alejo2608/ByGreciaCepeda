// Cursos. Edita name, description, duration, price, includes y message.
export const courses = [
  {
    id: 'fibras-pro-lash',
    name: 'Extensiones de pestañas pelo a pelo',
    description: 'Mi técnica “Fibras Pro Lash”. Teórico práctico con modelo real.',
    duration: '2 días, 8:00 AM a 1:00 PM',
    bloque: { dias: 2, inicio: '08:00', fin: '13:00' },
    price: '150 USD',
    image: '/images/cursos/fibras-pro-lash.jpg',
    includes: ['Kit de inicio', 'Certificado impreso', 'Guía práctica'],
    message: 'Hola Grecia, me interesa el curso de extensiones de pestañas pelo a pelo (Fibras Pro Lash). ¿Me compartes fechas?',
  },
  {
    id: 'cejas-desde-cero',
    name: 'Diseño de cejas desde 0',
    description: 'Mi técnica “Visagismo y Henna”. Teórico práctico con modelo real.',
    duration: '5 horas, 8:00 AM a 1:00 PM',
    bloque: { dias: 1, inicio: '08:00', fin: '13:00' },
    price: '100 USD',
    image: '/images/cursos/cejas-desde-cero.jpg',
    includes: ['Kit de inicio', 'Certificado impreso', 'Guía práctica'],
    message: 'Hola Grecia, me interesa el curso de diseño de cejas desde 0 (Visagismo y Henna). ¿Me compartes fechas?',
  },
  // Curso de maquillaje profesional: pendiente, Grecia lo enviará después.
];
