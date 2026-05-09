import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getSessionUserId } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const mes = req.nextUrl.searchParams.get('mes') // ex: "2026-04"
  const supabase = createAdminClient()

  const [profileRes, investmentsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('investments').select('*').eq('user_id', userId),
  ])

  // Filtro de transações por mês
  let query = supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false })
  if (mes) {
    const [ano, m] = mes.split('-').map(Number)
    const inicio = new Date(ano, m - 1, 1).toISOString()
    const fim    = new Date(ano, m, 0, 23, 59, 59).toISOString()
    query = query.gte('date', inicio).lte('date', fim)
  }

  const { data: transactions } = await query
  const txs = transactions ?? []

  const entradas = txs.filter(t => t.type === 'CREDIT').reduce((s, t) => s + Math.abs(t.amount), 0)
  const saidas   = txs.filter(t => t.type === 'DEBIT').reduce((s, t) => s + Math.abs(t.amount), 0)

  const porCategoria: Record<string, number> = {}
  txs.filter(t => t.type === 'DEBIT').forEach(t => {
    const cat = t.category || 'Outros'
    porCategoria[cat] = (porCategoria[cat] || 0) + Math.abs(t.amount)
  })

  // Evolução dos últimos 6 meses (independente do filtro)
  const { data: allTxs } = await supabase
    .from('transactions').select('date,amount,type').eq('user_id', userId)
  const evolucao: Record<string, { entradas: number; saidas: number }> = {}
  ;(allTxs ?? []).forEach(t => {
    const d = new Date(t.date)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
    if (!evolucao[key]) evolucao[key] = { entradas:0, saidas:0 }
    if (t.type === 'CREDIT') evolucao[key].entradas += Math.abs(t.amount)
    else                     evolucao[key].saidas   += Math.abs(t.amount)
  })

  const investments     = investmentsRes.data ?? []
  const patrimonioTotal = investments.reduce((s, i) => s + (i.balance ?? 0), 0)

  return NextResponse.json({
    profile:     profileRes.data ?? {},
    resumo:      { entradas, saidas, saldo: entradas - saidas, totalTransacoes: txs.length },
    porCategoria,
    evolucao,
    investments,
    patrimonioTotal,
    transactions: txs.slice(0, 20),
  })
}
