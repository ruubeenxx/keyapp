const admin = require('firebase-admin')

// Inicializa Firebase con la cuenta de servicio
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()
const messaging = admin.messaging()

function diasParaCerrar(fecha) {
  const diff = new Date(fecha) - new Date()
  return Math.ceil(diff / 86400000)
}

async function enviarNotificacion(token, title, body) {
  try {
    await messaging.send({
      token,
      notification: { title, body },
      webpush: {
        notification: {
          title,
          body,
          icon: 'https://ruubeenxx.github.io/keyapp/baki.png',
          badge: 'https://ruubeenxx.github.io/keyapp/icon-192.png',
          vibrate: [200, 100, 200],
        },
        fcmOptions: {
          link: 'https://ruubeenxx.github.io/keyapp/'
        }
      }
    })
    console.log('✅ Notificación enviada:', title)
  } catch (err) {
    console.error('❌ Error enviando notificación:', err.message)
  }
}

async function main() {
  console.log('🔍 Revisando tareas de Keyla...')

  // Obtiene el token FCM de Keyla
  const tokenDoc = await db.collection('tokens').doc('keyla').get()
  if (!tokenDoc.exists) {
    console.log('No hay token FCM registrado para Keyla')
    return
  }
  const { token } = tokenDoc.data()

  // Obtiene los datos de Keyla
  const usuarioDoc = await db.collection('usuarios').doc('keyla').get()
  if (!usuarioDoc.exists) {
    console.log('No hay datos para Keyla')
    return
  }

  const { materias = [] } = usuarioDoc.data()
  let notificacionesEnviadas = 0

  // Revisa cada materia y sus momentos
  for (const materia of materias) {
    for (const momento of materia.momentos || []) {
      if (!momento.cierra) continue

      const dias = diasParaCerrar(momento.cierra)
      const tareasIncompletas = (momento.tareas || []).filter(t => !t.hecha)

      if (tareasIncompletas.length === 0) continue

      // Notifica si cierra hoy
      if (dias === 0) {
        await enviarNotificacion(
          token,
          `🚨 ¡Cierra HOY! — ${materia.nombre}`,
          `El ${momento.nombre} cierra hoy y tienes ${tareasIncompletas.length} tarea(s) pendiente(s). ¡Tú puedes, Keyla! 💪`
        )
        notificacionesEnviadas++
      }
      // Notifica si cierra en 1 día
      else if (dias === 1) {
        await enviarNotificacion(
          token,
          `⚠️ ¡Mañana cierra! — ${materia.nombre}`,
          `El ${momento.nombre} cierra mañana. Tienes ${tareasIncompletas.length} tarea(s) pendiente(s). ¡No lo dejes para el último momento! 💕`
        )
        notificacionesEnviadas++
      }
      // Notifica si cierra en 3 días
      else if (dias === 3) {
        await enviarNotificacion(
          token,
          `📚 Recuerda — ${materia.nombre}`,
          `El ${momento.nombre} cierra en 3 días. Tienes ${tareasIncompletas.length} tarea(s) pendiente(s). ¡Baki confía en ti! 🐶`
        )
        notificacionesEnviadas++
      }
    }
  }

  // Frase de amor del día
  await enviarNotificacion(
    token,
    '💕 Buenos días, Keyla',
    'Abre KeyApp para ver tu frase del día y revisar tus tareas. ¡Hoy también puedes! 🌟'
  )

  console.log(`✅ Listo! ${notificacionesEnviadas} notificaciones de tareas enviadas`)
}

main().catch(console.error)
