importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: "AIzaSyAGWkPu38LsBd1lRZPqkaLtfMDwEHWhfkQ",
  authDomain: "keyapp-bc368.firebaseapp.com",
  projectId: "keyapp-bc368",
  storageBucket: "keyapp-bc368.firebasestorage.app",
  messagingSenderId: "591365328111",
  appId: "1:591365328111:web:8c1f641cf94196cb76df1a"
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification
  self.registration.showNotification(title, {
    body,
    icon: icon || '/keyapp/icon-192.png',
    badge: '/keyapp/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'keyapp-notification',
    renotify: true,
    data: payload.data
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('keyapp') && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow('/keyapp/')
    })
  )
})