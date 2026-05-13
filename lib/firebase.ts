import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Evita inicializar o Firebase mais de uma vez
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export function getFirebaseMessaging() {
  // Só funciona no browser, não no servidor
  if (typeof window === 'undefined') return null
  return getMessaging(app)
}

export async function requestNotificationPermission(): Promise<string | null> {
  try {
    const messaging = getFirebaseMessaging()
    if (!messaging) return null

    // Pede permissão para o usuário
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('Permissão negada pelo usuário')
      return null
    }

    // Pega o token único do dispositivo
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    })

    return token
  } catch (error) {
    console.error('Erro ao pedir permissão:', error)
    return null
  }
}

export { onMessage, getFirebaseMessaging as messaging }
