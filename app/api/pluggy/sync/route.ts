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

// Extracts the best available institution name from a Pluggy connector object.
// In sandbox mode the generic test bank reports "Pluggy Bank" — we try
// institution.name and institutionUrl as fallbacks before giving up.
function resolveInstitutionName(connector: Record<string, any>): string {
  const candidates = [
    connector?.institution?.name,
    connector?.institutionName,
    connector?.displayName,
    connector?.name,
  ].filter((v): v is string => typeof v === 'string' && v.trim() !== '')

  const name = candidates[0] ?? 'Banco'

  // For the generic Pluggy sandbox bank, try to extract a real name from the
  // institution URL (e.g. "nubank.com.br" → "Nubank").
  if (/pluggy/i.test(name) && connector?.institutionUrl) {
    try {
      const host = new URL(connector.institutionUrl as string).hostname.replace(/^www\./, '')
      const domain = host.split('.')[0]
      if (domain && !/pluggy/i.test(domain)) {
        return domain.charAt(0).toUpperCase() + domain.slice(1)
      }
    } catch { /* invalid URL, fall through */ }
  }

  return name
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

    // Log the full connector so the team can see exactly what Pluggy returns.
    console.log('[Pluggy Sync] connector:', JSON.stringify(item?.connector ?? {}, null, 2))

    const institutionName = resolveInstitutionName(item?.connector ?? {})
    console.log('[Pluggy Sync] institutionName resolved to:', institutionName)

    const supabase = createClient()
    await supabase.from('connected_accounts').upsert({
      user_id: userId,
      item_id: itemId,
      connector_name: institutionName,
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
