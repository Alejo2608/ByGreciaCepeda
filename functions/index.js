// Cloud Functions: avisa por notificación push cuando una clienta envía una solicitud nueva.
// Se despliega con: firebase deploy --only functions (requiere plan Blaze).
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();

const SITIO = 'https://bygreciacepeda.site/#admin';

exports.avisoNuevaSolicitud = onDocumentCreated('reservas/{reservaId}', async (event) => {
  const r = event.data?.data();
  // Solo las solicitudes de clientas (pendientes). Las citas que Grecia agenda a mano no avisan.
  if (!r || r.estado !== 'pendiente') return;

  const tokensSnap = await getFirestore().collection('tokens').get();
  const tokens = tokensSnap.docs.map((d) => d.id);
  if (tokens.length === 0) return;

  const respuesta = await getMessaging().sendEachForMulticast({
    tokens,
    notification: {
      title: 'Nueva solicitud de cita',
      body: `${r.nombre} · ${r.servicio} · ${r.fecha} ${r.hora}`,
    },
    webpush: { fcmOptions: { link: SITIO } },
  });

  // Limpia los dispositivos que ya no aceptan notificaciones (permiso revocado, navegador borrado).
  const borrar = [];
  respuesta.responses.forEach((res, i) => {
    const codigo = res.error?.code;
    if (codigo === 'messaging/registration-token-not-registered' || codigo === 'messaging/invalid-registration-token') {
      borrar.push(tokensSnap.docs[i].ref.delete());
    }
  });
  await Promise.all(borrar);
});
