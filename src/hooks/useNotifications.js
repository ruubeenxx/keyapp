import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { db } from '../firebase'
import { doc, setDoc } from 'firebase/firestore'

const VAPID_KEY = 'BMt0NHq_zKQ9_9qnI4E-czThWH83Id8SPgmk8-bz2m1NMdXYt0dBPlZhlfFW2-w6K_jW9rqn8ueUhby7SRN9C90'
const USER_ID = 'keyla'

export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('Permiso denegado')
      return null
    }

    // Registra el SW manualmente con la ruta correcta para GitHub Pages
    const swRegistration = await navigator.serviceWorker.register(
      '/keyapp/firebase-messaging-sw.js',
      { scope: '/keyapp/' }
    )
    console.log('SW registrado:', swRegistration)

    const messaging = getMessaging()
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration
    })

    if (token) {
      await setDoc(doc(db, 'tokens', USER_ID), {
        token,
        updatedAt: new Date().toISOString()
      })
      console.log('✅ Token FCM guardado')
      return token
    }
  } catch (err) {
    console.error('Error FCM:', err)
    return null
  }
}

export function listenForegroundMessages(onReceive) {
  try {
    const messaging = getMessaging()
    return onMessage(messaging, (payload) => {
      onReceive(payload)
    })
  } catch (err) {
    return () => {}
  }
}

export function checkTareasUrgentes(materias) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const hoy = new Date()
  materias.forEach(materia => {
    materia.momentos.forEach(momento => {
      if (!momento.cierra) return
      const dias = Math.ceil((new Date(momento.cierra) - hoy) / 86400000)
      const pendientes = momento.tareas.filter(t => !t.hecha)
      if (pendientes.length > 0 && dias >= 0 && dias <= 3) {
        new Notification(`⚠️ ${materia.nombre}`, {
          body: dias === 0
            ? `¡El ${momento.nombre} cierra HOY! ${pendientes.length} tarea(s) pendiente(s) 💪`
            : `El ${momento.nombre} cierra en ${dias} día(s). ¡Tú puedes, Keyla! 💕`,
          icon: '/keyapp/baki.png',
          tag: `${materia.id}-${momento.id}`,
        })
      }
    })
  })
}