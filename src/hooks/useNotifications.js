import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { db } from '../firebase'
import { doc, setDoc } from 'firebase/firestore'

const VAPID_KEY = 'BMt0NHq_zKQ9_9qnI4E-czThWH83Id8SPgmk8-bz2m1NMdXYt0dBPlZhlfFW2-w6K_jW9rqn8ueUhby7SRN9C90'
const USER_ID = 'keyla'

export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('Permiso de notificaciones denegado')
      return null
    }

    const messaging = getMessaging()
    const token = await getToken(messaging, { vapidKey: VAPID_KEY })

    if (token) {
      // Guarda el token en Firestore para poder mandar notificaciones después
      await setDoc(doc(db, 'tokens', USER_ID), { token, updatedAt: new Date().toISOString() })
      console.log('Token FCM guardado:', token)
      return token
    }
  } catch (err) {
    console.error('Error al obtener token FCM:', err)
    return null
  }
}

export function listenForegroundMessages(onReceive) {
  try {
    const messaging = getMessaging()
    return onMessage(messaging, (payload) => {
      console.log('Notificación recibida en primer plano:', payload)
      onReceive(payload)
    })
  } catch (err) {
    console.error('Error al escuchar mensajes:', err)
    return () => {}
  }
}

// Revisa tareas y programa notificaciones locales como backup
export function checkTareasUrgentes(materias) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const hoy = new Date()
  materias.forEach(materia => {
    materia.momentos.forEach(momento => {
      if (!momento.cierra) return
      const cierra = new Date(momento.cierra)
      const dias = Math.ceil((cierra - hoy) / 86400000)
      const tareasIncompletas = momento.tareas.filter(t => !t.hecha)

      if (tareasIncompletas.length > 0 && dias >= 0 && dias <= 3) {
        new Notification(`⚠️ ${materia.nombre}`, {
          body: dias === 0
            ? `¡El ${momento.nombre} cierra HOY! Tienes ${tareasIncompletas.length} tarea(s) pendiente(s) 💪`
            : `El ${momento.nombre} cierra en ${dias} día(s). ¡Tú puedes, Keyla! 💕`,
          icon: '/keyapp/baki.png',
          badge: '/keyapp/icon-192.png',
          tag: `${materia.id}-${momento.id}`,
        })
      }
    })
  })
}