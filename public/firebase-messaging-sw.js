// Service worker de las notificaciones push del panel. Se ejecuta aparte de la página.
// Debe quedar en la raíz del sitio (public/), por eso se llama así.
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAlcpsd3Ud4yHreeFEqoVLyeUzrNujQp0Y',
  authDomain: 'bygreciacepeda.firebaseapp.com',
  projectId: 'bygreciacepeda',
  storageBucket: 'bygreciacepeda.firebasestorage.app',
  messagingSenderId: '285669188744',
  appId: '1:285669188744:web:480c38c2c879abb1472b3d',
});

const messaging = firebase.messaging();

// Aviso cuando la página no está abierta. Al tocarlo se abre el panel.
messaging.onBackgroundMessage((payload) => {
  const titulo = payload.notification?.title ?? 'Nueva solicitud';
  const cuerpo = payload.notification?.body ?? '';
  self.registration.showNotification(titulo, {
    body: cuerpo,
    icon: '/images/grecia.jpg',
    data: { url: payload.fcmOptions?.link ?? 'https://bygreciacepeda.site/#admin' },
  });
});

// Solo se abren enlaces del mismo sitio: así un mensaje manipulado no puede llevar a otra página.
const INICIO_PANEL = 'https://bygreciacepeda.site/#admin';
function enlaceSeguro(url) {
  try {
    return new URL(url, self.location.origin).origin === self.location.origin ? url : INICIO_PANEL;
  } catch {
    return INICIO_PANEL;
  }
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = enlaceSeguro(event.notification.data?.url ?? INICIO_PANEL);
  event.waitUntil(clients.openWindow(url));
});
