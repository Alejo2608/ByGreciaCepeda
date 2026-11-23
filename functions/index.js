// Cloud Functions de Grecia Cepeda.
// 1) avisoNuevaSolicitud: cuando una clienta envía una solicitud, guarda el aviso y lo envía al celular.
// 2) recordatorioDiario: todos los días a las 6:00 PM (hora de Venezuela) avisa las citas del día siguiente.
// Se despliegan con: firebase deploy --only functions (requiere plan Blaze).
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();

const SITIO = 'https://bygreciacepeda.site/#admin';

// Guarda un aviso en la campana del panel.
async function guardarAviso(datos) {
  await getFirestore()
    .collection('notificaciones')
    .add({ ...datos, leida: false, creado: FieldValue.serverTimestamp() });
}

// Envía la notificación a todos los celulares registrados y limpia los que ya no sirven.
async function enviarPush({ titulo, texto, link }) {
  const tokensSnap = await getFirestore().collection('tokens').get();
  if (tokensSnap.empty) return;

  const respuesta = await getMessaging().sendEachForMulticast({
    tokens: tokensSnap.docs.map((d) => d.id),
    notification: { title: titulo, body: texto },
    webpush: { fcmOptions: { link } },
  });

  console.log(`push "${titulo}": enviados=${respuesta.successCount} fallidos=${respuesta.failureCount}`);
  respuesta.responses.forEach((res, i) => {
    if (res.error) console.log(`error token ${i}: ${res.error.code}`);
  });

  const borrar = [];
  respuesta.responses.forEach((res, i) => {
    const codigo = res.error?.code;
    if (codigo === 'messaging/registration-token-not-registered' || codigo === 'messaging/invalid-registration-token') {
      borrar.push(tokensSnap.docs[i].ref.delete());
    }
  });
  await Promise.all(borrar);
}

// "08:30" → "8:30 AM".
function hora12(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const sufijo = h >= 12 ? 'PM' : 'AM';
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, '0')} ${sufijo}`;
}

// Fecha de mañana en Venezuela (AAAA-MM-DD).
function mananaEnVenezuela() {
  const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Caracas' });
  const [y, m, d] = hoy.split('-').map(Number);
  const manana = new Date(Date.UTC(y, m - 1, d + 1));
  return manana.toISOString().slice(0, 10);
}

exports.avisoNuevaSolicitud = onDocumentCreated('reservas/{reservaId}', async (event) => {
  const r = event.data?.data();
  // Solo las solicitudes de clientas (pendientes). Las citas que Grecia agenda a mano no avisan.
  if (!r || r.estado !== 'pendiente') return;

  const titulo = 'Nueva solicitud de cita';
  const texto = `${r.nombre} · ${r.servicio} · ${r.fecha} ${r.hora}`;
  await guardarAviso({ tipo: 'solicitud', titulo, texto, fecha: r.fecha, hora: r.hora, reservaId: event.params.reservaId });
  await enviarPush({ titulo, texto, link: `${SITIO}?fecha=${r.fecha}` });
});

exports.recordatorioDiario = onSchedule(
  { schedule: '0 18 * * *', timeZone: 'America/Caracas', region: 'us-east1' },
  async () => {
    const manana = mananaEnVenezuela();
    const snap = await getFirestore().collection('reservas').where('fecha', '==', manana).get();
    const citas = snap.docs
      .map((d) => d.data())
      .filter((r) => (r.estado === 'confirmada' || r.estado === 'pendiente') && !r.sinHorario)
      .sort((a, b) => a.hora.localeCompare(b.hora));

    // Si mañana no hay citas, no se envía nada.
    if (citas.length === 0) return;

    // Una cita por línea: "8:00 AM · Wilmary caldera". Si el nombre es muy largo se corta con "…" para que no se parta.
    const cortar = (texto, max) => (texto.length > max ? `${texto.slice(0, max - 1).trimEnd()}…` : texto);
    const lineas = citas.map((c) => `${hora12(c.hora)} · ${cortar(c.nombre, 24)}`);
    const pendientes = citas.filter((c) => c.estado === 'pendiente').length;
    if (pendientes > 0) lineas.push(`Por confirmar: ${pendientes}`);
    const titulo = `Mañana tienes ${citas.length} ${citas.length === 1 ? 'cita' : 'citas'}`;
    const texto = lineas.join('\n');
    await guardarAviso({ tipo: 'recordatorio', titulo, texto, fecha: manana });
    await enviarPush({ titulo, texto, link: `${SITIO}?fecha=${manana}` });
  },
);
