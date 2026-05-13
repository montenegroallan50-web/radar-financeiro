import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { token, title, body, data } = await req.json()

    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/messages:send`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getAccessToken()}`,
        },
        body: JSON.stringify({
          message: {
            token,
            notification: { title, body },
            data: data || {},
            webpush: {
              notification: {
                title,
                body,
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png',
                requireInteraction: true,
              },
              fcm_options: {
                link: 'https://radar-financeiro-seven.vercel.app',
              },
            },
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(JSON.stringify(error))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao enviar notificação:', error)
    return NextResponse.json({ error: 'Erro ao enviar notificação' }, { status: 500 })
  }
}

async function getAccessToken(): Promise<string> {
  const { GoogleAuth } = await import('google-auth-library')

  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
  })

  const client = await auth.getClient()
  const token = await client.getAccessToken()
  return token.token!
}
