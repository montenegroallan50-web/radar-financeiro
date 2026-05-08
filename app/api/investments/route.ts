import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { getSessionUserId } from '@/lib/supabase-server'
import type { InvestmentType } from '@/lib/mock-data'

function mapPluggyType(type: string | null): InvestmentType {
  switch (type) {
    case 'TREASURE':      return 'tesouro'
    case 'FIXED_INCOME':  return 'cdb_lci'
    case 'STOCK':
    case 'ETF':           return 'acoes_fiis'
    case 'MUTUAL_FUND':   return 'fundos'
    default:              return 'fundos'
  }
}

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const supabase = createClient()
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('user_id', userId)
    .order('balance', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const investments = (data ?? []).map((inv) => ({
    id: inv.pluggy_id,
    name: inv.name ?? '—',
    type: mapPluggyType(inv.type),
    investedAmount: inv.amount ?? 0,
    currentAmount: inv.balance ?? 0,
    returnPercent:
      inv.amount && inv.amount > 0
        ? ((inv.balance - inv.amount) / inv.amount) * 100
        : (inv.annual_rate ?? 0),
    maturityDate: inv.due_date ?? null,
    indexer: inv.rate ?? inv.rate_type ?? '—',
    issuerName: inv.issuer_name ?? null,
  }))

  const patrimonioTotal = investments.reduce((sum, i) => sum + i.currentAmount, 0)

  return NextResponse.json({ investments, patrimonioTotal })
}
