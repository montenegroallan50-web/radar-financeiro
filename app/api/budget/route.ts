import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const month  = searchParams.get('month')  // 0-indexed (JS getMonth())
  const year   = searchParams.get('year')

  if (!userId || month === null || !year) {
    return NextResponse.json({ error: 'userId, month e year são obrigatórios' }, { status: 400 })
  }

  const m = parseInt(month)  // 0-indexed
  const y = parseInt(year)

  const pad = (n: number) => String(n).padStart(2, '0')
  const startDate = `${y}-${pad(m + 1)}-01`
  const nextM     = m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }
  const endDate   = `${nextM.y}-${pad(nextM.m + 1)}-01`

  const supabase = createClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('category, amount')
    .eq('user_id', userId)
    .eq('type', 'DEBIT')
    .gte('date', startDate)
    .lt('date', endDate)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const spentByCategory: Record<string, number> = {}
  data?.forEach((t) => {
    const cat = t.category || 'Outros'
    spentByCategory[cat] = (spentByCategory[cat] ?? 0) + Math.abs(t.amount)
  })

  return NextResponse.json({ spentByCategory })
}
