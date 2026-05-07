import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { getSessionUserId } from '@/lib/supabase-server'

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

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

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
    // Fetch accounts and item details in parallel
    const [accountsRes, itemRes] = await Promise.all([
      fetch(`https://api.pluggy.ai/accounts?itemId=${conn.item_id}`, {
        headers: { 'X-API-KEY': apiKey },
      }),
      fetch(`https://api.pluggy.ai/items/${conn.item_id}`, {
        headers: { 'X-API-KEY': apiKey },
      }),
    ])

    const accountsData = await accountsRes.json()
    const itemData = await itemRes.json()

    const connector = itemData?.connector ?? {}
    const institutionName: string = connector.name || conn.connector_name
    const imageUrl: string | null = connector.imageUrl ?? null
    const primaryColor: string | null = connector.primaryColor ?? null
    const institutionUrl: string | null = connector.institutionUrl ?? null

    if (accountsData.results?.length > 0) {
      for (const acc of accountsData.results) {
        accounts.push({
          id: acc.id,
          name: institutionName,
          itemId: conn.item_id,
          balance: acc.balance,
          type: acc.type,
          subtype: acc.subtype,
          imageUrl,
          primaryColor,
          institutionUrl,
        })
      }
    }
  }

  return NextResponse.json({ accounts })
}
