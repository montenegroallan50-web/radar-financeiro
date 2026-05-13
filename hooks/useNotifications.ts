import { useEffect, useState } from 'react'
import { requestNotificationPermission } from '@/lib/firebase'

export function useNotifications() {
  const [token, setToken] = useState<string | null>(null)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPermission(Notification.permission)
    }
  }, [])

  async function requestPermission() {
    const fcmToken = await requestNotificationPermission()

    if (fcmToken) {
      setToken(fcmToken)
      setPermission('granted')

      // Salva o token no Supabase
      await fetch('/api/profile/save-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: fcmToken }),
      })
    } else {
      setPermission('denied')
    }

    return fcmToken
  }

  return { token, permission, requestPermission }
}
