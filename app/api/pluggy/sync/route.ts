import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const { itemId } = await request.json()

    const apiKey = await getPluggyApiKey()

    const itemResponse = await fetch(`https://api.pluggy.ai/items/${itemId}`, {
      headers: { 'X-API-KEY': apiKey },
    })
    const item = await itemResponse.json()

    const supabase = createClient()
    await supabase.from('connected_accounts').upsert({
      user_id: userId,
      item_id: itemId,
      connector_name: item.connector.name,
      connector_id: item.connector.id,
      status: item.status,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'item_id' })

    const accountsResponse = await fetch(
      `https://api.pluggy.ai/accounts?itemId=${itemId}`,
      { headers: { 'X-API-KEY': apiKey } }
    )
    const accountsData = await accountsResponse.json()

    for (const account of accountsData.results) {
      const transResponse = await fetch(
        `https://api.pluggy.ai/transactions?accountId=${account.id}&pageSize=50`,
        { headers: { 'X-API-KEY': apiKey } }
      )
      const transData = await transResponse.json()

      const transactions = transData.results.map((t: any) => ({
        user_id: userId,
        account_id: account.id,
        pluggy_id: t.id,
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: t.category,
        date: t.date,
      }))

      if (transactions.length > 0) {
        await supabase
          .from('transactions')
          .upsert(transactions, { onConflict: 'pluggy_id' })
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erro ao sincronizar:', error)
    return NextResponse.json({ error: 'Erro ao sincronizar dados' }, { status: 500 })
  }
}
