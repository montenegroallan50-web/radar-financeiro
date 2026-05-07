import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

async function getPluggyApiKey() {
  const response = await fetch('https://api.pluggy.ai/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: process.env.PLUGGY_CLIENT_ID,
      clientSecret: process.env.PLUGGY_CLIENT_SECRET,
    }),
  })
  const data = await response.json()
  return data.apiKey
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 })

  const supabase = createClient()
  const { data: connectedAccounts, error } = await supabase
    .from('connected_accounts')
    .select('*')
    .eq('user_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!connectedAccounts?.length) return NextResponse.json({ accounts: [] })

  const apiKey = await getPluggyApiKey()

  const accounts = []
  for (const conn of connectedAccounts) {
    const res = await fetch(`https://api.pluggy.ai/accounts?itemId=${conn.item_id}`, {
      headers: { 'X-API-KEY': apiKey },
    })
    const data = await res.json()
    if (data.results?.length > 0) {
      for (const acc of data.results) {
        accounts.push({
          id: acc.id,
          name: conn.connector_name,
          itemId: conn.item_id,
          balance: acc.balance,
          type: acc.type,
          subtype: acc.subtype,
        })
      }
    }
  }

  return NextResponse.json({ accounts })
}
