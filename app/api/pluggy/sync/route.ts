// app/api/pluggy/sync/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PluggyClient } from 'pluggy-sdk'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { itemId, userId } = await request.json()

    // 1. Cria o cliente Pluggy
    const client = new PluggyClient({
      clientId: process.env.PLUGGY_CLIENT_ID!,
      clientSecret: process.env.PLUGGY_CLIENT_SECRET!,
    })

    // 2. Busca detalhes do item (banco conectado)
    const item = await client.fetchItem(itemId)

    // 3. Salva a conta conectada no Supabase
    const supabase = createClient()
    await supabase.from('connected_accounts').upsert({
      user_id: userId,
      item_id: itemId,
      connector_name: item.connector.name,
      connector_id: item.connector.id,
      status: item.status,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'item_id' })

    // 4. Busca as contas bancárias do item
    const accountsData = await client.fetchAccounts(itemId)

    // 5. Para cada conta, busca as transações
    for (const account of accountsData.results) {
      const transData = await client.fetchTransactions(account.id, {
        pageSize: 50,
      })

      // 6. Salva cada transação no Supabase
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
    return NextResponse.json(
      { error: 'Erro ao sincronizar dados' },
      { status: 500 }
    )
  }
}
