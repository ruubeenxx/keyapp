// Notificaciones locales programadas para Safari iPhone

export async function requestNotificationPermission() {
  try {
    if (!('Notification' in window)) {
      console.log('Este navegador no soporta notificaciones')
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  } catch (err) {
    console.error('Error pidiendo permiso:', err)
    return false
  }
}

// Muestra una notificación inmediata
function mostrarNotificacion(title, body) {
  if (Notification.permission !== 'granted') return
  try {
    new Notification(title, {
      body,
      icon: '/keyapp/baki.png',
      badge: '/keyapp/baki.png',
      tag: title,
    })
  } catch (err) {
    console.log('Notificación no soportada:', err)
  }
}

// Revisa tareas urgentes y muestra notificaciones
export function checkTareasUrgentes(materias) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const hoy = new Date()
  const notificadas = JSON.parse(localStorage.getItem('keyapp-notif-hoy') || '{}')
  const hoyStr = hoy.toDateString()

  // Limpia notificaciones de días anteriores
  if (notificadas.fecha !== hoyStr) {
    localStorage.setItem('keyapp-notif-hoy', JSON.stringify({ fecha: hoyStr, ids: [] }))
  }

  const idsNotificados = notificadas.fecha === hoyStr ? (notificadas.ids || []) : []

  materias.forEach(materia => {
    materia.momentos.forEach(momento => {
      if (!momento.cierra) return

      const cierra = new Date(momento.cierra)
      const dias = Math.ceil((cierra - hoy) / 86400000)
      const pendientes = momento.tareas.filter(t => !t.hecha)
      const notifId = `${materia.id}-${momento.id}-${dias}`

      if (pendientes.length === 0) return
      if (idsNotificados.includes(notifId)) return

      if (dias === 0) {
        mostrarNotificacion(
          `🚨 ¡Cierra HOY! — ${materia.nombre}`,
          `El ${momento.nombre} cierra hoy. Tienes ${pendientes.length} tarea(s) pendiente(s). ¡Amorrr no se te olvide, ya sabes luli! 💪`
        )
        idsNotificados.push(notifId)
      } else if (dias === 1) {
        mostrarNotificacion(
          `⚠️ ¡Mañana cierra! — ${materia.nombre}`,
          `El ${momento.nombre} cierra mañana. ${pendientes.length} tarea(s) pendiente(s). ¿vas a dejar todo para lo ultimo o que?`
        )
        idsNotificados.push(notifId)
      } else if (dias === 3) {
        mostrarNotificacion(
          `📚 Recuerda — ${materia.nombre}`,
          `El ${momento.nombre} cierra en 3 días. ${pendientes.length} tarea(s) pendiente(s). ¡Baki confía en ti! 🐶`
        )
        idsNotificados.push(notifId)
      } else if (dias === 7) {
        mostrarNotificacion(
          `📅 Esta semana — ${materia.nombre}`,
          `El ${momento.nombre} cierra en 7 días. ¡Organízate! 💕`
        )
        idsNotificados.push(notifId)
      }
    })
  })

  // Guarda las notificaciones ya enviadas hoy
  localStorage.setItem('keyapp-notif-hoy', JSON.stringify({
    fecha: hoyStr,
    ids: idsNotificados
  }))
}

// Frase de amor del día al abrir la app
export function notificarFraseDelDia() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const hoy = new Date().toDateString()
  const yaNotificado = localStorage.getItem('keyapp-frase-notif') === hoy
  if (yaNotificado) return

  const frases = [
    'Cada tarea que completas es un paso más hacia tus sueños 💕',
    'Eres increíble, Amor. ¡Hoy también puedes! 🌟',
    'Baki y yo estamos orgullosos de ti 🐶💕',
    'Tú puedes con todo lo que te propones. ¡A estudiar! 📚',
    'Un día a la vez, un logro a la vez. ¡Tú puedes! 💪',
  ]

  const frase = frases[Math.floor(Math.random() * frases.length)]

  setTimeout(() => {
    mostrarNotificacion('💕 Buenos días, Amor', frase)
    localStorage.setItem('keyapp-frase-notif', hoy)
  }, 2000)
}

// Función vacía para no romper importaciones existentes
export function listenForegroundMessages() {
  return () => {}
}