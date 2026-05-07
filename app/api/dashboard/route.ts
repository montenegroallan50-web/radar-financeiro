import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 })

  const supabase = createClient()

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const entradas = transactions
    .filter(t => t.type === 'CREDIT')
    .reduce((a, t) => a + Math.abs(t.amount), 0)

  const saidas = transactions
    .filter(t => t.type === 'DEBIT')
    .reduce((a, t) => a + Math.abs(t.amount), 0)

  const porCategoria: Record<string, number> = {}
  transactions
    .filter(t => t.type === 'DEBIT')
    .forEach(t => {
      const cat = t.category || 'Outros'
      porCategoria[cat] = (porCategoria[cat] || 0) + Math.abs(t.amount)
    })

  const totalGasto = saidas || 1
  const categorias = Object.entries(porCategoria)
    .map(([name, value]) => ({ name, value, pct: Math.round((value / totalGasto) * 100) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  return NextResponse.json({
    entradas,
    saidas,
    categorias,
    totalTransacoes: transactions.length,
  })
}
