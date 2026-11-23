// Cloud Functions: avisa por notificación push cuando una clienta envía una solicitud nueva.
// Se despliega con: firebase deploy --only functions (requiere plan Blaze).
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();

// Al tocar la notificación se abre el panel directamente en el día de la solicitud.
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
    webpush: { fcmOptions: { link: `${SITIO}?fecha=${r.fecha}` } },
  });

  // Registro del resultado: sirve para revisar en "firebase functions:log" si el aviso salió y a cuántos equipos.
  console.log(
    `aviso ${r.nombre} ${r.fecha} ${r.hora}: enviados=${respuesta.successCount} fallidos=${respuesta.failureCount}`,
  );
  respuesta.responses.forEach((res, i) => {
    if (res.error) console.log(`error token ${i}: ${res.error.code}`);
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
