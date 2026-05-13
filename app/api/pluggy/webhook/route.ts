import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

// Pluggy envia um secret header para validar que é ele quem está chamando
const PLUGGY_WEBHOOK_SECRET = process.env.PLUGGY_WEBHOOK_SECRET ?? ''

export async function POST(req: NextRequest) {
  try {
    // 1. Valida o secret do webhook (segurança)
    const secret = req.headers.get('x-webhook-secret')
    if (PLUGGY_WEBHOOK_SECRET && secret !== PLUGGY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Lê o corpo da requisição
    const body = await req.json()
    const { event, itemId } = body

    console.log('[Pluggy Webhook] Evento recebido:', event, '| itemId:', itemId)

    // 3. Busca o admin client do Supabase
    const supabase = createAdminClient()

    // 4. Descobre qual usuário tem essa conta conectada
    const { data: account } = await supabase
      .from('connected_accounts')
      .select('user_id')
      .eq('item_id', itemId)
      .maybeSingle()

    if (!account) {
      // Item ainda não registrado — pode ser uma conexão nova chegando
      console.log('[Pluggy Webhook] Item não encontrado no Supabase:', itemId)
      return NextResponse.json({ received: true })
    }

    const userId = account.user_id

    // 5. Reage ao tipo de evento
    switch (event) {
      case 'item/created':
      case 'item/updated':
      case 'transactions/created':
      case 'transactions/updated':
      case 'transactions/deleted': {
        // Dispara a sincronização automática para esse usuário
        const syncUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/pluggy/sync`
        await fetch(syncUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, itemId }),
        })
        console.log('[Pluggy Webhook] Sync disparado para usuário:', userId)
        break
      }

      default:
        console.log('[Pluggy Webhook] Evento ignorado:', event)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[Pluggy Webhook] Erro:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
