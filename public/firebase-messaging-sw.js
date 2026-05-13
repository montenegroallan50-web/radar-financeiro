importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyARaeBAXaAJO7e7p1yyQOihle00VAZ2kUg',
  authDomain: 'radar-financeiro-47279.firebaseapp.com',
  projectId: 'radar-financeiro-47279',
  messagingSenderId: '36720509868',
  appId: '1:36720509868:web:0e0a03bbe885f624187009',
})

const messaging = firebase.messaging()

// Recebe notificações quando o app está em segundo plano ou fechado
messaging.onBackgroundMessage((payload) => {
  console.log('Notificação em segundo plano recebida:', payload)

  const { title, body, icon } = payload.notification

  self.registration.showNotification(title, {
    body: body,
    icon: icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: payload.data,
  })
})

// Ao clicar na notificação, abre o app
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow('https://radar-financeiro-seven.vercel.app')
  )
})
