// app/api/pluggy/token/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // 1. Chama a Pluggy para pegar um token de acesso
    const response = await fetch('https://api.pluggy.ai/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: process.env.PLUGGY_CLIENT_ID,
        clientSecret: process.env.PLUGGY_CLIENT_SECRET,
      }),
    })

    const data = await response.json()

    // 2. Com o token de acesso, pede um "connect token" para o widget
    const connectResponse = await fetch('https://api.pluggy.ai/connect_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': data.apiKey,
      },
      body: JSON.stringify({}),
    })

    const connectData = await connectResponse.json()

    // 3. Retorna o token para o frontend
    return NextResponse.json({ connectToken: connectData.accessToken })

  } catch (error) {
    console.error('Erro ao gerar token Pluggy:', error)
    return NextResponse.json(
      { error: 'Erro ao conectar com Pluggy' },
      { status: 500 }
    )
  }
}
