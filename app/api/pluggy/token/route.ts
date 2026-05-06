// app/api/pluggy/token/route.ts
import { NextResponse } from 'next/server'
import { PluggyClient } from 'pluggy-sdk'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json().catch(() => ({ userId: undefined }))

    const client = new PluggyClient({
      clientId: process.env.PLUGGY_CLIENT_ID!,
      clientSecret: process.env.PLUGGY_CLIENT_SECRET!,
    })

    const connectToken = await client.createConnectToken(userId)

    return NextResponse.json({ connectToken: connectToken.accessToken })

  } catch (error) {
    console.error('Erro ao gerar token Pluggy:', error)
    return NextResponse.json(
      { error: 'Erro ao conectar com Pluggy' },
      { status: 500 }
    )
  }
}
