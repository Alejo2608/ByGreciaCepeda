import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { app, db } from './firebase';

// Clave pública VAPID de Firebase (Cloud Messaging → Web Push). No es secreta.
// Se copia desde Firebase Console → Configuración del proyecto → Cloud Messaging.
export const VAPID_KEY = 'PEGAR_AQUI_LA_CLAVE_VAPID';

// Pide permiso, registra el dispositivo y guarda su token para que la función le envíe los avisos.
export async function activarNotificaciones(email) {
  if (!(await isSupported())) throw new Error('no-soportado');
  const permiso = await Notification.requestPermission();
  if (permiso !== 'granted') throw new Error('sin-permiso');

  const registro = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  const token = await getToken(getMessaging(app), { vapidKey: VAPID_KEY, serviceWorkerRegistration: registro });
  if (!token) throw new Error('sin-token');

  // El id del documento es el propio token: cada dispositivo aparece una sola vez.
  await setDoc(doc(db, 'tokens', token), { email, creado: serverTimestamp(), navegador: navigator.userAgent.slice(0, 120) });
  return token;
}

export function notificacionesDisponibles() {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}
